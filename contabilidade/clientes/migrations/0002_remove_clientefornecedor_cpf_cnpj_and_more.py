# Generated by Django 5.1.3 on 2025-04-14 02:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clientes', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='clientefornecedor',
            name='cpf_cnpj',
        ),
        migrations.AddField(
            model_name='clientefornecedor',
            name='cnpj',
            field=models.CharField(blank=True, max_length=18, null=True),
        ),
        migrations.AddField(
            model_name='clientefornecedor',
            name='cpf',
            field=models.CharField(blank=True, max_length=14, null=True),
        ),
        migrations.AddField(
            model_name='clientefornecedor',
            name='tipo_pessoa',
            field=models.CharField(choices=[('fisica', 'Pessoa Física'), ('juridica', 'Pessoa Jurídica')], default='fisica', max_length=10),
        ),
    ]
