from rest_framework.views import APIView
from rest_framework.response import Response

from registration.models import GROUP_NAME_MANAGER
from registration.mixins import HasGroupPermission
from social.service import twitter_manager

# class FetchTwitterFeedView(APIView):
#     permission_classes = [HasGroupPermission]
#     required_groups = {
#         'GET': [GROUP_NAME_MANAGER],
#     }
#     def get(self, request, format=None):
#         tweets = twitter_manager.get_tweets()
#         return Response({'status': 'OK', 'count': len(tweets)})
