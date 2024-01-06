import csv
from django.shortcuts import render
from .forms import CSVUploadForm
from .models import Costing, Categories
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
from django.db.models import Sum


def contract_admin(request):
    form = CSVUploadForm()  # Instantiate your form
    costings = Costing.objects.all()  # Retrieve all Costing objects
    totals = {
        'total_contract_budget': Costing.objects.aggregate(Sum('contract_budget'))['contract_budget__sum'] or 0,
        'total_committed': Costing.objects.aggregate(Sum('committed'))['committed__sum'] or 0,
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
        'totals': totals,
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
            
            for row in reader:
                category, created = Categories.objects.get_or_create(category=row['category'])
                Costing.objects.create(
                    category=category,
                    item=row['item'],
                    contract_budget=row['contract_budget'],
                    committed=row['committed'],
                    uncommitted=row['uncommitted'],
                    complete_on_site=row['complete_on_site'],
                    hc_next_claim=row['hc_next_claim'],
                    hc_received=row['hc_received'],
                    sc_invoiced=row['sc_invoiced'],
                    sc_paid=row['sc_paid'],
                    notes=row['notes']
                )
            return HttpResponse("CSV file uploaded successfully")
    else:
        form = CSVUploadForm()
    
    return render(request, 'contract_admin.html', {'form': form})

def update_costs(request):
    if request.method == 'POST':
        costing_id = request.POST.get('id')
        committed = request.POST.get('committed')
        uncommitted = request.POST.get('uncommitted')
        
        # Make sure you're handling type conversion and validation properly here
        try:
            costing = Costing.objects.get(id=costing_id)
            costing.committed = committed
            costing.uncommitted = uncommitted
            costing.save()
            return JsonResponse({'status': 'success'})
        except Costing.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Costing not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)