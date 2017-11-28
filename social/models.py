from django.contrib.postgres.fields import JSONField
from django.db.models import Model, CharField, FloatField, AutoField, DateTimeField, OneToOneField, BooleanField, ForeignKey
from django.conf import settings
from django.db.models import PROTECT

from client.models import Client


class Facebook(Model):
    id = AutoField(db_column='id', primary_key=True)
    facebook_id = CharField(db_column="facebook_id", max_length=64, blank=True, null=True)
    access_token = CharField(db_column="access_token", max_length=1024, blank=True, null=True)
    profile_data = JSONField(db_column='profile_data', default=dict(), blank=True, null=True)
    created_date = DateTimeField(auto_now_add=True)
    modified_date = DateTimeField(auto_now=True)
    is_verified = BooleanField(db_column='is_verified', default=False, null=False, blank=False)

    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)

class TwitterHandle(Model):
    id = AutoField(db_column='id', primary_key=True)
    client = ForeignKey(Client, related_name='twitter_handle', db_column='client_id', blank=False, on_delete=PROTECT)
    twitter_handle = CharField(db_column="twitter_handle", max_length=100, blank=False, null=False)
    is_enabled = BooleanField(db_column="is_enabled", default=False)

    class Meta:
        unique_together = (("client", "twitter_handle"))

    def __str__(self):
        return "Handle({}): {}, {}".format(self.id, self.twitter_handle, self.client)

class TwitterFeed(Model):
    id = AutoField(db_column='id', primary_key=True)
    tweet_id = CharField(db_column="tweet_id", max_length=100, unique=True, blank=False, null=False)
    tweet_text = CharField(db_column="tweet_text", max_length=1024, blank=False, null=False)
    tweet_created_on = DateTimeField(auto_now=False)
    sentiment_score = FloatField(db_column="sentiment_score")
    sentiment_text = CharField(db_column="sentiment_text", max_length=100, blank=False, null=False)
    tweet_data = JSONField(db_column='tweet_data', default=dict(), blank=False)
    twitter_handle = ForeignKey(TwitterHandle, related_name='twitter_feeds', db_column='twitter_handle_id', blank=False, on_delete=PROTECT)

    def __str__(self):
        return "Tweet: {}: {}".format(self.tweet_created_on, self.tweet_text)
