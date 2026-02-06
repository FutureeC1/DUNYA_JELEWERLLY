# Generated migration to create superuser

from django.contrib.auth import get_user_model
from django.db import migrations

User = get_user_model()

def create_superuser(apps, schema_editor):
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123'
    )

def reverse_create_superuser(apps, schema_editor):
    User.objects.filter(username='admin').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0002_order_customer_telegram_username'),
    ]

    operations = [
        migrations.RunPython(create_superuser, reverse_create_superuser),
    ]
