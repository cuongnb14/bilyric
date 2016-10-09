import traceback

from django.conf import settings
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.http import Http404
from django.shortcuts import render, redirect
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

from ratelimit.decorators import ratelimit

from .models import Song, Subtitle, Favor
from bilyric.base.utils import require_ajax

RATE = getattr(settings, 'RATE', '10/s')


@ratelimit(key='ip', rate=RATE, block=True)
def index(request):
    # return HttpResponse("Hello, world. You're at the polls index.")

    data = {}
    most_songs = Song.objects.filter(Q(zmp3_xml__isnull=False), Q(visible=1)).order_by('-view')[:21]
    last_songs = Song.objects.filter(Q(zmp3_xml__isnull=False), Q(visible=1)).order_by('-created_at')[:21]
    data['most_songs'] = most_songs
    data['last_songs'] = last_songs
    # data['ip'] = request.ip_client
    return render(request, 'frontend/index.html', data)


@ratelimit(key='ip', rate=RATE, block=True)
def zmp3_song(request, song_xml):
    data = {"song_xml": song_xml}
    return render(request, 'frontend/zmp3_song.html', data)


@ratelimit(key='ip', rate=RATE, block=True)
def play_song(request, song_slug, song_id):
    try:
        song = Song.objects.get(pk=song_id)
        # try:
        #     track = Tracking()
        #     track.ip = request.ip_client
        #     track.song_id = song.id
        #     track.save()
        # except Exception as e:
        #     traceback.print_exc()

        data = {'song': song}
        songs = Song.objects.filter(Q(zmp3_xml__isnull=False), Q(visible=1)).order_by('?')[:20]
        song_artist = Song.objects.filter(Q(zmp3_xml__isnull=False), Q(visible=1),
                                          Q(artist__contains=song.artist)).order_by('?')[:7]
        data["songs"] = songs
        data["song_artist"] = song_artist

        if request.user.is_authenticated():
            data["favor"] = Favor.objects.is_favor(request.user, song)
        else:
            data["favor"] = False

        return render(request, 'frontend/song.html', data)
    except Song.DoesNotExist as e:
        raise Http404


@ratelimit(key='ip', rate=RATE, block=True)
def list_song(request):
    q = request.GET.get("q", "")
    if q != "":
        songs = Song.objects.filter(Q(zmp3_xml__isnull=False), Q(visible=1),
                                    Q(name__icontains=q) | Q(artist__icontains=q))
    else:
        songs = Song.objects.filter(Q(zmp3_xml__isnull=False), Q(visible=1))
    paginator = Paginator(songs, 21)  # Show 18 contacts per page
    page = request.GET.get('page', 1)
    try:
        songs = paginator.page(page)
    except PageNotAnInteger:
        songs = paginator.page(1)
    except EmptyPage:
        songs = paginator.page(paginator.num_pages)

    data = {"songs": songs}
    return render(request, 'frontend/list_song.html', data)


@ratelimit(key='ip', rate=RATE, block=True)
@login_required(login_url='/administration/login/')
def favor_song(request):
    favors = Favor.objects.filter(user=request.user)
    songs = [favor.song for favor in favors]

    paginator = Paginator(songs, 21)
    page = request.GET.get('page', 1)
    try:
        songs = paginator.page(page)
    except PageNotAnInteger:
        songs = paginator.page(1)
    except EmptyPage:
        songs = paginator.page(paginator.num_pages)

    data = {"songs": songs}
    return render(request, 'frontend/favor_song.html', data)


@login_required(login_url='/administration/login/')
def user_song(request, username):
    user = User.objects.get(username=username)
    songs = Song.objects.filter(user=user)
    paginator = Paginator(songs, 20)
    page = request.GET.get('page', 1)
    try:
        songs = paginator.page(page)
    except PageNotAnInteger:
        songs = paginator.page(1)
    except EmptyPage:
        songs = paginator.page(paginator.num_pages)
    data = {"songs": songs}
    data["user"] = user
    return render(request, 'frontend/user_song.html', data)


@ratelimit(key='ip', rate=RATE, block=True)
def logout(request):
    auth_logout(request)
    return redirect('/')


# Ajax part
#########################################################################################

@require_ajax
def ajax_increment_view(request, song_id):
    try:
        song = Song.objects.get(id=song_id)
        song.view = song.view + 1
        song.save()
        return JsonResponse({"status": "success", "message": "increment view"})
    except Exception:
        traceback.print_exc()
        return JsonResponse({"status": "error", "message": "error"})


@require_ajax
def ajax_search_song(request):
    if (request.method == 'GET'):
        q = request.GET.get("q", "")
        if q != "":
            songs = Song.objects.filter(Q(visible=1), Q(zmp3_xml__isnull=False),
                                        Q(name__icontains=q) | Q(artist__icontains=q))
            result = []
            for song in songs:
                result.append({'song_slug': song.slug + "-" + str(song.id), 'song_name': song.name, 'song_artist': song.artist,
                               'title': song.name + " - " + song.artist})
        else:
            result = []
        return JsonResponse({'songs': result})


@ratelimit(key='ip', rate=RATE, block=True)
@csrf_exempt
@require_ajax
@login_required(login_url='/administration/login/')
def ajax_favor(request, song_id):
    if request.method == 'POST':
        try:
            song = Song.objects.get(pk=song_id)
            if Favor.objects.is_favor(request.user, song):
                return JsonResponse({"status": "error", "message": "Bài hát đã nằm trong danh sách yêu thích"})
            else:
                favor = Favor(user=request.user, song=song)
                favor.save()
                return JsonResponse({"status": "success", "message": "Đã thêm vào danh sách yêu thích"})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"status": "error", "message": "Error"})

    if request.method == 'DELETE':
        try:
            song = Song.objects.get(pk=song_id)
            favor = Favor.objects.filter(user=request.user, song=song)
            favor.delete()
            return JsonResponse({"status": "success", "message": " Đã xóa khỏi danh sách ưa thích"})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"status": "error", "message": "Bài hát đã được xóa khỏi danh sách ưa thích"})
