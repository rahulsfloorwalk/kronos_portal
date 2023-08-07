from django.contrib import admin
from .models import City,MPTax,MPCategory,MPSolution,MPSolutionQuestion,MPSolutionProofTagList,MPSolutionOtherDetails

# Register your models here.
admin.site.register(City)
admin.site.register(MPTax)
admin.site.register(MPCategory)
admin.site.register(MPSolution)
admin.site.register(MPSolutionQuestion)
admin.site.register(MPSolutionOtherDetails)
admin.site.register(MPSolutionProofTagList)