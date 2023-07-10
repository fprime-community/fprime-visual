from pathlib import Path
import pytest
import json
from fprime_visual.flask.app import construct_app


@pytest.fixture
def client():
    config = {"SOURCE_DIRS": [str(Path("examples/").resolve())]}
    app = construct_app(config)
    app.config["TESTING"] = True

    with app.app_context():
        with app.test_client() as client:
            yield client


def test_index(client):
    rv = client.get("/")
    assert rv.status_code == 200
    assert b"fprime-visual" in rv.data
    assert b"canvas.js" in rv.data
    # Default theme is dark-blue
    assert b"dark-blue.js" in rv.data


def test_folder_handling(client):
    """Test listing folder list from config."""
    rv = client.get("/get-folder-list")
    assert rv.status_code == 200
    assert "folders" in rv.json
    assert str(Path("examples/").resolve()) in rv.json["folders"]


def test_file_handling(client):
    """Test listing files in source folders."""
    rv = client.get("/get-file-list", query_string={"folder": "examples/"})
    assert rv.status_code == 200
    example_files = [
        "Uplink.json",
        "Parameters.json",
        "Events.json",
        "RateGroups.json",
        "Health.json",
        "Downlink.json",
        "CmdReg.json",
        "Sequencer.json",
        "FaultProtection.json",
        "Time.json",
        "Telemetry.json",
        "CmdReply.json",
        "TextEvents.json",
        "CmdDisp.json",
        "Ref.json",
        "CommDriver.json",
    ]
    assert all(file in rv.json["jsonFiles"] for file in example_files)


def test_file_ingesting(client):
    """Test that the requested file is read in correctly."""
    rv = client.get("/get-file", query_string={"file": "examples/Uplink.json"})
    with open("examples/Uplink.json") as file:
        file_content = json.loads(file.read())

    assert rv.status_code == 200
    assert json.loads(rv.text) == file_content
