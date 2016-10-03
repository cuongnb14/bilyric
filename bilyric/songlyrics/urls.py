from django.conf.urls import url
from . import views
from . import admin

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^zmp3-song/(?P<song_xml>.+)$', views.zmp3_song, name='zmp3_song'),
    url(r'^list-song$', views.list_song, name='list_song'),
    url(r'^song/(?P<song_slug>.+)$', views.play_song, name='play_song'),
    url(r'^favor-song$', views.favor_song, name='favor_song'),
    url(r'^logout/$', views.logout, name='logout')
]

urlpatterns += [
    url(r'^ajax/subtitles/(?P<song_id>\d*)$', admin.ajax_subtitles, name='ajax_subtitles'),
    url(r'^ajax/increment-view/(?P<song_id>\d*)$', views.ajax_increment_view, name='ajax_increment_view'),
    url(r'^ajax/favor/(?P<song_id>\d*)$', views.ajax_favor, name='ajax_favor'),
    url(r'^ajax/search$', views.ajax_search_song, name='ajax_search_song'),
    url(r'^ajax/songs/(?P<song_id>\d*)$', admin.ajax_song, name='ajax_song'),
    url(r'^ajax/get-zmp3id', admin.get_zmp3id, name='get_zmp3id'),
]
