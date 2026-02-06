# Generated migration to fix product encoding

from django.db import migrations


def fix_product_encoding(apps, schema_editor):
    Product = apps.get_model('shop', 'Product')
    
    pass


def reverse_fix_product_encoding(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0004_add_sample_product'),
    ]

    operations = [
        migrations.RunPython(fix_product_encoding, reverse_fix_product_encoding),
    ]
