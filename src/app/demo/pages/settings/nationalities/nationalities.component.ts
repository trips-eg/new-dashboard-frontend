import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { NationalitiesListComponent } from './nationalities-list/nationalities-list.component';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NationalitiesFormComponent } from './nationalities-form/nationalities-form.component';

@Component({
  selector: 'app-nationalities',
  standalone: true,
  imports: [SubHeaderComponent, NationalitiesListComponent],
  providers: [DialogService],
  templateUrl: './nationalities.component.html',
  styleUrl: './nationalities.component.scss'
})
export class NationalitiesComponent {
  isFormVisible: boolean = false;
  ref: DynamicDialogRef | undefined;
  @ViewChild(NationalitiesListComponent) NationalitiesListComponent: NationalitiesListComponent | undefined;

  handleCitiesEdit(event: boolean) {
    this.isFormVisible = event;
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToNationalitiesForm();
        break;
    }
  }
  goToNationalitiesForm() {
    console.log('goToVendorForm');
    this.isFormVisible = true;

    this.ref = this.dialogService.open(NationalitiesFormComponent, {
      header: this.translate.instant('nationality'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.NationalitiesListComponent?.refresh();
      }
    });
  }
  constructor(
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}
}
