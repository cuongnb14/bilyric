from django.db import models
from bilyric.base.models import TimeStampedModel
from django.contrib.auth.models import User
from django.db.models import Q

class FavorManager(models.Manager):

    def is_favor(self, user, song):
        favor = Favor.objects.filter(Q(user=user), Q(song=song))
        if favor:
            return True
        return False


# Create your models here.
class Song(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    artist = models.CharField(max_length=60, null=True)
    url_video = models.CharField(max_length=255, null=True)
    slug = models.CharField(max_length=200)
    zmp3_id = models.CharField(max_length=45, null=True)
    zmp3_xml = models.CharField(max_length=45, null=True)
    bybot = models.IntegerField(default=1)
    view = models.IntegerField(default=0)
    like = models.IntegerField(default=0)
    visible = models.IntegerField(default=1)

class Subtitle(TimeStampedModel):
    song = models.OneToOneField(
        Song,
        on_delete=models.CASCADE,
        primary_key=True,
    )
    sub1 = models.TextField(null=True)
    sub2 = models.TextField(null=True)

class Favor(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    objects = FavorManager()

class IpAddress(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    ip = models.CharField(max_length=60)
    counter = models.IntegerField(default=1)

class Tracking(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    ip = models.CharField(max_length=60)
    song_id = models.IntegerField()


