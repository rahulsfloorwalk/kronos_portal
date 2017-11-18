
from faker import Faker

from django.test import TestCase

from client.models import Client
from social.models import TwitterHandle, TwitterFeed
from social.service import twitter_client

fake = Faker()

class TwitterTestCase(TestCase):

    def setUp(self):
        self.twitter_handle = fake.word()
        self.client = Client()
        self.client.name = fake.word()
        self.client.email = 'client@foobar.in'
        self.client.phone = fake.word()
        self.client.logo_url = fake.word()
        self.client.save()


    def test_save_handle_for_client(self, ):
        """checks if TwitterHandle is saved is complete"""
        saved_handle = twitter_client.save_handle_for_client(self.client.id, self.twitter_handle)
        self.assertTrue(saved_handle.id is not None)


    def test_get_handle_for_client(self):
        """checks if Twitter handle is returned"""
        twitter_client.save_handle_for_client(self.client.id, self.twitter_handle)
        client_handle = twitter_client.get_handle_for_client(self.client.id)
        self.assertTrue(client_handle.twitter_handle == self.twitter_handle)

    def test_get_feeds_for_handle(self):
        """checks if Feeds are returned"""
        twitter_client.save_handle_for_client(self.client.id, self.twitter_handle)
        client_handle = twitter_client.get_handle_for_client(self.client.id)
        tweets = twitter_client.get_feeds_for_handle(client_handle.id)
        self.assertTrue(len(tweets) == 0)
