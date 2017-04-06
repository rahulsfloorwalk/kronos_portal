from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User

class CaseInsensitiveModelBackend(ModelBackend):
	def authenticate(self, username=None, password=None):
		try:
                        u = username.strip()
                        p = password.strip()
                        user = User.objects.get(email__iexact = u)
                        if user.check_password(p):
                                return user
                        else:
                                return None
		except User.DoesNotExist:
			return None
