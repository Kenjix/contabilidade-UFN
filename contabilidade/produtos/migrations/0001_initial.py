from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Produto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100)),
                ('preco_compra', models.DecimalField(decimal_places=2, max_digits=10)),
                ('preco_venda', models.DecimalField(decimal_places=2, max_digits=10)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
