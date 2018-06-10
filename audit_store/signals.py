from django.dispatch import Signal
audit_store_status_change = Signal(providing_args=["old_status", "status", "user_actor", "audit_store"])