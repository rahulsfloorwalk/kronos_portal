from django.contrib import admin
from django.contrib.admin import ModelAdmin

from .models import AuditCycle, Audit


class AuditCycleAdmin(ModelAdmin):
    list_filter = ('client', 'type')


class AuditAdmin(ModelAdmin):
    list_filter = ('audit_cycle',)


# Register your models here.
admin.site.register(AuditCycle, AuditCycleAdmin)
admin.site.register(Audit, AuditAdmin)
