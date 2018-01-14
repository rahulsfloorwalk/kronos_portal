import os
import sys

from subprocess import call
from setuptools import setup, find_packages

version = '1.0.0'

if sys.argv[-1] == 'build_frontend':
    os.chdir('frontend')
    call(["npm","install"])
    call(["npm","run","build-prod"])
    os.chdir('..')

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

