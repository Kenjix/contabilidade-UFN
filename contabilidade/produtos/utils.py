# produtos/utils.py

ICMS_ESTADUAL = {
    'AC': 17.0,
    'AL': 18.0,
    'AP': 18.0,
    'AM': 18.0,
    'BA': 18.0,
    'CE': 18.0,
    'DF': 18.0,
    'ES': 17.0,
    'GO': 17.0,
    'MA': 18.0,
    'MT': 17.0,
    'MS': 17.0,
    'MG': 18.0,
    'PA': 17.0,
    'PB': 18.0,
    'PR': 18.0,
    'PE': 18.0,
    'PI': 18.0,
    'RJ': 20.0,
    'RN': 18.0,
    'RS': 18.0,
    'RO': 17.5,
    'RR': 17.0,
    'SC': 17.0,
    'SP': 18.0,
    'SE': 18.0,
    'TO': 18.0,
}

def get_icms_por_estado(estado):
    return ICMS_ESTADUAL.get(estado.upper(), 17.0)
