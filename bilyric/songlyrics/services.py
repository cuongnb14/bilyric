
from .models import *


def get_view_of_day(day):
    return SongTracking.objects.filter(created_at__year=day.year, created_at__month=day.month,
                                       created_at__day=day.day).count()
