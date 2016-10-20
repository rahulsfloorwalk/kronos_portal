from ..models import Location

class LocationService:
	def save(self, location):
		location.save()
		return location
