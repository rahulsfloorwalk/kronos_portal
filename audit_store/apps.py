from django.apps import AppConfig


class AuditStoreConfig(AppConfig):
    name = 'audit_store'

    def ready(self):
        from audit_store.handlers import status_change_report_log_callback
