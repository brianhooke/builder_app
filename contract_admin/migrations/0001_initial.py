# Generated by Django 4.2.3 on 2023-12-20 01:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Categories',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Costing',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item', models.CharField(max_length=100)),
                ('contract_budget', models.DecimalField(decimal_places=2, max_digits=10)),
                ('committed', models.DecimalField(decimal_places=2, max_digits=10)),
                ('invoiced', models.DecimalField(decimal_places=2, max_digits=10)),
                ('prepayments', models.DecimalField(decimal_places=2, max_digits=10)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contract_admin.categories')),
            ],
        ),
    ]
