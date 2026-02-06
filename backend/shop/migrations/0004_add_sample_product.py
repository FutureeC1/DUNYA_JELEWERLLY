# Generated migration to add sample product with correct encoding

from django.db import migrations
import uuid


def add_sample_product(apps, schema_editor):
    Product = apps.get_model('shop', 'Product')
    
    pass

def reverse_add_sample_product(apps, schema_editor):
    Product = apps.get_model('shop', 'Product')
    Product.objects.filter(slug='serebryanoe-kolco').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0003_create_superuser'),
    ]

    operations = [
        migrations.RunPython(add_sample_product, reverse_add_sample_product),
    ]
