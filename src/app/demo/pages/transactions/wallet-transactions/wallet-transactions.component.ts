import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TransactionsService } from 'src/app/shared/services/transactions.service';
import { Transaction, TransactionResponse } from 'src/app/shared/model/itransaction';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wallet-transactions',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './wallet-transactions.component.html',
  styleUrl: './wallet-transactions.component.scss'
})
export class WalletTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
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
    this.getTransactions();
  }

  getTransactions() {
    this.isLoading = true;
    const filterMap: FilterMap = {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: this.searchTerm
    };

    this.transactionsService.getTransactions(filterMap).subscribe({
      next: (res: TransactionResponse) => {
        this.transactions = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getTransactions();
  }

  onSearch() {
    this.first = 0;
    this.getTransactions();
  }

  navigateToPaymentInfo(bookingReference: string | undefined) {
    if (bookingReference) {
      this.router.navigate(['/payment-info-ref', bookingReference]);
    }
  }
}

