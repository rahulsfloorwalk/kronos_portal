from client.models import Client

def save(client):
    client.save()
    return client
