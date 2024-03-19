from django.db import models
from django.core.exceptions import ValidationError
import uuid

class Categories(models.Model):
    category = models.CharField(max_length=100)
    order_in_list = models.DecimalField(max_digits=10, decimal_places=0)
    def __str__(self):
        return self.category

# class Contacts3(models.Model):
#     contact_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     contact_name = models.CharField(max_length=200)
#     contact_selectable = models.BooleanField(default=True)
#     def __str__(self):
#         return self.contact_name
    
class Contacts(models.Model):
    contact_pk = models.AutoField(primary_key=True)
    contact_id = models.CharField(max_length=36, default=uuid.uuid4, editable=False)
    contact_name = models.CharField(max_length=200)
    contact_selectable = models.BooleanField(default=True)
    def __str__(self):
        return self.contact_name
    

class Costing(models.Model):
    id = models.AutoField(primary_key=True)
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
    pdf = models.FileField(upload_to='')
    contact_pk = models.ForeignKey('Contacts', on_delete=models.CASCADE)
    def __str__(self):
        return f"Quote: {self.quote}, Total Cost: {self.total_cost}, Contact PK: {self.contact_pk}, PDF: {self.pdf}"
            
class Committed_allocations(models.Model):
    quote = models.ForeignKey(Committed_quotes, on_delete=models.CASCADE)
    item = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=100, null=True)
    def clean(self):
        # Check if the item exists in Costing
        if not Costing.objects.filter(item=self.item).exists():
            raise ValidationError({'item': "This item does not exist in Costing"})
    def save(self, *args, **kwargs):
        self.clean()
        super(Committed_allocations, self).save(*args, **kwargs)
    def __str__(self):
        return f"Quote: {self.quote}, Item: {self.item}, Amount: {self.amount}, Description: {self.description}"
    
class Claims(models.Model):
    claim = models.AutoField(primary_key=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    pdf = models.FileField(upload_to='')
    def __str__(self):
        return f"Claim: {self.claim}, Total: {self.total}, PDF: {self.pdf}"

class Claim_allocations(models.Model):
    claim = models.ForeignKey(Claims, on_delete=models.CASCADE)
    item = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    associated_quote = models.ForeignKey('Committed_quotes', on_delete=models.SET_NULL, null=True, blank=True)  # Add this line
    def clean(self):
        # Check if the item exists in Costing
        if not Costing.objects.filter(item=self.item).exists():
            raise ValidationError({'item': "This item does not exist in Costing"})
    def save(self, *args, **kwargs):
        self.clean()
        super(Claim_allocations, self).save(*args, **kwargs)
    def __str__(self):
        return f"Claim: {self.claim}, Item: {self.item}, Amount: {self.amount}, Associated Quote: {self.associated_quote}"
    
class Hc_claims(models.Model):
    hc_claim = models.AutoField(primary_key=True)
    def __str__(self):
        return f"HC Claim: {self.hc_claim}"

class Hc_claim_lines(models.Model):
    hc_claim = models.ForeignKey(Hc_claims, on_delete=models.CASCADE)
    item_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    def clean(self):
        # Check if the item exists in Costing
        if not Costing.objects.filter(id=self.item_id).exists():
            raise ValidationError({'item_id': "This item does not exist in Costing"})
    def save(self, *args, **kwargs):
        self.clean()
        super(Hc_claim_lines, self).save(*args, **kwargs)
    def __str__(self):
        return f"HC CLaim: {self.hc_claim}, Item ID: {self.item_id}, Amount: {self.amount}"