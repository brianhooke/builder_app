from django.db import models
from django.core.exceptions import ValidationError


class Categories(models.Model):
    category = models.CharField(max_length=100)
    order_in_list = models.DecimalField(max_digits=10, decimal_places=0)
    def __str__(self):
        return self.category

class Costing(models.Model):
    category = models.ForeignKey(Categories, on_delete=models.CASCADE)
    item = models.CharField(max_length=100)
    contract_budget = models.DecimalField(max_digits=10, decimal_places=2)
    uncommitted = models.DecimalField(max_digits=10, decimal_places=2)
    complete_on_site = models.DecimalField(max_digits=10, decimal_places=2)
    hc_next_claim= models.DecimalField(max_digits=10, decimal_places=2)
    hc_received= models.DecimalField(max_digits=10, decimal_places=2)
    sc_invoiced= models.DecimalField(max_digits=10, decimal_places=2)
    sc_paid= models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.CharField(max_length=500)
    def __str__(self):
        return f"Category: {self.category}, Item: {self.item}, Budget: {self.contract_budget}, Uncommitted: {self.uncommitted}, Complete On Site: {self.complete_on_site}, HC Next Claim: {self.hc_next_claim}, HC Received: {self.hc_received}, SC Invoiced: {self.sc_invoiced}, SC Paid: {self.sc_paid}, Notes: {self.notes}"

class Committed_quotes(models.Model):
    quote = models.AutoField(primary_key=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=100)
    pdf = models.FileField(upload_to='')
    def __str__(self):
        return f"Quote: {self.quote}, Total Cost: {self.total_cost}, Supplier: {self.supplier}"
    
class Committed_allocations(models.Model):
    quote = models.ForeignKey(Committed_quotes, on_delete=models.CASCADE)
    item = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    def clean(self):
        # Check if the item exists in Costing
        if not Costing.objects.filter(item=self.item).exists():
            raise ValidationError({'item': "This item does not exist in Costing"})
    def save(self, *args, **kwargs):
        self.clean()
        super(Committed_allocations, self).save(*args, **kwargs)
    def __str__(self):
        return f"Quote: {self.quote}, Item: {self.item}, Amount: {self.amount}"