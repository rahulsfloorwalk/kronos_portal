from client.models import Audit

class AuditService:
	def save(self, audit):
		audit.save()
		return audit
