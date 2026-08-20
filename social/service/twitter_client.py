import logging
import re
from django.conf import settings
from django.db import IntegrityError

from kronos.exceptions import AppLogicError, ObjectNotFound
from social.models import TwitterFeed, TwitterHandle
from tweepy import OAuthHandler, API, TweepError
from textblob import TextBlob
from audit_store.models import AuditStore


_logger = logging.getLogger(__name__)

# def get_handles_for_reportsummary_by_client(client_id):
#     audit_store_ids = AuditStore.objects.filter( audit__audit_cycle__client=client_id ).values_list('audit__audit_cycle__id', flat=True).distinct()
#     audit_stores = AuditStore.objects.filter( audit__audit_cycle__id__in=audit_store_ids, report_summary__isnull=False, report_summary__gt='' ).distinct('audit__audit_cycle__id')
#     return audit_stores

def get_handles_for_reportsummary_by_client(client_id):
    audit_cycles = AuditStore.objects.filter( audit__audit_cycle__client=client_id, report_summary__isnull=False, report_summary__gt='',status__in=['COMPLETED', 'ACCEPTED'] ).values( 'audit__audit_cycle__id', 'audit__audit_cycle__name' ).distinct().order_by('-audit__audit_cycle__id')
    # audit_cycles = AuditStore.objects.filter( audit__audit_cycle__client=client_id, report_summary__isnull=False, report_summary__gt='').values( 'audit__audit_cycle__id', 'audit__audit_cycle__name' ).distinct()
    formatted_audit_cycles = [
        {
            "id": cycle['audit__audit_cycle__id'],
            "name": cycle['audit__audit_cycle__name']
        }
        for cycle in audit_cycles
    ]
    return formatted_audit_cycles

def get_tweets(store):
    reports = []
    fetched_reports = AuditStore.objects.filter(id=store.id)
    for audit_store in fetched_reports:
        parsed_report = {
            'id': audit_store.id,
            'text': audit_store.report_summary,
            'sentiment': get_tweet_sentiment(audit_store.report_summary),
        }
        reports.append(parsed_report)

    return reports



def get_tweet_sentiment(report_summary):
    # api_url = "https://api.example.com/sentiment-analysis"
    # token = 12345
    # headers = {'Authorization': 'Bearer {token}'} 
    # payload = {'text': report_summary}
    # try:
    #     response = requests.post(api_url, headers=headers, json=payload)
    #     if response.status_code == 200:
    #         return response.json().get('sentiment')
    #     else:
    #         return "Unknown"
    # except Exception as e:
    #     print("Error:", e)
    #     return "Unknown"

    sentiment = {}
    analysis = TextBlob(get_clean_tweet(report_summary))
    score = analysis.sentiment.polarity
    sentiment['score'] = score
    if score > 0:
        sentiment['text'] = 'Positive'
    elif score == 0:
        sentiment['text'] = 'Neutral'
    else:
        sentiment['text'] = 'Negative'

    return sentiment

def get_clean_tweet(tweet):
    return ' '.join(re.sub(r"(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split())

def save_handle_for_client(client_id, handle):
    twitter_handle = TwitterHandle()
    twitter_handle.client_id = client_id
    twitter_handle.twitter_handle = handle
    twitter_handle.is_enabled = True
    twitter_handle.save()
    return twitter_handle

def get_handles_for_client(client_id):
    return TwitterHandle.objects.filter(client_id=client_id)

def get_handle_by_client_and_id(client_id, twitter_handle_id):
    try:
        return TwitterHandle.objects.get(client_id=client_id, pk=twitter_handle_id)
    except TwitterHandle.DoesNotExist as e:
        raise ObjectNotFound from e

def get_report_summary_handle_by_client_and_id(client_id, audit_cycle_id):
    try:
        # return AuditStore.objects.filter(audit__audit_cycle__client=client_id, audit__audit_cycle__id=audit_cycle_id)
        return AuditStore.objects.filter( audit__audit_cycle__client=client_id, audit__audit_cycle__id=audit_cycle_id, report_summary__isnull=False, report_summary__gt='',status__in=['COMPLETED', 'ACCEPTED'] )

    except TwitterHandle.DoesNotExist as e:
        raise ObjectNotFound from e

def get_all_audit_store_for_nps_score_by_audit_cycle_id(client_id, audit_cycle_id):
    try:
        return AuditStore.objects.filter( audit__audit_cycle__client=client_id, audit__audit_cycle__id=audit_cycle_id, nps_section__isnull=False, status__in=['COMPLETED', 'ACCEPTED'])
    except AuditStore.DoesNotExist as e:
        raise ObjectNotFound from e
   
def get_feeds_for_report_summary_client_and_handle(client_id, audit_cycle_id):
    report_handle = get_report_summary_handle_by_client_and_id(client_id, audit_cycle_id)
    # report_feeds = AuditStore.objects.filter(id=report_handle)

    # for store in report_handle:
    #     if not store.sentiment_score and not store.sentiment_text and not store.sentiment_main_keywords and not store.sentiment_emotions:
    #         reports = get_tweets(store)
    #         for report in reports:
    #             if 'id' in report:
    #                 audit_store_instance = AuditStore.objects.get(id=report['id'])
    #                 sentiment_score = report.get('sentiment', {}).get('score') 
    #                 sentiment_text = report.get('sentiment', {}).get('text') 
    #                 audit_store_instance.sentiment_score = sentiment_score
    #                 audit_store_instance.sentiment_text = sentiment_text
    #                 audit_store_instance.save()    

    return report_handle
   
def get_over_all_summary(client_id, audit_cycle_id):
    report_handle = get_report_summary_handle_by_client_and_id(client_id, audit_cycle_id)
    total_positive = 0
    total_negative = 0
    total_neutral = 0
    for feed in report_handle:
        sentiment_text = (feed.sentiment_text or "").lower()  # Direct attribute access
        if sentiment_text == "positive":
            total_positive += 1
        elif sentiment_text == "negative":
            total_negative += 1
        elif sentiment_text == "neutral":
            total_neutral += 1  

    total_count = total_positive + total_negative + total_neutral
    return{
        "promoters_count": total_positive,
        "detractors_count": total_negative,
        "passives_count": total_neutral,
        "total_replies": total_count
    }

from collections import defaultdict

# def get_all_audit_store_for_nps_score_by_audit_cycle_ids(client_id, audit_cycle_ids):
#     return ( AuditStore.objects.filter(audit__audit_cycle__client_id=client_id,audit__audit_cycle_id__in=audit_cycle_ids,)
#         .select_related("audit").only("status","nps_section","audit__audit_cycle_id",))

def get_all_audit_store_for_nps_score_by_audit_cycle_ids(client_id, audit_cycle_ids):
    return (
        AuditStore.objects
        .filter(
            audit__audit_cycle__client_id=client_id,
            audit__audit_cycle_id__in=audit_cycle_ids
        )
        .select_related("audit")
        .only("status", "nps_section", "audit__audit_cycle_id")
    )

def get_all_over_all_nps_score(client_id, audit_cycle_ids):
    audit_stores = get_all_audit_store_for_nps_score_by_audit_cycle_ids(
        client_id, audit_cycle_ids
    )

    grouped_stores = defaultdict(list)

    for audit_store in audit_stores:
        grouped_stores[audit_store.audit.audit_cycle_id].append(audit_store)

    response = []

    for audit_cycle_id in audit_cycle_ids:
        stores = grouped_stores.get(audit_cycle_id, [])
        total_audit_store = len(stores)
        total_replies = 0
        detractors_count = 0
        passives_count = 0
        promoters_count = 0

        for audit_store in stores:
            if audit_store.status not in ("COMPLETED", "ACCEPTED"):
                continue

            nps_score = audit_store.nps_section or 0

            if nps_score <= 0:
                continue

            total_replies += 1

            if nps_score <= 6:
                detractors_count += 1
            elif nps_score <= 8:
                passives_count += 1
            else:
                promoters_count += 1

        valid_replies = detractors_count + passives_count + promoters_count

        average_nps_percentage = (
            round(((promoters_count - detractors_count) / float(valid_replies)) * 100)
            if valid_replies else None
        )

        response.append({
            "audit_cycle_id": audit_cycle_id,
            "average_nps_percentage": average_nps_percentage,
            "total_replies": total_replies,
            "total_audit_store": total_audit_store,
            "detractors_count": detractors_count,
            "passives_count": passives_count,
            "promoters_count": promoters_count
        })

    return response

def get_over_all_nps_score(client_id, audit_cycle_id):
    audit_stores = get_all_audit_store_for_nps_score_by_audit_cycle_id(client_id, audit_cycle_id)

    total_nps_score_sum = 0
    total_replies = 0
    total_audit_store = 0
    detractors_count = 0  # NPS scores 0-6
    passives_count = 0    # NPS scores 7-8
    promoters_count = 0   # NPS scores 9-10

    for audit_store in audit_stores:
        total_audit_store += 1
        nps_score = audit_store.nps_section or 0

        if audit_store.status in ['COMPLETED', 'ACCEPTED'] and nps_score > 0:
            total_replies += 1
            if 1 <= nps_score <= 6:
                detractors_count += 1
            elif 7 <= nps_score <= 8:
                passives_count += 1
            elif 9 <= nps_score <= 10:
                promoters_count += 1

    valid_replies = promoters_count + detractors_count + passives_count

    if valid_replies > 0:
        average_nps_percentage = round((promoters_count - detractors_count) / valid_replies * 100)
    else:
        average_nps_percentage = None

    return {
        "average_nps_percentage": average_nps_percentage,
        "total_replies": total_replies,
        "total_audit_store": total_audit_store,
        "detractors_count": detractors_count,
        "passives_count": passives_count,
        "promoters_count": promoters_count,
    }


def get_feeds_for_client_and_handle(client_id, twitter_handle_id):
    twitter_handle = get_handle_by_client_and_id(client_id, twitter_handle_id)
    if twitter_handle.is_enabled:
        twitter_feeds = TwitterFeed.objects.filter(twitter_handle=twitter_handle).order_by('-tweet_created_on')
        return twitter_feeds
    else:
        raise ObjectNotFound("handle not found")

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
