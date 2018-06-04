from django.apps import AppConfig


class AuditStoreConfig(AppConfig):
    name = 'audit_store'

    def ready(self):
        from audit_store.signals import audit_store_status_change
