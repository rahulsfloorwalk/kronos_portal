from ..models import Store

def save(store):
    store.save()
    return store
