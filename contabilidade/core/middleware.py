class DisableCSRFMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/'):            
            setattr(request, '_dont_enforce_csrf_checks', True) #Desabilita a verificação CSRF para requisições a API        
        response = self.get_response(request)
        return response