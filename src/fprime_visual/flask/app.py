"""fprime_visual.flask.app: Flask app for fprime-visual

@author thomas-bc
"""

import flask
from flask import request
from pathlib import Path


DEFAULT_THEME = "dark-blue"


def construct_app(config: dict):
    """Constructs a Flask app for fprime-visual.
    config is a dictionary of configuration options for the app. Required config options are:
    - SOURCE_DIRS: A list of directories to search for JSON files.
    """

    app = flask.Flask(__name__)

    app.config.update(config)

    @app.route("/")
    def index():
        return flask.render_template(
            "index.html", theme_name=config.get("THEME_NAME", DEFAULT_THEME)
        )

    @app.route("/<path:path>")
    def static_files(path):
        return flask.send_from_directory("static", path)

    @app.route("/get-folder-list")
    def get_folder_list():
        """Get folders to fetch JSON files from. This is being read from the app config."""
        if not isinstance(app.config.get("SOURCE_DIRS"), list):
            return {"folders": []}, 400
        return {"folders": app.config.get("SOURCE_DIRS")}

    @app.route("/get-file-list")
    def get_file_list():
        """Get list of JSON files in the given 'folder' query parameter."""
        folder = request.args.get("folder", default=None)
        if folder is None:
            return "No folder argument provided", 400
        folder = Path(folder).resolve()
        if str(folder) not in app.config.get("SOURCE_DIRS"):
            return "folder argument not authorized", 403
        json_files = folder.glob("*.json")
        file_paths = [str(file.name) for file in json_files]
        return {"jsonFiles": file_paths}

    @app.route("/get-file")
    def get_file():
        """Get file content of the given 'file' query parameter."""
        file = request.args.get("file", default=None)
        if file is None:
            return "No file argument provided", 400
        file = Path(file)
        parent_path = str(file.parent.resolve())
        if parent_path not in app.config.get("SOURCE_DIRS"):
            return "Forbidden", 403
        else:
            source_index = app.config.get("SOURCE_DIRS").index(parent_path)
        return flask.send_from_directory(app.config.get("SOURCE_DIRS")[source_index], file.name)

    return app
