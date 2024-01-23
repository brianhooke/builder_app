# Generated by Django 4.2.3 on 2024-01-19 10:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contract_admin', '0009_alter_committed_quotes_pdf'),
    ]

    operations = [
        migrations.CreateModel(
            name='Claims',
            fields=[
                ('claim', models.AutoField(primary_key=True, serialize=False)),
                ('total', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
        ),
        migrations.CreateModel(
            name='Claim_allocations',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item', models.CharField(max_length=100)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('claim', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contract_admin.claims')),
            ],
        ),
    ]