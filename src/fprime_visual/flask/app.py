"""fprime_visual.flask.app: Flask app for fprime-visual

@author thomas-bc
"""

import flask
from flask import request
from pathlib import Path

def construct_app(config: dict):
    """Constructs a Flask app for fprime-visual.
    config is a dictionary of configuration options for the app. Required config options are:
    - SOURCE_DIRS: A list of directories to search for JSON files.
    """

    app = flask.Flask(__name__)
    
    app.config.update(config)

    @app.route('/')
    def index():
        return flask.send_from_directory("static", "index.html")

    @app.route('/get-folder-list')
    def get_folder_list():
        """Get folders to fetch JSON files from. This is being read from the app config."""
        if not isinstance(app.config.get('SOURCE_DIRS'), list):
            return {"folders": []}, 400
        return {"folders": app.config.get('SOURCE_DIRS')}

    @app.route('/get-file-list')
    def get_file_list():
        """Get list of JSON files in the given 'folder' query parameter."""
        folder = request.args.get('folder', default=None)  
        if folder is None:
            return {"jsonFiles": []}, 400
        json_files = Path(folder).glob('*.json')
        file_paths = [str(file.name) for file in json_files]
        return {"jsonFiles": file_paths}

    @app.route('/get-file')
    def get_file():
        """Get file content of the given 'file' query parameter."""
        file = request.args.get('file', default=None)
        if file is None:
            return {"file": None}, 400
        with open(file, 'r') as f:
            contents = f.read()
        return contents

    return app


# For debugging
if __name__ == '__main__':
    # app.run(debug=True)
    app = construct_app({"SOURCE_DIRS": ["/"]})
    app.run(port=7001)
