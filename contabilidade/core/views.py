from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def index(request):
    """
    API endpoint inicial. Retorna uma resposta JSON simples em vez de um template.
    """
    return JsonResponse({'message': 'API funcionando corretamente!'})

def pagina_erro_404(request, exception):
    """
    Handler para erros 404. Retorna uma resposta JSON com o erro.
    """
    return JsonResponse({'error': 'Página não encontrada'}, status=404)

