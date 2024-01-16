import csv
from django.shortcuts import render
from .forms import CSVUploadForm
from .models import Costing, Categories, Committed_quotes, Committed_allocations
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
from django.db.models import Sum
from django.core.files.base import ContentFile
import json
import base64
import uuid
from django.core import serializers
from django.forms.models import model_to_dict
from django.core.files.storage import default_storage
from django.core.exceptions import ObjectDoesNotExist

 
def contract_admin(request):
    form = CSVUploadForm()  # Instantiate your form
    costings = Costing.objects.all()  # Retrieve all Costing objects
    # Convert each 'costing' object to a dictionary and add 'committed'
    costings = [model_to_dict(costing) for costing in costings]
    for costing in costings:
        category = Categories.objects.get(pk=costing['category'])
        costing['category'] = category.category
    committed_allocations = Committed_allocations.objects.all()
    # Calculate the sums for each item
    committed_allocations_sums = Committed_allocations.objects.values('item').annotate(total_amount=Sum('amount'))
    # Convert the sums to a dictionary for easier access in the template
    committed_allocations_sums_dict = {item['item']: item['total_amount'] for item in committed_allocations_sums}
    # Append 'committed' to 'items'
    for costing in costings:
        costing['committed'] = committed_allocations_sums_dict.get(costing['item'], 0)    # New: Retrieve a list of items for the dropdown
    items = [{'item': costing['item'], 'uncommitted': costing['uncommitted'], 'committed': costing['committed']} for costing in costings]
    # Retrieve all Committed_quotes and Committed_allocations objects
    committed_quotes = Committed_quotes.objects.all()
    committed_quotes_json = serializers.serialize('json', committed_quotes)
    committed_allocations_json = serializers.serialize('json', committed_allocations)
    total_committed = sum(costing['committed'] for costing in costings)
    totals = {
        'total_contract_budget': Costing.objects.aggregate(Sum('contract_budget'))['contract_budget__sum'] or 0,
        'total_committed': total_committed,
        'total_uncommitted': Costing.objects.aggregate(Sum('uncommitted'))['uncommitted__sum'] or 0,
        'total_complete_on_site': Costing.objects.aggregate(Sum('complete_on_site'))['complete_on_site__sum'] or 0,
        'total_hc_next_claim': Costing.objects.aggregate(Sum('hc_next_claim'))['hc_next_claim__sum'] or 0,
        'total_hc_received': Costing.objects.aggregate(Sum('hc_received'))['hc_received__sum'] or 0,
        'total_sc_invoiced': Costing.objects.aggregate(Sum('sc_invoiced'))['sc_invoiced__sum'] or 0,
        'total_sc_paid': Costing.objects.aggregate(Sum('sc_paid'))['sc_paid__sum'] or 0,
    }
    totals['total_forecast_budget'] = totals['total_committed'] + totals['total_uncommitted']
    context = {
        'form': form,
        'costings': costings,
        'items': items,  # Add items to context
        'totals': totals,
        'committed_quotes': committed_quotes_json,
        'committed_allocations': committed_allocations_json,  # Add committed_allocations to context
    }
    return render(request, 'contract_admin.html', context)

def upload_csv(request):
    if request.method == 'POST':
        form = CSVUploadForm(request.POST, request.FILES)
        if form.is_valid():
            csv_file = request.FILES['csv_file']
            decoded_file = csv_file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)
            print(next(reader))  # This will print the first row of the CSV to your console
            # Delete existing data
            Costing.objects.all().delete()
            for row in reader:
                category, created = Categories.objects.get_or_create(category=row['category'])
                Costing.objects.create(
                    category=category,
                    item=row['item'],
                    contract_budget=row['contract_budget'],
                    uncommitted=row['uncommitted'],
                    complete_on_site=row['complete_on_site'],
                    hc_next_claim=row['hc_next_claim'],
                    hc_received=row['hc_received'],
                    sc_invoiced=row['sc_invoiced'],
                    sc_paid=row['sc_paid'],
                    notes=row['notes']
                )
            return JsonResponse({"message": "CSV file uploaded successfully"}, status=200)
        else:
            return JsonResponse({"message": str(form.errors)}, status=400)
    else:
        form = CSVUploadForm()

def update_costs(request):
    if request.method == 'POST':
        costing_id = request.POST.get('id')
        uncommitted = request.POST.get('uncommitted')
        # Make sure you're handling type conversion and validation properly here
        try:
            costing = Costing.objects.get(id=costing_id)
            costing.uncommitted = uncommitted
            costing.save()
            return JsonResponse({'status': 'success'})
        except Costing.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Costing not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)


@csrf_exempt
def commit_data(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        data = json.loads(request.body)
        total_cost = data['total_cost']
        pdf_data = data['pdf']
        supplier = data['supplier']
        allocations = data.get('allocations')
        format, imgstr = pdf_data.split(';base64,')
        ext = format.split('/')[-1]
        data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)
        quote = Committed_quotes.objects.create(total_cost=total_cost, pdf=data, supplier=supplier)  # Add supplier here
        for item in allocations:
            amount = item['amount']
            if amount == '':
                amount = '0'
            Committed_allocations.objects.create(quote=quote, item=item['item'], amount=amount)
            # Update the Costing.uncommitted field
            uncommitted = item['uncommitted']
            Costing.objects.filter(item=item['item']).update(uncommitted=uncommitted)
        return JsonResponse({'status': 'success'})

@csrf_exempt
def update_costing(request):
    if request.method == 'POST':
        costing_id = request.POST.get('costing_id')
        uncommitted = request.POST.get('uncommitted')
        # Get the Costing object and update it
        costing = Costing.objects.get(id=costing_id)
        costing.uncommitted = uncommitted
        costing.save()
        # Return a JSON response
        return JsonResponse({'status': 'success'})

@csrf_exempt
def delete_quote(request):
    if request.method == 'DELETE':
        data = json.loads(request.body)
        quote_id = data.get('id')
        if quote_id is not None:
            try:
                quote = Committed_quotes.objects.get(pk=quote_id)
                quote.delete()
                return JsonResponse({'status': 'success'})
            except Committed_quotes.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Quote not found'}, status=404)
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def update_quote(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        quote_id = data.get('quote_id')
        total_cost = data.get('total_cost')
        supplier = data.get('supplier')
        allocations = data.get('allocations')
        try:
            quote = Committed_quotes.objects.get(pk=quote_id)
        except Committed_quotes.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Quote not found'})
        quote.total_cost = total_cost
        quote.supplier = supplier
        quote.save()
        # Delete the existing allocations for the quote
        Committed_allocations.objects.filter(quote_id=quote_id).delete()
        # Save the new allocations
        for allocation in allocations:
            alloc = Committed_allocations(quote_id=quote_id, item=allocation['item'], amount=allocation['amount'])
            alloc.save()
            # Update the Costing.uncommitted field
            uncommitted = allocation['uncommitted']
            Costing.objects.filter(item=allocation['item']).update(uncommitted=uncommitted)
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})