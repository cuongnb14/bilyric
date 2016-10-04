import requests
import re

from django.shortcuts import render
from lxml import html
import traceback
from django.utils.text import slugify
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from ratelimit.decorators import ratelimit

from bilyric.base.utils import require_ajax
from bilyric.songlyrics.models import Subtitle, Song

RATE = getattr(settings, 'RATE', '10/s')


def select_song(request):
    return render(request, 'frontend/select_song.html')


def create_lyrics(request, song_xml):
    data = {}
    song = Song()
    song.name = request.GET.get("name", "")
    song.artist = request.GET.get("artist", "")
    song.zmp3_xml = song_xml
    song.zmp3_id = request.GET.get("id", "")
    song.user = request.user
    song.visible = 0
    song.bybot = 0
    song.slug = slugify(song.name + song.artist)
    song.save()
    subtitle = Subtitle()
    subtitle.song = song
    subtitle.save()

    data["song"] = song
    return redirect('songlyrics:update_lyrics', song_slug=song.slug, song_id=song.id)


@login_required()
def update_lyrics(request, song_slug, song_id):
    song = Song.objects.get(pk=song_id)
    #if song.user.id is not request.user.id:
        #raise PermissionDenied
    data = {"song": song}
    return render(request, 'frontend/update_lyrics.html', data)


# Ajax part
#########################################################################################

@require_ajax
@csrf_exempt
def ajax_subtitles(request, song_id):
    if (request.method == 'GET'):
        subtitle = Subtitle.objects.get(song_id=song_id)
        subtitle = {'sub1': subtitle.sub1, 'sub2': subtitle.sub2}
        return JsonResponse(subtitle)
    if (request.method == 'POST'):
        if request.user.is_authenticated() and request.user.has_perms('dualsub.change_subtitle'):
            try:
                subtitles = request.POST
                subtitle = Subtitle.objects.get(song_id=song_id)
                subtitle.sub1 = subtitles['sub1']
                subtitle.sub2 = subtitles['sub2']
                subtitle.save()
                data = {"status": "success", "message": "Update subtitle success"}
            except Exception as e:
                data = {"status": "error", "message": str(e)}
        else:
            data = {"status": "error", "message": "Permission denied"}
        return JsonResponse(data)


@ratelimit(key='ip', rate=RATE, block=True)
@csrf_exempt
@login_required(login_url='/administration/login/')
def ajax_song(request, song_id):
    if (request.method == 'POST'):
        try:
            song = Song.objects.get(pk=song_id)
            song.bybot = request.POST.get("bybot", song.bybot)
            song.visible = request.POST.get("visible", song.visible)
            song.zmp3_id = request.POST.get("zmp3_id", song.zmp3_id)
            song.zmp3_xml = request.POST.get("zmp3_xml", song.zmp3_xml)
            song.save()
            data = {"status": "success", "message": "Update song success"}
        except Exception as e:
            data = {"status": "error", "message": str(e)}
    else:
        data = {"status": "error", "message": "404"}
    return JsonResponse(data)


@ratelimit(key='ip', rate=RATE, block=True)
@login_required(login_url='/administration/login/')
def get_zmp3id(request):
    if (request.method == 'GET'):
        EMBED_LINK = "http://mp3.zing.vn/embed/song/"
        SONG_XML_LINK = "http://mp3.zing.vn/html5xml/song-xml/"
        zmp3_link = request.GET.get("zmp3_link", "")
        if zmp3_link != "":
            try:
                m = re.match(r".*/(?P<zmp3id>.+)\.html", zmp3_link)
                zmp3id = m.group('zmp3id')
            except Exception as e:
                data = {"status": "error", "message": "Cannot parse zmp3 id"}
                return JsonResponse(data)
            try:
                page = html.fromstring(requests.get(EMBED_LINK + zmp3id).text)
                zmp3xml = page.xpath("//div[@id='html5player']/@data-xml")[0]
                m = re.match(r".*/(?P<zmp3xml>.+)$", zmp3xml)
                zmp3xml = m.group('zmp3xml')
                zmp3name = ""
                zmp3artist = ""
                try:
                    response = requests.get(SONG_XML_LINK + zmp3xml).json()
                    zmp3name = response["data"][0]["name"]
                    zmp3artist = response["data"][0]["artist"]
                    zmp3lyric = response["data"][0]["lyric"]
                except Exception as e:
                    traceback.print_exc()

                data = {"status": "success", "message": {"zmp3id": zmp3id, "zmp3xml": zmp3xml, "zmp3name": zmp3name,
                                                         "zmp3artist": zmp3artist}}
                return JsonResponse(data)
            except Exception as e:
                traceback.print_exc()
                data = {"status": "error", "message": "Cannot parse zmp3 xml " + EMBED_LINK + zmp3id}
                return JsonResponse(data)

        return JsonResponse({"status": "error", "message": "404"})
