# Generated by Django 4.2 on 2025-04-24 02:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('produtos', '0005_produto_icms_credito_produto_icms_debito'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='produto',
            name='icms_credito',
        ),
        migrations.RemoveField(
            model_name='produto',
            name='icms_debito',
        ),
    ]
