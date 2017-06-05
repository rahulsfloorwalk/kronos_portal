import logging

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User

from auditor.models import ProfileInfo

logger = logging.getLogger(__name__)

class CaseInsensitiveModelBackend(ModelBackend):
    def authenticate(self, username=None, password=None):
        #logger.debug("got username: %s, password: %s", username, password)
        u = username.strip()
        p = password.strip()
        try:
            if u.isnumeric() and len(u) is 10:
                #logger.debug("username is numeric")
                user = ProfileInfo.objects.get(mobile_number__iexact=u).user
            else:
                #logger.debug("username is NOT numeric")
                user = User.objects.get(email__iexact = u)
        except (ProfileInfo.DoesNotExist, User.DoesNotExist) as e:
            #logger.debug("User or Profile not found for username: %s", username)
            return None

        if user.check_password(p):
            #logger.debug("successfully authenticated: %s", username)
            return user
        else:
            #logger.debug("password check failed for: %s", username)
            return None
