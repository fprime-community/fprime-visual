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

    folder_map = {path.name: path.parent for path in [Path(item) for item in app.config.get("SOURCE_DIRS", [])]}

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
        return {"folders": list(folder_map.keys())}, 200 if folder_map else 400

    @app.route("/get-file-list")
    def get_file_list():
        """Get list of JSON files in the given 'folder' query parameter."""
        folder = request.args.get("folder", default=None)
        if folder is None:
            return "No folder argument provided", 400
        if folder not in folder_map:
            return "Invalid folder argument provided", 403

        folder = Path(folder_map[folder] / folder).resolve()
        if str(folder) not in app.config.get("SOURCE_DIRS"):
            return "folder argument not authorized", 403
        json_files = folder.glob("*.json")
        file_paths = [str(file.name) for file in json_files]
        return {"jsonFiles": file_paths}

    @app.route("/get-file")
    def get_file():
        """Get file content of the given 'file' query parameter."""
        file_path = request.args.get("file", default=None)
        if file_path is None:
            return "No file argument provided", 400
        file_path = Path(file_path)
        parent_path = str(file_path.parent.name)
        if parent_path not in folder_map:
            return "Invalid file argument provided", 403
        parent_path = str(Path(folder_map[parent_path] / parent_path).resolve())
        if parent_path not in app.config.get("SOURCE_DIRS"):
            return "Forbidden", 403
        else:
            source_index = app.config.get("SOURCE_DIRS").index(parent_path)
        return flask.send_from_directory(app.config.get("SOURCE_DIRS")[source_index], file_path.name)

    return app
