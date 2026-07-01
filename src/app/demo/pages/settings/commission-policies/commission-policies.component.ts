import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { CommissionPolicyFormComponent } from 'src/app/shared/components/commission-policy-form/commission-policy-form.component';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { PricingService, CommissionItemType } from 'src/app/shared/services/pricing.service';
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
  statistics: any = null;

  // Real database totals
  totalTripsCount: number = 0;
  totalOutingsCount: number = 0;
  totalHajjCount: number = 0;

  constructor(
    private travelService: TravelTripsService,
    private outingService: OutingService,
    private hajjService: HajjUmmrahService,
    private pricingService: PricingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Loaded lazily on table initialize
    this.loadStatistics();
    this.loadRealTotals();
  }

  loadStatistics(): void {
    this.pricingService.getPricingPolicyStatistics().subscribe({
      next: (res) => {
        if (res.success) {
          this.statistics = res.data;
        }
      },
      error: (err) => console.error('Error fetching pricing statistics:', err)
    });
  }

  loadRealTotals(): void {
    const payload = { pageIndex: 1, pageSize: 1, isPagingEnabled: true, search: '' };

    this.travelService.getAllTravels(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.totalTripsCount = res.data.itemsCount || 0;
        }
      }
    });

    this.outingService.getAllOutings(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.totalOutingsCount = res.data.itemsCount || 0;
        }
      }
    });

    this.hajjService.getAllManasik(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.totalHajjCount = res.data.itemsCount || 0;
        }
      }
    });
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
      if (this.selectedItem.isTicket) {
        this.selectedItem.ticket.itemPricingPolicy = updatedPolicy;
        this.selectedItem.ticket.tripsCommissionValue = updatedPolicy.tripsCommissionValue;
        this.selectedItem.ticket.profitLoss = updatedPolicy.profitLoss;
      } else {
        this.selectedItem.policy = updatedPolicy;
      }
    }
    this.selectedItem = null;
    this.loadStatistics();
    this.loadRealTotals();
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

  openTicketPolicyDialog(ticket: any, outing: any): void {
    this.selectedItem = {
      id: ticket.id,
      name: `${outing.name} - ${ticket.ticketType}`,
      price: ticket.price,
      isTicket: true,
      ticket: ticket,
      outing: outing
    };
    this.displayDialog = true;
  }

  getOutingPriceRange(item: any): string {
    if (!item.tickets || item.tickets.length === 0) return 'No tickets';
    const prices = item.tickets.map((t: any) => t.price).filter((p: any) => p !== null && p !== undefined);
    if (prices.length === 0) return '-';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return `${min} EGP`;
    }
    return `${min} - ${max} EGP`;
  }

  getConfiguredTicketsCount(item: any): number {
    if (!item.tickets) return 0;
    return item.tickets.filter((t: any) => t.itemPricingPolicy && t.itemPricingPolicy.pricingModel).length;
  }

  getOutingsPolicyStatusClass(item: any): string {
    const total = item.tickets?.length || 0;
    if (total === 0) return 'bg-secondary text-white';
    const configured = this.getConfiguredTicketsCount(item);
    if (configured === 0) return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (configured === total) return 'bg-success-subtle text-success border border-success-subtle';
    return 'bg-warning-subtle text-warning border border-warning-subtle';
  }

  getOutingsPolicyStatusText(item: any): string {
    const total = item.tickets?.length || 0;
    if (total === 0) return 'No Tickets';
    const configured = this.getConfiguredTicketsCount(item);
    if (configured === 0) return 'Not Configured';
    if (configured === total) return 'Fully Configured';
    return 'Partially Configured';
  }

  getPercentage(value: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}
