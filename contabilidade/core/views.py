from django.shortcuts import render
from django.views.generic import TemplateView

class HomeTemplateView(TemplateView):
    template_name = 'core/base.html'

def pagina_erro_404(request, exception):
    return render(request, 'core/404.html', status=404)

