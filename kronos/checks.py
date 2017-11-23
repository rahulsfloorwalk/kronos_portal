import os
import re

from django.conf import settings
from django.core.checks import Warning, register

ignore_dirs = re.compile("^.*(__pycache__|\.git|frontend|venv|templates|fixtures|egg-info|dist|static|logs)$")

def check_dir(directory):
    messages = []

    if ignore_dirs.match(directory) or directory in settings.STATICFILES_DIRS:
        return messages

    if not os.path.isfile(os.path.join(directory, "__init__.py")) and directory is not settings.BASE_DIR:
        messages.append(
            Warning(
                "Are you sure this directory is not a regular python package? It won't be found by find_packages() when running setup.py",
                hint='add an __init__.py file to the directory',
                obj=directory,
            )
        )

    for d in os.listdir(directory):
        subdir = os.path.join(directory, d)
        if os.path.isdir(subdir):
            messages.extend(check_dir(subdir))

    return messages

@register
def non_package_dir_check(app_configs, **kwargs):
    return check_dir(settings.BASE_DIR)

