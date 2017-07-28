from django.contrib import admin

from .models import ProfileInfo, AdditionalInfo, BankInfo, AuditApplication

# Register your models here.

admin.site.register(ProfileInfo)
admin.site.register(AdditionalInfo)
admin.site.register(BankInfo)
admin.site.register(AuditApplication)
