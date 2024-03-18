# Generated by Django 4.2.3 on 2024-03-17 23:36

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('contract_admin', '0015_committed_allocations_description'),
    ]

    operations = [
        migrations.CreateModel(
            name='Contacts3',
            fields=[
                ('contact_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('contact_name', models.CharField(max_length=200)),
                ('contract_selectable', models.BooleanField(default=True)),
            ],
        ),
    ]