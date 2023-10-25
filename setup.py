#!/usr/bin/env python
####
# fprime_visual Python Package:
#
# F´ Visual is a tool for visualizing FPP models (represented in JSON) in the browser.
#
# Endpoints:
# - fprime-visual: run the F´ Visual UI
#
# ```
###

from setuptools import find_packages, setup


fprime_visual_packages = find_packages("src")
# Setup a python package using setup-tools. This is a newer (and more recommended) technology
# than distutils.
setup(
    ####
    # Package Description:
    #
    # Basic package information. Describes the package and the data contained inside. This
    # information should match the F prime description information.
    ####
    name="fprime_visual",
    use_scm_version={"root": ".", "relative_to": __file__},
    license="Apache 2.0 License",
    description="F Prime model (FPP) visualization tool.",
    long_description="""
This package contains the Python files used to run the F´ Visualization tool. This tool is used to
visualize FPP models.
    """,
    url="https://github.com/nasa/fprime",
    keywords=["fprime", "fpp", "embedded", "nasa"],
    project_urls={"Issue Tracker": "https://github.com/nasa/fprime/issues"},
    # Package author, not F prime author
    author="Thomas Boyer Chammard",
    author_email="Thomas.Boyer.Chammard@jpl.nasa.gov",
    ####
    # Included Packages:
    #
    # Will search for and include all python packages under the "src" directory.  The root package
    # is set to 'src' to avoid package names of the form src.fprime_visual. This will also ensure that
    # files included in MANIFEST.in are included in their respective packages.
    ####
    packages=fprime_visual_packages,  # See above for how fprime-visual packages are found
    package_dir={"": "src"},
    package_data={
        "fprime_visual": ["flask/static/*", "flask/static/*/*", "flask/static/*/*/*"]
    },
    include_package_data=True,
    zip_safe=False,  # HTML templates require normal FIO access.
    ####
    # Entry Points:
    #
    # Defines the list of entry-level (scripts) that are defined by this package. This allows
    # standard use of utilities that ship as part of F prime.
    ####
    entry_points={
        "gui_scripts": ["fprime-visual = fprime_visual.__main__:main"],
    },
    ####
    # Classifiers:
    #
    # Standard Python classifiers used to describe this package.
    ####
    classifiers=[
        # complete classifier list: http://pypi.python.org/pypi?%3Aaction=list_classifiers
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Operating System :: Unix",
        "Operating System :: POSIX",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy",
    ],
    python_requires=">=3.7",
    setup_requires=["setuptools_scm"],
    install_requires=[
        "flask>=3.0.0",
        "flask_compress>=1.11",
        "pytest>=6.2.4",
        "flask_restful>=0.3.8",
    ],
)
