from kronos.exceptions import ObjectNotFound

from ..models import Client

def find_client_by_id(client_id):
    try:
        return Client.objects.get(id=client_id)
    except Client.DoesNotExist as e:
        raise ObjectNotFound from e


def find_all_clients():
    return Client.objects.all()


def save(client):
    client.save()
    return client
