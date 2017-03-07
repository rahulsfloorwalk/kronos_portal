from django.conf import settings

def auth_ga_id(request):
    return {
        "auth_ga_id": settings.AUTH_GA_ID
    }
