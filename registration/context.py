from django.conf import settings

def auth_ga_id(request):
    return {
        "auth_ga_id": settings.AUTH_GA_ID,
        "TAWK_TO_SRC": settings.TAWK_TO_SRC,
    }
