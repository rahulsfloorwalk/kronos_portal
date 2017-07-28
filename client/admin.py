from django.contrib import admin

from .models import Client, ClientUser, Store

# Register your models here.

admin.site.register(Client)
admin.site.register(ClientUser)
admin.site.register(Store)
