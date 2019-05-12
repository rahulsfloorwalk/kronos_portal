from django.conf import settings

def registration_context():
    return {
        "auth_ga_id": settings.AUTH_GA_ID,
        "TAWK_TO_SRC": settings.TAWK_TO_SRC,
        "COLLECTCDN_ID": settings.COLLECTCDN_ID,

        # Kronos
        "kronos_protocol": settings.KRONOS_PROTOCOL,
        "kronos_domain": settings.KRONOS_DOMAIN,
        "kronos_base_url": settings.KRONOS_BASE_URL,

        # Rhea
        "rhea_protocol": settings.RHEA_PROTOCOL,
        "rhea_domain": settings.RHEA_DOMAIN,
        "rhea_base_url": settings.RHEA_BASE_URL,

        # all footer data
        **settings.FRONTEND_CONFIG["COMMON"],

        "brand_name": settings.BRAND_NAME,
        "brand_shortname": settings.BRAND_SHORTNAME,
    }

def registration_request_context(request):
    return registration_context()
