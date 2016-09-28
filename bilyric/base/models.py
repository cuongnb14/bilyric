from django.db import models

class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides selfupdating ``created_at`` and ``modified_at`` fields.
    """
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    modified_at = models.DateTimeField(auto_now=True, null=True)
    class Meta:
        abstract = True
