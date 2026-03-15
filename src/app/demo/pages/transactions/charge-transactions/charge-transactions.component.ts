import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TransactionsService } from 'src/app/shared/services/transactions.service';
import { ChargeTransaction, ChargeTransactionResponse } from 'src/app/shared/model/icharge-transaction';
import { FilterMap } from 'src/app/shared/mapping/filterMap';

@Component({
  selector: 'app-charge-transactions',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './charge-transactions.component.html',
  styleUrl: './charge-transactions.component.scss'
})
export class ChargeTransactionsComponent implements OnInit {
  transactions: ChargeTransaction[] = [];
  first = 0;
  rows = 25;
  totalRecords = 0;
  searchTerm: string = '';
  isLoading = false;

  constructor(
    private transactionsService: TransactionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getChargeTransactions();
  }

  getChargeTransactions() {
    this.isLoading = true;
    const filterMap: FilterMap = {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: this.searchTerm
    };

    this.transactionsService.getWalletChargeTransaction(filterMap).subscribe({
      next: (res: ChargeTransactionResponse) => {
        this.transactions = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching charge transactions:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getChargeTransactions();
  }

  onSearch() {
    this.first = 0;
    this.getChargeTransactions();
  }

  navigateToCustomer(id: number) {
    if (id) {
      this.router.navigate(['/customer-details', id]);
    }
  }

  getStatusBadgeClass(status: number): string {
    switch(status) {
      case 1: return 'bg-danger';      // Cancelled
      case 2: return 'bg-warning';     // Pending
      case 3: return 'bg-success';     // Success
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: number): string {
    switch(status) {
      case 1: return 'Cancelled';
      case 2: return 'Pending';
      case 3: return 'Success';
      default: return 'Unknown';
    }
  }
}
