import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { OutingCategoryListComponent } from './outing-category-list/outing-category-list.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';
import { OutingCategoryformComponent } from './outing-categoryform/outing-categoryform.component';

@Component({
  selector: 'app-outing-category',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, OutingCategoryListComponent],
  providers: [ConfirmationService, DialogService],
  templateUrl: './outing-category.component.html',
  styleUrl: './outing-category.component.scss'
})
export class OutingCategoryComponent {
  constructor(
    private ConfigureService: ConfigureService,
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}
  isFormVisible: boolean = false;
  ref: DynamicDialogRef | undefined;
  @ViewChild(OutingCategoryListComponent) OutingCategoryListComponent: OutingCategoryListComponent | undefined;

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
  handleCitiesEdit(event: boolean) {
    this.isFormVisible = event;
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToOutingCategoryform();
        break;
    }
  }
  goToOutingCategoryform() {
    console.log('goToVendorForm');
    this.isFormVisible = true;

    this.ref = this.dialogService.open(OutingCategoryformComponent, {
      header: this.translate.instant('add outing category'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.OutingCategoryListComponent?.refresh();
      }
    });
  }
}
