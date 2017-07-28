from django.contrib import admin

from .models import AuditCycle, Audit

# Register your models here.
admin.site.register(AuditCycle)
admin.site.register(Audit)
