# Generated by Django 4.2.3 on 2024-03-18 07:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contract_admin', '0017_rename_contract_selectable_contacts3_contact_selectable'),
    ]

    operations = [
        migrations.RenameField(
            model_name='committed_quotes',
            old_name='supplier',
            new_name='supplierId',
        ),
    ]
