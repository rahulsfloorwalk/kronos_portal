import os
import re

from django.conf import settings
from django.core.checks import Warning, register
from django.apps import apps
from django.db.models import ForeignKey, OneToOneField
from django.db.models import CASCADE

ignore_dirs = re.compile("^.*(__pycache__|\.git|frontend|venv|datasets|templates|fixtures|egg-info|dist|static|logs|htmlcov)$")

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


@register
def check_on_delete_cascade_protect(app_configs, **kwargs):
    messages = []

    to_check_apps = app_configs or apps.get_app_configs()

    for app in to_check_apps:
        if app.name not in settings.DEPENDENCY_APPS:
            for model in app.get_models():
                for field in model._meta.get_fields():
                    if type(field) in (ForeignKey, OneToOneField):
                        if field.remote_field.on_delete is CASCADE:
                            messages.append(
                                Warning(
                                    "ForeignObject Relation on_delete policy is set to CASCADE.",
                                    hint='set kwarg on_delete to any one of PROTECT, SET_NULL or DEFAULT',
                                    obj=field,
                                )
                            )
    return messages
