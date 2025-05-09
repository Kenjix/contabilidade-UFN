# Generated by Django 4.2 on 2025-04-24 00:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('produtos', '0004_produto_codigo_produto_descricao_produto_fornecedor'),
    ]

    operations = [
        migrations.AddField(
            model_name='produto',
            name='icms_credito',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Alíquota de ICMS na compra (%)', max_digits=5),
        ),
        migrations.AddField(
            model_name='produto',
            name='icms_debito',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Alíquota de ICMS na venda (%)', max_digits=5),
        ),
    ]
