from social.models import TwitterHandle, TwitterFeed
from social.service import twitter_client

def get_tweets():
    handles = TwitterHandle.objects.all()
    scraped_tweets = []
    for handle in handles:
        saved_tweets = twitter_client.save_tweets_for_handle(handle)
        scraped_tweets.append({
            'handle': handle.twitter_handle,
            'tweets': saved_tweets
        })
    return scraped_tweets