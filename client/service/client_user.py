from django.db.transaction import atomic
from django.db.utils import IntegrityError
from django.contrib.auth.models import User, Group

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_CLIENT

from ..models import ClientUser

@atomic
def insert(client, full_name, email, password, is_active=True):
    try:
        if password == "":
            raise AppLogicError("password cannot be blank")

        user = User()
        user.email = email
        user.username = email
        user.set_password(password)
        user.is_active = is_active
        user.save()
        user.groups.add(Group.objects.get(name=GROUP_NAME_CLIENT))
        user.save()

        client_user = ClientUser()
        client_user.client = client
        client_user.full_name = full_name
        client_user.user = user
        client_user.save()

        return client_user
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e


@atomic
def update(client_user_id, client, full_name, email, password="", is_active=True):
    try:
        client_user = ClientUser.objects.get(pk=client_user_id)

        client_user.client = client
        client_user.full_name = full_name
        client_user.user.email = email
        client_user.user.username = email
        client_user.user.is_active = is_active

        if password != "":
            client_user.user.set_password( password)

        client_user.user.save()
        client_user.save()

        return client_user
    except ClientUser.DoesNotExist as e:
        raise ObjectNotFound from e
    except IntegrityError as e:
        raise AppLogicError("a user with this email already exists in the system") from e
