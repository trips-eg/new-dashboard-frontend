import { Component, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CitiesFormComponent } from './cities-form/cities-form.component';
import { CitiesListComponent } from './cities-list/cities-list.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [SharedModule, CitiesListComponent, SubHeaderComponent],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss',
  providers: [DialogService]
})
export class CitiesComponent {
  isFormVisible: boolean = false;
  ref: DynamicDialogRef | undefined;
  @ViewChild(CitiesListComponent) citiesListComponent: CitiesListComponent | undefined;
  handleCitiesEdit(event: boolean) {
    this.isFormVisible = event;
  }
  constructor(
    public dialogService: DialogService,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToCitiesForm();
        break;
    }
  }

  goToCitiesForm() {
    console.log('goToVendorForm');
    this.isFormVisible = true;

    this.ref = this.dialogService.open(CitiesFormComponent, {
      header: this.translate.instant('cities'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.citiesListComponent?.refresh();
      }
    });
  }
}
