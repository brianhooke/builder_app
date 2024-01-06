from django.db import models

class Categories(models.Model):
    category = models.CharField(max_length=100)
    order_in_list = models.DecimalField(max_digits=10, decimal_places=0)

    def __str__(self):
        return self.category

    
class Costing(models.Model):
    category = models.ForeignKey(Categories, on_delete=models.CASCADE)
    item = models.CharField(max_length=100)
    contract_budget = models.DecimalField(max_digits=10, decimal_places=2)
    committed = models.DecimalField(max_digits=10, decimal_places=2)
    uncommitted = models.DecimalField(max_digits=10, decimal_places=2)
    complete_on_site = models.DecimalField(max_digits=10, decimal_places=2)
    hc_next_claim= models.DecimalField(max_digits=10, decimal_places=2)
    hc_received= models.DecimalField(max_digits=10, decimal_places=2)
    sc_invoiced= models.DecimalField(max_digits=10, decimal_places=2)
    sc_paid= models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.CharField(max_length=500)

    def __str__(self):
        return f"Category: {self.category}, Item: {self.item}, Budget: {self.contract_budget}, Committed: {self.committed}, Uncommitted: {self.uncommitted}, Complete On Site: {self.complete_on_site}, HC Next Claim: {self.hc_next_claim}, HC Received: {self.hc_received}, SC Invoiced: {self.sc_invoiced}, SC Paid: {self.sc_paid}, Notes: {self.notes}"

