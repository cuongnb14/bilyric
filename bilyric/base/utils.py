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
