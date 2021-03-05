"""
Tests for the learning_sequences REST API.

The goals of this module are to:
* Test the serialization of the REST API.
* Make sure that arguments to the REST API (like masquerading) work properly.
* Prevent accidental breaking of backwards compatibility as we add to the API.

Testing the fine grained logic of, "What should be visible/accessible when you
have a Course + User with these properties?" is the responsibility of the
.api.tests package of this app.

Where possible, seed data using public API methods (e.g. replace_course_outline
from this app, edx-when's set_dates_for_course).
"""
from datetime import datetime, timezone

from django.contrib.auth.models import User  # lint-amnesty, pylint: disable=imported-auth-user, unused-import
from opaque_keys.edx.keys import CourseKey, UsageKey  # lint-amnesty, pylint: disable=unused-import
from rest_framework.test import APITestCase, APIClient

from openedx.core.djangolib.testing.utils import CacheIsolationTestCase
from common.djangoapps.student.tests.factories import UserFactory

from ..api import replace_course_outline
from ..data import CourseOutlineData, CourseVisibility
from ..api.tests.test_data import generate_sections


class CourseOutlineViewTest(CacheIsolationTestCase, APITestCase):  # lint-amnesty, pylint: disable=missing-class-docstring

    @classmethod
    def setUpTestData(cls):  # lint-amnesty, pylint: disable=super-method-not-called
        cls.staff = UserFactory.create(
            username='staff', email='staff@example.com', is_staff=True, password='staff_pass'
        )
        cls.student = UserFactory.create(
            username='student', email='student@example.com', is_staff=False, password='student_pass'
        )
        cls.course_key = CourseKey.from_string("course-v1:OpenEdX+Seq+View")
        cls.course_url = cls.url_for(cls.course_key)
        cls.outline = CourseOutlineData(
            course_key=cls.course_key,
            title="Views Test Course!",
            published_at=datetime(2020, 5, 20, tzinfo=timezone.utc),
            published_version="5ebece4b69dd593d82fe2020",
            entrance_exam_id=None,
            days_early_for_beta=None,
            sections=generate_sections(cls.course_key, [2, 2]),
            self_paced=False,
            course_visibility=CourseVisibility.PUBLIC
        )
        replace_course_outline(cls.outline)

    def setUp(self):
        super().setUp()
        self.client = APIClient()

    @classmethod
    def url_for(cls, course_key):
        return '/api/learning_sequences/v1/course_outline/{}'.format(course_key)

    def test_student_access_denied(self):
        """
        For now, make sure you need staff access bits to use the API.

        This is a temporary safeguard until the API is more complete
        """
        self.client.login(username='student', password='student_pass')
        result = self.client.get(self.course_url)
        assert result.status_code == 403

    def test_non_existent_course_404(self):
        """
        We should 404, not 500, when asking for a course that isn't there.
        """
        self.client.login(username='student', password='student_pass')
        fake_course_key = self.course_key.replace(run="not_real")
        result = self.client.get(self.url_for(fake_course_key))
        assert result.status_code == 403

    def test_deprecated_course_key(self):
        """
        For now, make sure you need staff access bits to use the API.

        This is a temporary safeguard until the API is more complete.
        """
        self.client.login(username='staff', password='staff_pass')
        old_course_key = CourseKey.from_string("OldOrg/OldCourse/OldRun")
        result = self.client.get(self.url_for(old_course_key))
        assert result.status_code == 400

    def test_outline_as_staff(self):
        """
        This is a pretty rudimentary test of a course that's returned.

        We'll want to flesh this out in a lot more detail once the API is more
        complete and the format more stable.
        """
        self.client.login(username='staff', password='staff_pass')
        result = self.client.get(self.course_url)
        data = result.data
        assert data['course_key'] == str(self.course_key)
        assert data['user_id'] == self.staff.id
        assert data['username'] == 'staff'

        # API test client automatically parses these into dates. Should we do
        # the raw form for max compatibility (i.e. guard against serialization
        # of dates changing), or do the parsing for conveninece? Convenience for
        # now.
        assert data['published_at'] == datetime(2020, 5, 20, tzinfo=timezone.utc)
        assert data['published_version'] == "5ebece4b69dd593d82fe2020"

        # Basic outline structure checks
        assert len(data['outline']['sections']) == 2
        assert len(data['outline']['sections'][0]['sequence_ids']) == 2
        assert len(data['outline']['sections'][1]['sequence_ids']) == 2
        assert len(data['outline']['sequences']) == 4

    def test_query_for_other_user(self):
        self.client.login(username='staff', password='staff_pass')
        result = self.client.get(self.course_url + "?user=student")
        data = result.data
        assert data['username'] == 'student'
        assert data['user_id'] == self.student.id
