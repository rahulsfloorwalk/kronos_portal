from django.db import IntegrityError
from social.models import TwitterHandle

client_handles = [
    {'client_id': 9, 'handle': '@SmaaashLive'},
    {'client_id': 7, 'handle': '@Manyavar_'},
    {'client_id': 12, 'handle': '@iZenica'},
    {'client_id': 4, 'handle': '@audiggn'},
    {'client_id': 4, 'handle': '@AudiDelhi_C'},
    {'client_id': 23, 'handle': '@timezonegames'},
    {'client_id': 16, 'handle': '@ATFitnessIN'},
    {'client_id': 9, 'handle': '@VerbenaMumbai'},
    {'client_id': 9, 'handle': '@pravas_mumbai'},
]
def insert_handles():
    for client_handle in client_handles:
        try:
            twh = TwitterHandle()
            twh.client_id = client_handle.get('client_id')
            twh.twitter_handle = client_handle.get('handle')
            twh.save()
        except IntegrityError:
            print("client with id {} does not exist or already added".format(twh.client_id))
