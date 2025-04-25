from django.http import JsonResponse
from django.db.models import Model
from django.db.models.query import QuerySet
from decimal import Decimal
import json
import datetime

class ModelJSONEncoder(json.JSONEncoder):
    """
    Encoder customizado para converter objetos Django em JSON
    """
    def default(self, obj):
        if isinstance(obj, Model):
            return self.model_to_dict(obj)
        if isinstance(obj, QuerySet):
            return list(obj)
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime.date):
            return obj.isoformat()
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return super().default(obj)
    
    def model_to_dict(self, model):
        """Converte um modelo Django em um dicionário"""
        data = {}
        for field in model._meta.fields:
            field_name = field.name
            field_value = getattr(model, field_name)
            data[field_name] = field_value
        return data

def render_to_json(data, safe=False):
    """
    Converte dados do Django para JSON e retorna uma JsonResponse
    """
    return JsonResponse(data, encoder=ModelJSONEncoder, safe=safe)

def serialize_model(model_instance):
    """
    Serializa uma instância de modelo para um dicionário
    """
    return json.loads(json.dumps(model_instance, cls=ModelJSONEncoder))