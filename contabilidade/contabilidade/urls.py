from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('produtos/', include('produtos.urls')),
    path('clientes/', include('clientes.urls')),
]

handler404 = 'core.views.pagina_erro_404'