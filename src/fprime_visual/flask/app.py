####
# app.py:
#
# This file sets up the flask app, and registers the endpoints for the individual APIs supplied by
# this framework.
#
# 
####

import flask
from flask import request
from pathlib import Path
import os

app = flask.Flask(__name__)

@app.route('/')
def index():
    return flask.send_from_directory("static", "index.html")


@app.route('/get-folder-list')
def get_folder_list():
    '''
    Get folder list to fetch JSON files from. We should have a better solution than an env file.
    '''
    # move to controllers.folders.py
    visual_root = os.getenv("FPRIME_VISUAL_ROOT", None)
    if visual_root is None:
        return {"folders": []}
    return {"folders": visual_root.split(':')}


@app.route('/get-file-list')
def get_file_list():
    # # Get the 'folder' query parameter vs. parameter in route?
    # Can't do in route in case there is a leading slash (absolute path)
    folder = request.args.get('folder')  
    if folder is None:
        return flask.jsonify({"jsonFiles": []})

    folder_path = Path(folder)
    files = folder_path.glob('*.json')
    file_paths = [str(file.name) for file in files]
    return flask.jsonify({"jsonFiles": file_paths})


@app.route('/get-file')
def get_file():
    '''Reads in file given in "file" query parameter.'''
    file = request.args.get('file')
    if file is None:
        return flask.jsonify({"file": None})

    with open(file, 'r') as f:
        contents = f.read()
    return contents


if __name__ == '__main__':
    # app.run(debug=True)
    app.run(port=5001)
