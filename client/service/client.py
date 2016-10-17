from client.models import Client

class ClientService:
	def save(self, client):
		client.save()
		return client
