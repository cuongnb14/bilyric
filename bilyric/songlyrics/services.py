from .models import *
from django.db import connection


def get_view_of_day(day):
    return SongTracking.objects.filter(created_at__year=day.year, created_at__month=day.month,
                                       created_at__day=day.day).count()


def count_view_everyday():
    with connection.cursor() as cursor:
        cursor.execute(
            "select CAST(created_at AS DATE) as aday, count(id) as viewed from songlyrics_songtracking group by aday")
        rows = cursor.fetchall()
    return rows
