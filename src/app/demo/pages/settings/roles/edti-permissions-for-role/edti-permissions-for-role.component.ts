import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PermissionsService } from 'src/app/shared/services/permissions.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';

@Component({
  selector: 'app-edti-permissions-for-role',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './edti-permissions-for-role.component.html',
  styleUrl: './edti-permissions-for-role.component.scss'
})
export class EdtiPermissionsForRoleComponent implements OnInit {
  roleId: number = 0;
  roleName: string = '';
  translatedHeader: string = '';

  permissionsForRole: any[] = [];
  constructor(
    private ActivatedRoute: ActivatedRoute,
    private PermissionsService: PermissionsService,
    private ToastrService: ToastrService,
    private translate: TranslateService
  ) {}
  updateTranslatedHeader() {
    this.translatedHeader = this.translate.instant('Edit Permissions for Role:', { role: this.roleName });
  }
  fetchingparams() {
    console.log('Fetching params from route');
    this.ActivatedRoute.params.subscribe((params) => {
      console.log('Route params:', params);
      this.roleId = +params['roleId'];
      this.roleName = params['roleName'];

      console.log('Role ID from route:', this.roleId);
      console.log('Role Name from route:', this.roleName);
    });
  }
  ngOnInit(): void {
    this.updateTranslatedHeader();
    console.log('ngOnInit triggered');
    this.fetchingparams();
    if (this.roleId) {
      console.log('Fetching permissions for role ID:', this.roleId);
      this.GetPermissionsForRole(this.roleId);
    } else {
      console.error('No role ID provided in route params');
    }
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslatedHeader();
    });
  }

  GetPermissionsForRole(roleId) {
    console.log('Fetching permissions for role ID:', roleId);
    this.PermissionsService.getAllPermissionsForRole(roleId).subscribe({
      next: (res) => {
        this.permissionsForRole = res.roleCalims;
        console.log('Permissions fetched successfully:', res);
        // Handle the response as needed
      },
      error: (error) => {
        console.error('Error fetching permissions:', error);
        // Handle the error as needed
      }
    });
  }

  onPermissionToggle(permission: any) {
    const payload = {
      roleId: this.roleId,
      roleCalims: [
        {
          displayValue: permission.displayValue,
          isSelected: !permission.isSelected // toggled value
        }
      ]
    };

    this.PermissionsService.addPermissionToRole(payload).subscribe({
      next: () => {
        this.ToastrService.success('Permission updated successfully');
        permission.isSelected = !permission.isSelected; // update UI
      },
      error: () => {
        this.ToastrService.error('you are not allowed to update this permission');
        this.GetPermissionsForRole(this.roleId);
        console.error('Error updating permission');
      }
    });
  }
}
