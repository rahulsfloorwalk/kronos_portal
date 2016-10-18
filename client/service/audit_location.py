from client.models import AuditLocation

class AuditLocationService:
	def save(self, auditLocation):
		auditLocation.save()
		return auditLocation