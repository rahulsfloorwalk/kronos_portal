from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User

from auditor.models import ProfileInfo

class CaseInsensitiveModelBackend(ModelBackend):
    def authenticate(self, username=None, password=None):
        u = username.strip()
        p = password.strip()
        try:
            if u.isnumeric() and len(u) is 10:
                user = ProfileInfo.objects.get(mobile_number__iexact=u).user
            else:
                user = User.objects.get(email__iexact = u)
        except (ProfileInfo.DoesNotExist, User.DoesNotExist) as e:
            return None

        if user.check_password(p):
            return user
        else:
            return None
