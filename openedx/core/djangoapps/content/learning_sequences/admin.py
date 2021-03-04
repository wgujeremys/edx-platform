from datetime import datetime
from enum import Enum
import json

from django.contrib import admin
from django.utils.html import escape, format_html
from opaque_keys import OpaqueKey
import attr

from .api import get_course_outline
from .models import LearningContext


class LearningContextAdmin(admin.ModelAdmin):
    list_display = (
        'context_key',
        'title',
        'published_at',
        'published_version',
        'modified'
    )
    readonly_fields = (
        'context_key',
        'title',
        'published_at',
        'published_version',
        'created',
        'modified',
        'outline',
    )
    search_fields = ['context_key', 'title']
    actions = ['rebuild_selected', 'rebuild_missing', 'rebuild_all']

    def outline(self, obj):
        def json_serializer(_obj, _field, value):
            if isinstance(value, OpaqueKey):
                return str(value)
            elif isinstance(value, Enum):
                return value.value
            elif isinstance(value, datetime):
                return value.isoformat()
            return value

        outline_data = get_course_outline(obj.context_key)
        outline_data_dict = attr.asdict(
            outline_data,
            recurse=True,
            value_serializer=json_serializer,
        )
        outline_data_json = json.dumps(outline_data_dict, indent=2, sort_keys=True)
        return format_html("<pre>\n{}\n</pre>", outline_data_json)

    def rebuild_selected(modeladmin, request, queryset):
        pass
    rebuild_selected.short_description="Rebuild Outlines for selected courses"

    def rebuild_missing(modeladmin, request, queryset):
        pass
    rebuild_missing.short_description="Rebuild Outlines for courses that don't already have them."

    def rebuild_all(modeladmin, request, queryset):
        pass
    rebuild_all.short_description="Rebuild Outlines for all courses"

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    def has_change_permission(self, request, _obj=None):
        """
        Disallow edits.

        This app rebuilds automatically based off of course publishes. Any
        manual edits will be wiped out the next time someone touches the course,
        so it's better to disallow this in the admin rather than to pretend this
        works and have it suddenly change back when someone edits the course.
        """
        return False

    def has_delete_permission(self, request, _obj=None):
        """
        Disallow deletes.

        Deleting these models can have far reaching consequences and delete a
        lot of related data in other parts of the application/project. We should
        only do update through the API, which allows us to rebuild the outlines.
        """
        return False


admin.site.register(LearningContext, LearningContextAdmin)
