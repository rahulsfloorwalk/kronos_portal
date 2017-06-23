import os
import sys
import logging

from subprocess import call
from setuptools import setup, find_packages

version = '1.0.0'

_logger = logging.getLogger(__name__)

if sys.argv[-1] == 'build_frontend':
    _logger.info("cd frontend/")
    os.chdir('frontend')

    if not os.path.isfile('config.js'):
        logger.error("cannot build frontend without config.js")
        sys.exit(1)

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

