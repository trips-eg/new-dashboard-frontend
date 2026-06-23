import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Icustomer } from 'src/app/shared/model/icustomer';
import { CustomerService } from 'src/app/shared/services/customer.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';
import { TransactionsService } from 'src/app/shared/services/transactions.service';
import { Transaction, TransactionResponse } from 'src/app/shared/model/itransaction';
import { ChargeTransaction, ChargeTransactionResponse } from 'src/app/shared/model/icharge-transaction';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { EmailListComponent } from '../../emails/email-list/email-list.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, EmailListComponent],
  providers: [MessageService],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
  customer: Icustomer = {} as Icustomer;
  customerId: number | null = null;
  baseUrl = environment.imgUrl;

  // Wallet Transactions
  walletBalance: number = 0;
  transactions: Transaction[] = [];
  first = 0;
  rows = 25;
  totalRecords = 0;
  isLoadingTransactions = false;

  // Charge Transactions
  chargeTransactions: ChargeTransaction[] = [];
  chargeFirst = 0;
  chargeRows = 25;
  chargeTotalRecords = 0;
  isLoadingChargeTransactions = false;

  // Wallet Balance Adjustment
  displayAdjustDialog = false;
  adjustAmount: number | null = null;
  isSubmittingAdjustment = false;

  constructor(
    private router: Router,
    private CustomerService: CustomerService,
    private route: ActivatedRoute,
    private transactionsService: TransactionsService,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    this.getcustomerId();
  }

  getAvatar(url?: string): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    const fallback = `${base}Default/avatar.png`;

    if (!url) return fallback;
    url = url.trim();
    
    if (url === 'NULL' || url.includes('Default/avatar')) return fallback;

    if (url.startsWith('http')) return url;

    return `${base}${url.startsWith('/') ? url.substring(1) : url}`;
  }

  getcustomerId() {
    this.route.params.subscribe((params) => {
      this.customerId = params['id'] ? +params['id'] : null;
      if (this.customerId) {
        this.loadCustomerData();
      }
    });
  }

  loadCustomerData() {
    if (this.customerId) {
      this.getCustomerById(this.customerId);
      this.getCustomerTransactions();
      this.getChargeTransactions();
    }
  }

  getCustomerById(id: number) {
    this.CustomerService.getCustomerById(id).subscribe({
      next: (res) => {
        console.log('Customer data:', res.data);
        this.customer = res.data;
        this.walletBalance = res.data.wallet.currentBalance || 0;
      },
      error: (err) => {
        console.error('Error fetching customer:', err);
      }
    });
  }

  getCustomerTransactions() {
    if (!this.customerId) return;

    this.isLoadingTransactions = true;
    const filterMap: FilterMap = {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: '',
      UserId: this.customerId
    };

    this.transactionsService.getTransactions(filterMap).subscribe({
      next: (res: TransactionResponse) => {
        this.transactions = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoadingTransactions = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.isLoadingTransactions = false;
      }
    });
  }

  getChargeTransactions() {
    if (!this.customerId) return;

    this.isLoadingChargeTransactions = true;
    const filterMap: FilterMap = {
      pageIndex: this.chargeFirst / this.chargeRows + 1,
      pageSize: this.chargeRows,
      search: '',
      UserId: this.customerId
    };

    this.transactionsService.getWalletChargeTransaction(filterMap).subscribe({
      next: (res: ChargeTransactionResponse) => {
        this.chargeTransactions = res.data.data;
        this.chargeTotalRecords = res.data.itemsCount;
        this.isLoadingChargeTransactions = false;
      },
      error: (err) => {
        console.error('Error fetching charge transactions:', err);
        this.isLoadingChargeTransactions = false;
      }
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getCustomerTransactions();
  }

  onChargePageChange(event: any) {
    this.chargeFirst = event.first;
    this.chargeRows = event.rows;
    this.getChargeTransactions();
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'edit':
        this.editProduct();
        break;
    }
  }

  editProduct() {
    this.router.navigate(['/customer-form'], { queryParams: { id: this.customerId } });
  }

  navigateToPaymentInfo(bookingReference: string | undefined) {
    if (bookingReference) {
      this.router.navigate(['/payment-info-ref', bookingReference]);
    }
  }

  // Helper methods for Charge Transactions
  getStatusBadgeClass(status: number): string {
    switch (status) {
      case 1:
        return 'bg-danger'; // Cancelled
      case 2:
        return 'bg-warning'; // Pending
      case 3:
        return 'bg-success'; // Success
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Cancelled';
      case 2:
        return 'Pending';
      case 3:
        return 'Success';
      default:
        return 'Unknown';
    }
  }

  // Wallet Balance Adjustment Methods
  openAdjustBalanceDialog() {
    this.adjustAmount = null;
    this.displayAdjustDialog = true;
  }

  closeAdjustDialog() {
    this.displayAdjustDialog = false;
  }

  submitAdjustment() {
    if (!this.customerId || !this.adjustAmount || this.adjustAmount === 0) return;
    if (this.adjustAmount < 0 && (this.walletBalance + this.adjustAmount < 0)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot deduct more than the current balance'
      });
      return;
    }

    this.isSubmittingAdjustment = true;

    this.transactionsService.adjustWalletBalance(this.customerId, this.adjustAmount).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Wallet balance adjusted successfully'
        });
        this.isSubmittingAdjustment = false;
        this.displayAdjustDialog = false;
        this.loadCustomerData(); // Reload customer wallet & transactions
      },
      error: (err) => {
        console.error('Error adjusting wallet balance:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to adjust wallet balance'
        });
        this.isSubmittingAdjustment = false;
      }
    });
  }
}
