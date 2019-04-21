from django.test import TestCase
from expects import expect, have_key, equal

from kronos.cache_headers import whitenoise_add_header

class WhitenoiseCacheHeaderTest(TestCase):
    def test_cache_no_header(self):
        inputs = (
            ("/foo/bar.css","https://foo.bar/foo/bar.css"),
            ("/foo/bar.js","https://foo.bar/foo/bar.js"),
            ("/foo.woff","https://foo.bar/foo.woff"),
            ("/foo/bar.ttf","https://foo.bar/foo/bar.ttf"),
        )
        for path, url in inputs:
            headers = {}
            whitenoise_add_header(headers, path, url)
            expect(headers).to(equal({}))

    def test_cache_never_header(self):
        inputs = (
            ("index.html", "https://foo.bar/index.html"),
            ("/foo/bar/index.html","https://foo.bar/foo/bar/index.html"),
        )
        for path, url in inputs:
            headers = {}
            whitenoise_add_header(headers, path, url)
            expect(headers).to(have_key("Cache-Control", "no-store"))

    def test_cache_forever_header(self):
        inputs = (
            ("jquery.543adf31.min.js", "https://foo.bar/jquery.543adf31.min.js"),
            ("jquery.543adf31.bundle.js", "https://foo.bar/jquery.543adf31.bundle.js"),
            ("jquery.543adf31.js", "https://foo.bar/jquery.543adf31.js"),
            ("jquery.543adf31.min.css", "https://foo.bar/jquery.543adf31.min.css"),
            ("jquery.543adf31.bundle.css", "https://foo.bar/jquery.543adf31.bundle.css"),
        )
        for path, url in inputs:
            headers = {}
            whitenoise_add_header(headers, path, url)
            expect(headers).to(have_key("Cache-Control", "max-age=86400, public, immutable"))
