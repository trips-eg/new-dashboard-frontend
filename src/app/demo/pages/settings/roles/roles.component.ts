import { Component, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Router } from '@angular/router';
import { RolesListComponent } from './roles-list/roles-list.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RolesFormComponent } from './roles-form/roles-form.component';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, RolesListComponent],
  providers: [DialogService],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {
  ref: DynamicDialogRef;
  @ViewChild(RolesListComponent) rolesListComponent!: RolesListComponent;

  constructor(
    private router: Router,
    private dialogService: DialogService ,
    private ConfigureService: ConfigureService
  ) {}
  // This method opens the dialog for adding a new role but doesnt work noe
  //add this in sub header {    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
  //  (actionClicked)="handleAction($event)"}
  openRoleFormDialog() {
    this.ref = this.dialogService.open(RolesFormComponent, {
      header: 'Add Role',
      width: '40%',
      closable: true,
      dismissableMask: true
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        console.log('Dialog returned data:', data);
        this.rolesListComponent.gettingAllRoles();
      }
    });
  }
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.openRoleFormDialog();
        break;
    }
  }
  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
}
