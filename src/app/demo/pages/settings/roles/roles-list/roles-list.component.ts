import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Iroles } from 'src/app/shared/model/iroles';
import { RolesService } from 'src/app/shared/services/roles.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [SharedModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent implements OnInit {
  constructor(
    private RolesService: RolesService,
    private confirmationService: ConfirmationService,
    private toaster: ToastrService,
    private router: Router
  ) {}
  roles: Iroles[] = [];
  ngOnInit(): void {
    this.gettingAllRoles();
  }
  gettingAllRoles() {
    this.RolesService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res.data;
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      }
    });
  }
  confirmDelete(roleId: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this role?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.deleteRole(roleId)
    });
  }

  deleteRole(roleId: number) {
    this.RolesService.deleteRole(roleId).subscribe({
      next: () => {
        this.toaster.success('Role deleted successfully');
        this.gettingAllRoles();
      },
      error: () => this.toaster.error('Failed to delete role')
    });
  }
  navigateToPermissions(roleId: number , roleName): void {
    this.router.navigate(['/edit-permissions', roleId , roleName] );
  }
}
