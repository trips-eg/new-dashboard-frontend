import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ManasikType } from 'src/app/shared/Enums/manasikType';
import { environment } from 'src/environments/environment';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-manasik-list',
  standalone: true,
  imports: [SharedModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './manasik-list.component.html',
  styleUrl: './manasik-list.component.scss'
})
export class ManasikListComponent {
  @ViewChild('dt') dt!: Table;
  @Input() type!: ManasikType;
  @Input() CompanyId!: number;

  data: any[] = [];
  totalCount: number = 0;
  isLoading: boolean = false;
  search: string = '';
  imageBaseUrl: string = environment.imgUrl;

  constructor(
    private hajjUmrahService: HajjUmmrahService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private toaster: ToastrService,
    private ConfigureService: ConfigureService
  ) {}

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  isAdmin(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Admin') || role.startsWith('SuperAdmin'));
  }

  toggleBlockStatus(id: number) {
    this.hajjUmrahService.toggleBlock(id).subscribe({
      next: (res: any) => {
        this.toaster.success('Block status toggled successfully', 'Success');
      },
      error: (err: any) => {
        this.toaster.error('Failed to toggle block status', 'Error');
        this.dt.reset(); // Reload data
        console.error('Error toggling block status', err);
      }
    });
  }

  toggleStatus(id: number) {
    this.hajjUmrahService.toggleStatus(id).subscribe({
      next: (res: any) => {
        this.toaster.success('status toggled successfully', 'Success');
      },
      error: (err: any) => {
        this.toaster.error('Failed to toggle  status', 'Error');
        this.dt.reset(); // Reload data
        console.error('Error toggling  status', err);
      }
    });
  }

  loadManasik(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const basePayload = TableRequestBuilder.build(event, this.search);

    const payload = {
      ...basePayload,
      Type: this.type,
      CompanyId: this.CompanyId
    };

    this.hajjUmrahService.getAllManasik(payload).subscribe({
      next: (response: any) => {
        this.data = response?.data.data || [];
        this.totalCount = response?.data?.itemsCount || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading manasik list:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.dt.reset();
  }

  // Actions
  view(item: any) {
    if (!item) return;
    try {
      this.router.navigate(['/details-manasik', item.id]);
    } catch (e) {
      console.log('Navigate to manasik details:', item.id);
    }
  }

  edit(item: any) {
    if (!item) return;
    try {
      this.router.navigate(['/manasik-form'], { queryParams: { id: item.id, mode: 'edit', type: this.type } });
    } catch (e) {
      console.log('Navigate to manasik edit:', item.id);
    }
  }

  deleteConfirm(item: any) {
    if (!item) return;
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this item?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.hajjUmrahService.deleteManasik(item.id).subscribe({
          next: (res: any) => {
            if (res?.success) {
              this.toaster.success('deleted successfully', 'Success');
              this.dt.reset();
            }
          },
          error: (err: any) => {
            console.error('Error deleting manasik', err);
            this.toaster.info('Failed to delete manasik', 'Error');
          }
        });
      },
      reject: () => {}
    });
  }
}
