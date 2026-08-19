from django.contrib import admin

from .models import Client, ClientUser, Store,MPOrder,MPClientProfileInfo,DashboardWidgetvisibilityAccess
# Register your models here.

admin.site.register(Client)
admin.site.register(ClientUser)
admin.site.register(Store)
admin.site.register(MPOrder)
admin.site.register(MPClientProfileInfo)
admin.site.register(DashboardWidgetvisibilityAccess)