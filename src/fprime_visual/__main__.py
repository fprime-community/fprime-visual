from fprime_visual.flask.app import construct_app

import os
import argparse
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(
        description="fprime_visual: A tool for visualizing FPP models."
    )

    parser.add_argument(
        "--source-dir",
        default=[os.getcwd()],
        action="append",
        help="Specify source directories (JSON files). If not provided, uses current directory.",
        required=False,
    )
    parser.add_argument(
        "--gui-port",
        default=7000,
        help="Set the GUI server port [default: 7000]",
        required=False,
    )
    parser.add_argument(
        "--theme",
        default="dark-blue",
        help="GUI theme [dark|dark-blue|light-seafoam]",
        required=False,
    )
    parser.add_argument(
	"--host",
	default="127.0.0.1",
	help="IP address to host fprime-visual",
	required=False,
    )

    args = parser.parse_args()
    return args


def get_config(args):
    """Generates a dictionary from the given arguments. This dictionary will be used to configure the Flask app."""
    config = {}

    source_dirs = list(set([str(Path(source_dir).resolve()) for source_dir in args.source_dir]))
    config["SOURCE_DIRS"] = source_dirs
    config["THEME_NAME"] = args.theme

    return config


def main():
    args = parse_args()

    config = get_config(args)

    app = construct_app(config)

    app.run(host=args.host,port=args.gui_port)


if __name__ == "__main__":
    main()
