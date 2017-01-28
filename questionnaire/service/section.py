from ..models import Section

def save(section):
    Section.save(section)
    return section
