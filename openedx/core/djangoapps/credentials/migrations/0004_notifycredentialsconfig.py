# Generated by Django 1.11.15 on 2018-08-17 18:14


import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('credentials', '0003_auto_20170525_1109'),
    ]

    operations = [
        migrations.CreateModel(
            name='NotifyCredentialsConfig',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('change_date', models.DateTimeField(auto_now_add=True, verbose_name='Change date')),
                ('enabled', models.BooleanField(default=False, verbose_name='Enabled')),
                ('arguments', models.TextField(blank=True, default='', help_text='Useful for manually running a Jenkins job. Specify like "--start-date=2018 --courses A B".')),
                ('changed_by', models.ForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL, verbose_name='Changed by')),
            ],
            options={
                'verbose_name': 'notify_credentials argument',
            },
        ),
    ]
