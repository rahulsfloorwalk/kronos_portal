#!/bin/env python
import os
import sys

from subprocess import call
from setuptools import setup, find_packages

version = '4.0.79'

if __name__ == "__main__":

    if sys.argv[-1] == 'build_frontend':
        os.chdir('frontend')
        call(["npm","install"])
        call(["npm","run","build-prod"])
        os.chdir('..')

        sys.exit()

    if sys.argv[-2] == 'bump':
        call(["bumpversion", "--commit", "--tag", "--current-version", version, "--tag-name", "{new_version}", sys.argv[-1], "setup.py", "./frontend/package.json"])
        sys.exit()

    if sys.argv[-1] == 'test':
        call(["pytest"])
        sys.exit()

    setup(
        name='kronos',
        version=version,
        description='Kronos portal for FloorWalk',
        author='FloorWalk',
        author_email='contactus@floorwalk.in',
        packages=find_packages(),
        include_package_data=True,
    )

