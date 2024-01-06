from django.contrib import admin
from .models import Categories, Costing

class CategoriesAdmin(admin.ModelAdmin):
    list_display = ("category", "order_in_list")

class CostingAdmin(admin.ModelAdmin):
    list_display = ("category", "item", "contract_budget", "committed", "uncommitted", "complete_on_site", "hc_next_claim", "hc_received", "sc_invoiced", "sc_paid", "notes")

admin.site.register(Categories, CategoriesAdmin)
admin.site.register(Costing, CostingAdmin)