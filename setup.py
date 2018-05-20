import os
import sys

from subprocess import call
from setuptools import setup, find_packages

version = '1.8.0'

if sys.argv[-1] == 'build_frontend':
    os.chdir('frontend')
    call(["npm","install"])
    call(["npm","run","build-prod"])
    os.chdir('..')

    sys.exit()

if sys.argv[-2] == 'bump':
    call(["bumpversion", "--commit", "--tag", "--current-version", version, sys.argv[-1], "setup.py", "./frontend/package.json"])
    sys.exit()

if __name__ == "__main__":
    setup(
        name='kronos',
        version=version,
        description='Kronos portal for FloorWalk',
        author='FloorWalk',
        author_email='contactus@floorwalk.in',
        packages=find_packages(),
        include_package_data=True,
    )

