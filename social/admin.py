from django.contrib import admin
from django.contrib.admin import ModelAdmin

from .models import Facebook, TwitterFeed, TwitterHandle

from .service import twitter_client

# Register your models here.
admin.site.register(Facebook)
admin.site.register(TwitterFeed)


def fetch_tweets(modeladmin, request, handles):
    count = 0
    for handle in handles:
        count += len(twitter_client.save_tweets_for_handle(handle))
    msg = "fetched {} tweets for {} handles".format(count, len(handles))
    modeladmin.message_user(request, msg)


fetch_tweets.short_description = "Fetch Tweets for selected handles"

class TwitterHandleAdmin(ModelAdmin):
    actions = [fetch_tweets]


admin.site.register(TwitterHandle, TwitterHandleAdmin)
