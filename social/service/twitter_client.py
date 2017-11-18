import json
import logging
import re
from django.conf import settings
from django.db import IntegrityError

from kronos.exceptions import AppLogicError, ObjectNotFound
from social.models import TwitterFeed, TwitterHandle
from tweepy import OAuthHandler, API, TweepError
from textblob import TextBlob
from client_rest.serializers import TwitterFeedSerializer

_logger = logging.getLogger(__name__)

def save_handle_for_client(client_id, handle):
    twitter_handle = TwitterHandle()
    twitter_handle.client_id = client_id
    twitter_handle.twitter_handle = handle
    twitter_handle.save()
    return twitter_handle

def get_handles_for_client(client_id):
    twitter_handle = TwitterHandle.objects.filter(client_id=client_id)
    return twitter_handle

def get_feeds_for_client(client_id):
    handles = get_handles_for_client(client_id)
    handles_feed = []
    for handle in handles:
        feed = {}
        twitter_feed = get_feeds_for_handle(handle)
        feed['handle'] = handle.twitter_handle
        feed['data'] = TwitterFeedSerializer(twitter_feed, many=True).data
        handles_feed.append(feed)
    return handles_feed



def get_feeds_for_handle(twitter_handle):
    if twitter_handle.is_enabled:
        twitter_feeds = TwitterFeed.objects.filter(twitter_handle=twitter_handle).order_by('tweet_created_on')
        return twitter_feeds
    else:
        return None

def save_tweets_for_handle(twitter_handle):
    try:
        twitter_client = TwitterClient()
    except TweepError as e:
        raise AppLogicError from e

    handle = twitter_handle.twitter_handle
    tweets = twitter_client.get_tweets(handle, 1000)
    saved_tweets = []
    for tweet in tweets:
        twitter_feed = TwitterFeed()
        twitter_feed.twitter_handle = twitter_handle
        twitter_feed.tweet_id = tweet.get('id', '')
        twitter_feed.tweet_text = tweet.get('text', '')
        twitter_feed.tweet_created_on = tweet.get('created_at')
        twitter_feed.sentiment_score = tweet.get('sentiment', {}).get('score', 0)
        twitter_feed.sentiment_text = tweet.get('sentiment', {}).get('text', '')
        twitter_feed.tweet_data = tweet.get('tweet_data')
        try:
            twitter_feed.save()
            saved_tweets.append(twitter_feed)
        except IntegrityError:
            _logger.warn("tweet with id %s not inserted", twitter_feed.tweet_id)
            continue
    return saved_tweets



class TwitterClient(object):

    def __init__(self):
        consumer_key = settings.TWITTER_FEEDS['CONSUMER_KEY']
        consumer_secret = settings.TWITTER_FEEDS['CONSUMER_SECRET']
        access_token = settings.TWITTER_FEEDS['ACCESS_TOKEN']
        access_token_secret = settings.TWITTER_FEEDS['ACCESS_TOKEN_SECRET']

        self.auth = OAuthHandler(consumer_key, consumer_secret)
        self.auth.set_access_token(access_token, access_token_secret)
        self.api = API(self.auth)

    def get_clean_tweet(self, tweet):
        return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])"
                               "| (\w +:\ / \ / \S +)", " ", tweet).split())

    def get_tweet_sentiment(self, tweet):
        sentiment = {}
        analysis = TextBlob(self.get_clean_tweet(tweet))
        score = analysis.sentiment.polarity
        sentiment['score'] = score
        if score > 0:
            sentiment['text'] = 'Positive'
        elif score == 0:
            sentiment['text'] = 'Neutral'
        else:
            sentiment['text'] = 'Negative'

        return sentiment

    def get_tweets(self, twitter_handle, count):
        try:
            tweets = []
            fetched_tweets = self.api.search(q=twitter_handle, count=count)
            for tweet in fetched_tweets:
                parsed_tweet = {}
                parsed_tweet['id'] = tweet.id_str
                parsed_tweet['text'] = tweet.text
                parsed_tweet['lang'] = tweet.lang
                parsed_tweet['created_at'] = tweet.created_at
                parsed_tweet['retweet_count'] = tweet.retweet_count
                parsed_tweet['likes'] = tweet.favorite_count
                parsed_tweet['sentiment'] = self.get_tweet_sentiment(tweet.text)
                parsed_tweet['tweet_data'] = tweet._json
                if tweet.retweet_count > 0:
                    if parsed_tweet not in tweets:
                        tweets.append(parsed_tweet)
                else:
                    tweets.append(parsed_tweet)
        except TweepError as e:
            raise ObjectNotFound from e
        return tweets