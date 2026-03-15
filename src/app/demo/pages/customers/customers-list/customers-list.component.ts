import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from 'src/app/shared/services/customer.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  constructor(
    private CustomerService: CustomerService,
    private ToastrService: ToastrService
  ) {}
  customers: any[] = [];
  totalRecords = 0;
  loading: boolean = false;
  searchTerm: string = '';

  ngOnInit(): void {
    // Initial load is handled by the table's lazy load event
  }

  loadCustomers(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.CustomerService.getAllCustomers(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.customers = res.data.data;
          this.totalRecords = res.data.itemsCount;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching customers:', err);
        this.loading = false;
      }
    });
  }

  // Helper for search to reset table
  search() {
    this.dt.reset();
  }

  toggleCustomerStatus(customer: any) {
    const updatedStatus = {
      id: customer.id,
      iActive: !customer.iActive
    };

    this.CustomerService.updateCustomerStatus(updatedStatus).subscribe({
      next: () => {
        this.ToastrService.success('Customer status updated successfully');
      },
      error: (err) => {
        this.ToastrService.error('Error updating customer status');
        console.error('Error updating customer status:', err);
      }
    });
  }
}
