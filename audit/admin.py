from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.forms import Textarea

from .models import AuditCycle, Audit, ReportAttribute


class AuditCycleAdmin(ModelAdmin):
    list_filter = ('client', 'type')

    def formfield_for_dbfield(self, db_field, **kwargs):
        formfield = super(AuditCycleAdmin, self).formfield_for_dbfield(db_field, **kwargs)
        if db_field.name == 'post_approval_description':
            formfield.widget = Textarea(attrs=formfield.widget.attrs)
        return formfield


class AuditAdmin(ModelAdmin):
    list_filter = ('audit_cycle',)


class ReportAttributeAdmin(ModelAdmin):
    list_filter = ('audit_cycle',)


# Register your models here.
admin.site.register(AuditCycle, AuditCycleAdmin)
admin.site.register(Audit, AuditAdmin)
admin.site.register(ReportAttribute, ReportAttributeAdmin)
