import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseSearchCriteria, FilterItem } from 'src/app/shared/mapping/filterMap';
import { RoleService } from 'src/app/shared/services/role.service';
import { UseriesService } from 'src/app/shared/services/useries.service';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  constructor(
    private UseriesService: UseriesService,
    private ToastService: ToastrService,
    private RoleService: RoleService,
    private VendorService: VendorService
  ) {}

  users: any[] = [];
  totalRecords = 0;
  loading: boolean = false;
  searchTerm: string = '';

  // Filter options
  roles: any[] = [];
  vendors: any[] = [];
  selectedRole: any = null;
  selectedVendor: any = null;

  displayDialog: boolean = false;
  selectedUser: any = null;
  password: string = '';
  newPasswordDisplay: string = '';
  displaySuccessDialog: boolean = false;

  ngOnInit(): void {
    this.loadRoles();
    this.loadVendors();
  }

  loadRoles() {
    this.RoleService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res.data;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  loadVendors() {
    const criteria = { isPagingEnabled: false, pageIndex: 1, pageSize: 100 };
    this.VendorService.getAllVendors(criteria).subscribe({
      next: (res) => {
        this.vendors = res.data.data || res.data;
      },
      error: (err) => {
        console.error('Error fetching vendors:', err);
      }
    });
  }

  loadUsers(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    // Add custom filters for role and vendor
    if (this.selectedRole) {
      payload.filters = payload.filters || [];
      payload.filters.push({ column: 'roles.name', value: this.selectedRole.name });
    }
    if (this.selectedVendor) {
      payload.companyId = this.selectedVendor.id;
    }

    this.UseriesService.getAllUsers(payload).subscribe({
      next: (res) => {
        this.users = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading = false;
      }
    });
  }

  search() {
    this.dt.reset();
  }

  onFilterChange() {
    this.dt.reset();
  }

  clearFilters() {
    this.selectedRole = null;
    this.selectedVendor = null;
    this.searchTerm = '';
    this.dt.reset();
  }

  showDialog(user: any) {
    this.selectedUser = user;
    this.password = '';
    this.displayDialog = true;
  }

  changePassword() {
    if (!this.selectedUser || !this.password) return;

    const payload = {
  id: +this.selectedUser.id,   // ← تحويل صريح لـ number
  newPassword: this.password
};

    const tempPassword = this.password;

    this.UseriesService.resetPassword(payload).subscribe({
      next: (res) => {
        console.log('Password changed successfully');
        this.displayDialog = false;
        this.ToastService.success('Password changed successfully');
        this.newPasswordDisplay = tempPassword;
        this.displaySuccessDialog = true;
        this.password = '';
      },
      error: (err) => {
  console.error('Error changing password:', err);
  const errorMsg = err?.error?.message 
                || err?.error?.data 
                || 'Failed to change password';
  this.ToastService.error(errorMsg);
}
    });
  }

  copyToClipboard() {
    if (this.newPasswordDisplay) {
      navigator.clipboard.writeText(this.newPasswordDisplay).then(() => {
        this.ToastService.info('Password copied to clipboard');
      });
    }
  }
}
