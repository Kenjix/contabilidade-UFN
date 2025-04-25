class DisableCSRFMiddleware:
    """
    Middleware que desabilita a proteção CSRF para requisições à API.
    Isso permite que o frontend faça requisições POST sem problemas de CSRF.
    
    IMPORTANTE: Usar apenas em desenvolvimento. Em produção, configure CORS corretamente.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/'):
            # Desabilita a verificação CSRF para requisições à API
            setattr(request, '_dont_enforce_csrf_checks', True)
        
        response = self.get_response(request)
        return response