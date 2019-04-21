import logging
import re

_logger = logging.getLogger(__name__)

cache_forever = re.compile(r"\.[a-f0-9]{5,}\.((min|bundle)\.)?(js|css)$")
cache_never = re.compile(r"\.html$")

def whitenoise_add_header(headers, path, url):
    if cache_never.search(path):
        _logger.debug("caching never: {}".format(url))
        headers["Cache-Control"] = "no-store"
    elif cache_forever.search(path):
        _logger.debug("caching forever: {}".format(url))
        headers["Cache-Control"] = "max-age=86400, public, immutable"
