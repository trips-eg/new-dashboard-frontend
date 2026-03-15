import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OutingService } from 'src/app/shared/services/outing.service';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-outing-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './outing-list.component.html',
  styleUrl: './outing-list.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class OutingListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  @Input() CompanyId: any;
  @Input() vendorId: any;

  outings: any[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  searchedWord: string = '';

  OutingType = {
    1: 'Normal',
    2: 'Scheduled'
  };

  constructor(
    private router: Router,
    private translate: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ConfigureService: ConfigureService,
    private outingService: OutingService
  ) {}

  ngOnInit() {}

  loadOutings(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload: any = TableRequestBuilder.build(event, this.searchedWord);
    if (this.CompanyId || this.vendorId) {
      payload.vendorId = this.vendorId || this.CompanyId;
    }
    this.outingService.getAllOutings(payload).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.outings = response.data.data;
          this.totalRecords = response.data.itemsCount;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching outings', err);
        this.loading = false;
      }
    });
  }

  searchByName() {
    this.dt.reset();
  }

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  isAdmin(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Admin') || role.startsWith('SuperAdmin'));
  }

  toggleOutingStatus(id: number) {
    this.outingService.updateOutingStatus(id).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Outing status changed' });
      },
      error: (err: any) => {
        this.dt.reset();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error toggling outing status' });
      }
    });
  }

  toggleBlockStatus(id: number) {
    this.outingService.toggleBlock(id).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Block status changed' });
      },
      error: (err: any) => {
        this.dt.reset();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error toggling block status' });
      }
    });
  }

  view(id: any) {
    this.router.navigate(['/outing-details', id]);
  }

  update(id: any) {
    this.router.navigate(['/outing-form'], { queryParams: { id: id, mode: 'edit' } });
  }

  delete(id: any) {
    this.confirmationService.confirm({
      accept: () => {
        this.outingService.deleteOuting(id).subscribe((res: any) => {
          if (res?.success) {
            this.messageService.add({ severity: 'success', summary: 'Deleted' });
            this.dt.reset();
          }
        });
      }
    });
  }

  goToCompany(companyId: number) {
    this.router.navigate(['/vendor-details', companyId]);
  }
}
