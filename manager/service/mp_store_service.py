from manager.models import MPStore
def save(store):
    store.save()
    return store