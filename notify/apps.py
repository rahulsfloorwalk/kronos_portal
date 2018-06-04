from django.apps import AppConfig


class NotifyConfig(AppConfig):
    name = 'notify'

    def ready(self):
        from notify.handlers import status_change_callback
