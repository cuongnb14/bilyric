from django.contrib.sitemaps import Sitemap
from bilyric.songlyrics.models import Song
from django.core.urlresolvers import reverse
from datetime import datetime


class SongSitemap(Sitemap):
    changefreq = "weekly"
    priority = 1

    def items(self):
        return Song.objects.all()

    def lastmod(self, obj):
        return obj.modified_at

    def location(self, obj):
        return reverse("songlyrics:play_song", args=[obj.slug, obj.id])


class StaticViewSitemap(Sitemap):
    priority = 0.5
    changefreq = 'weekly'

    def items(self):
        return ['songlyrics:list_song', 'songlyrics:index']

    def lastmod(self, obj):
        return datetime.now()

    def location(self, item):
        return reverse(item)
