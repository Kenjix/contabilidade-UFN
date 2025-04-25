from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_not_found(request):
    return JsonResponse({'error': 'Endpoint não encontrado'}, status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/clientes/', include('clientes.urls')),
    path('api/produtos/', include('produtos.urls')),
    path('api/vendas/', include('vendas.urls')),
    path('api/estoque/', include('estoque.urls')),
    
    path('api/', include('core.urls')),
    
    re_path(r'^api/.*$', api_not_found),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)