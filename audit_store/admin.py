from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import AuditStore


class AuditStoreAdmin(ModelAdmin):
    list_display = ('id', 'status', 'audit_date')
    search_fields = ['id']
    exclude = ['audit', 'user', 'check_points', 'attribute_data', 'moderator_status', 'moderator_comment',
               'report_summary', 'report_summary_original', 'qa_rating']


admin.site.register(AuditStore, AuditStoreAdmin)
