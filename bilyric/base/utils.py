from django.core.exceptions import PermissionDenied
from functools import wraps


def require_ajax(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if request.is_ajax():
            return view(request, *args, **kwargs)
        else:
            raise PermissionDenied()

    return wrapped


def get_client_ip(request):
    try:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    except Exception:
        return None
