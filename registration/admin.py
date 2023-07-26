from django.contrib import admin

from .models import Verification,OTPVerification

# Register your models here.
admin.site.register(Verification)

admin.site.register(OTPVerification)
