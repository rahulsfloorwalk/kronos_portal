from django.core.cache import cache
from functools import wraps
from rest_framework.response import Response

def rate_limit(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        ip = self.request.META.get('REMOTE_ADDR')
        cache_key = f'rate_limit:{ip}'
        count = cache.get(cache_key, 0)
        if count >= 150:
            return Response({'error': 'Rate limit exceeded.'}, status=429)

        cache.set(cache_key, count + 1, 60)  # Limit to 20 requests per minute

        return view_func(self, request, *args, **kwargs)

    return wrapper
