from django.contrib import admin
from .models import Categories, Costing, Committed_quotes, Committed_allocations, Claims, Claim_allocations, Hc_claims, Hc_claim_lines, Contacts

class CategoriesAdmin(admin.ModelAdmin):
    list_display = ("category", "order_in_list")

class ContactsAdmin(admin.ModelAdmin):
    list_display = ("contact_pk", "contact_id", "contact_name", "contact_selectable")

class CostingAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "item", "contract_budget", "uncommitted", "complete_on_site", "hc_next_claim", "hc_received", "sc_invoiced", "sc_paid", "notes")

class Committed_quotesAdmin(admin.ModelAdmin):
    list_display = ("quote", "total_cost", "pdf", "contact_pk")

class Committed_allocationsAdmin(admin.ModelAdmin):
    list_display = ("quote", "item", "amount", "description")

class ClaimsAdmin(admin.ModelAdmin):
    list_display = ("claim", "total", "pdf")

class Claim_allocationsAdmin(admin.ModelAdmin):
    list_display = ("claim", "item", "amount", "associated_quote")  

class Hc_claimsAdmin(admin.ModelAdmin):
    list_display = ('hc_claim',)

class HcClaimLinesAdmin(admin.ModelAdmin):
    list_display = ('hc_claim', 'get_item', 'amount')
    def get_item(self, obj):
        costing = Costing.objects.filter(id=obj.item_id).first()
        return costing.item if costing else 'Not found'
    get_item.short_description = 'Item'  # Sets column name in admin panel        

admin.site.register(Categories, CategoriesAdmin)
admin.site.register(Costing, CostingAdmin)
admin.site.register(Committed_quotes, Committed_quotesAdmin)
admin.site.register(Committed_allocations, Committed_allocationsAdmin)
admin.site.register(Claims, ClaimsAdmin)
admin.site.register(Claim_allocations, Claim_allocationsAdmin)
admin.site.register(Hc_claim_lines, HcClaimLinesAdmin)
admin.site.register(Hc_claims, Hc_claimsAdmin)
admin.site.register(Contacts, ContactsAdmin)