from django.contrib import admin
from .models import Categories, Costing, Committed_quotes, Committed_allocations

class CategoriesAdmin(admin.ModelAdmin):
    list_display = ("category", "order_in_list")

class CostingAdmin(admin.ModelAdmin):
    list_display = ("category", "item", "contract_budget", "committed", "uncommitted", "complete_on_site", "hc_next_claim", "hc_received", "sc_invoiced", "sc_paid", "notes")

class Committed_quotesAdmin(admin.ModelAdmin):
    list_display = ("quote", "total_cost", "pdf")

class Committed_allocationsAdmin(admin.ModelAdmin):
    list_display = ("quote", "item", "amount")

admin.site.register(Categories, CategoriesAdmin)
admin.site.register(Costing, CostingAdmin)
admin.site.register(Committed_quotes, Committed_quotesAdmin)
admin.site.register(Committed_allocations, Committed_allocationsAdmin)