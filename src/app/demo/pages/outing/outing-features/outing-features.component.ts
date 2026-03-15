import { Component, ViewChild } from '@angular/core';
import { OutingFeaturesListComponent } from './outing-features-list/outing-features-list.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingFeaturesFormComponent } from './outing-features-form/outing-features-form.component';
import { TranslateService } from '@ngx-translate/core';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-outing-features',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, OutingFeaturesListComponent],
  providers: [DialogService],
  templateUrl: './outing-features.component.html',
  styleUrl: './outing-features.component.scss'
})
export class OutingFeaturesComponent {
  filter = {
    pageIndex: 1,
    pageSize: 10,
    search: ''
  };
  ref: DynamicDialogRef | undefined;
  @ViewChild(OutingFeaturesListComponent)
  outingFeaturesListComponent!: OutingFeaturesListComponent;

  constructor(
    private configureService: ConfigureService,
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}

  isVendor(): boolean {
    const roles = this.configureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.openAddFeatureDialog();
        break;
    }
  }

  openAddFeatureDialog() {
    this.ref = this.dialogService.open(OutingFeaturesFormComponent, {
      header: this.translate.instant('outing features'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        // refresh list if available
        this.outingFeaturesListComponent?.refresh();
      }
    });
  }
}
