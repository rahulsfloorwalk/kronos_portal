from django.contrib import admin

from .models import Facebook, TwitterFeed, TwitterHandle

# Register your models here.
admin.site.register(Facebook)
admin.site.register(TwitterFeed)
admin.site.register(TwitterHandle)
