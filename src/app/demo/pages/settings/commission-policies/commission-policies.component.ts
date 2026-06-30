import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { CommissionPolicyFormComponent } from 'src/app/shared/components/commission-policy-form/commission-policy-form.component';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { CommissionItemType } from 'src/app/shared/services/pricing.service';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-commission-policies',
  standalone: true,
  imports: [CommonModule, SharedModule, SubHeaderComponent, CommissionPolicyFormComponent],
  templateUrl: './commission-policies.component.html',
  styleUrl: './commission-policies.component.scss'
})
export class CommissionPoliciesComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  activeTab: 'travels' | 'outings' | 'hajj' = 'travels';
  items: any[] = [];
  totalRecords: number = 0;
  isLoading: boolean = false;
  searchedWord: string = '';
  selectedPricingModel: string | null = null;

  commissionModelOptions = [
    { label: 'Rate', value: '1' },
    { label: 'Fixed', value: '2' },
    { label: 'Committed', value: '3' }
  ];


  // Dialog State
  displayDialog: boolean = false;
  selectedItem: any = null;

  constructor(
    private travelService: TravelTripsService,
    private outingService: OutingService,
    private hajjService: HajjUmmrahService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Loaded lazily on table initialize
  }

  onTabChange(tab: 'travels' | 'outings' | 'hajj'): void {
    this.activeTab = tab;
    this.searchedWord = '';
    this.selectedPricingModel = null;
    this.items = [];
    this.totalRecords = 0;
    if (this.dt) {
      this.dt.reset();
    }
  }

  loadData(event: TableLazyLoadEvent): void {
    this.isLoading = true;
    const basePayload = TableRequestBuilder.build(event, this.searchedWord);

    if (this.activeTab === 'travels') {
      this.travelService.getAllTravels(basePayload).subscribe({
        next: (res) => {
          if (res.success) {
            this.items = (res.data.data || []).map((item: any) => ({
              ...item,
              policy: (item.itemPricingPolicy && item.itemPricingPolicy.pricingModel) ? item.itemPricingPolicy : null
            }));
            this.totalRecords = res.data.itemsCount || 0;
            this.isLoading = false;
          } else {
            this.isLoading = false;
          }
        },
        error: () => (this.isLoading = false)
      });
    } else if (this.activeTab === 'outings') {
      this.outingService.getAllOutings(basePayload).subscribe({
        next: (res) => {
          if (res.success) {
            this.items = (res.data.data || []).map((item: any) => ({
              ...item,
              price: item.miniPrice || item.maxPrice || 0,
              policy: (item.itemPricingPolicy && item.itemPricingPolicy.pricingModel) ? item.itemPricingPolicy : null
            }));
            this.totalRecords = res.data.itemsCount || 0;
            this.isLoading = false;
          } else {
            this.isLoading = false;
          }
        },
        error: () => (this.isLoading = false)
      });
    } else if (this.activeTab === 'hajj') {
      this.hajjService.getAllManasik(basePayload).subscribe({
        next: (res) => {
          if (res.success) {
            this.items = (res.data.data || []).map((item: any) => ({
              ...item,
              policy: (item.itemPricingPolicy && item.itemPricingPolicy.pricingModel) ? item.itemPricingPolicy : null
            }));
            this.totalRecords = res.data.itemsCount || 0;
            this.isLoading = false;
          } else {
            this.isLoading = false;
          }
        },
        error: () => (this.isLoading = false)
      });
    }
  }

  onSearch(event?: any): void {
    if (this.dt) {
      this.dt.reset();
    }
  }

  clearSearchFilter(): void {
    this.searchedWord = '';
    this.onSearch();
  }

  clearPricingModelFilter(): void {
    this.selectedPricingModel = null;
    if (this.dt) {
      this.dt.filter(null, 'ItemPricingPolicy.PricingModel', 'equals');
    }
  }

  clearAllFilters(): void {
    this.searchedWord = '';
    this.selectedPricingModel = null;
    if (this.dt) {
      this.dt.reset();
    }
  }

  getPricingModelLabel(value: string): string {
    const option = this.commissionModelOptions.find(o => o.value === value);
    return option ? option.label : '';
  }

  get activeItemType(): number {
    if (this.activeTab === 'travels') return CommissionItemType.Travel;
    if (this.activeTab === 'outings') return CommissionItemType.Outing;
    return CommissionItemType.Hajj;
  }

  getVendorName(item: any): string {
    return item.companyDto?.name || item.vendor?.name || item.vendorName || '-';
  }

  getVendorId(item: any): any {
    return item.companyDto?.id || item.vendor?.id || item.companyId || item.vendorId || item.companyDtoId;
  }

  navigateToVendor(item: any): void {
    const id = this.getVendorId(item);
    if (id) {
      this.router.navigate(['/vendor-details', id]);
    }
  }

  openPolicyDialog(item: any): void {
    this.selectedItem = item;
    this.displayDialog = true;
  }

  onSavePolicySuccess(updatedPolicy: any): void {
    this.displayDialog = false;
    if (this.selectedItem) {
      this.selectedItem.policy = updatedPolicy;
    }
    this.selectedItem = null;
    if (this.dt) {
      this.dt.reset(); // Reload to refresh prices and calculations
    }
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.selectedItem = null;
  }

  getPolicyBadgeClass(policy: any): string {
    if (!policy || !policy.pricingModel) return 'badge-secondary';
    if (policy.pricingModel === 1) return 'badge-success';
    if (policy.pricingModel === 2) return 'badge-info';
    return 'badge-warning';
  }

  getPolicyBadgeText(policy: any): string {
    if (!policy || !policy.pricingModel) return 'Not Configured';
    if (policy.pricingModel === 1) return `${policy.tripsCommissionValue}% Percentage`;
    if (policy.pricingModel === 2) return `${policy.tripsCommissionValue} EGP Fixed`;
    return `Net: ${policy.companyNetPrice} EGP`;
  }
}
