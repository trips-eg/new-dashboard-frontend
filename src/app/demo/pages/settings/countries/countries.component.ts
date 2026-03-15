import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CountriesListComponent } from './countries-list/countries-list.component';
import { CountriesFormComponent } from './countries-form/countries-form.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, CountriesListComponent],
  providers: [DialogService, MessageService],
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss'
})
export class CountriesComponent {
  ref: DynamicDialogRef | undefined;

  @ViewChild(CountriesListComponent) countriesList!: CountriesListComponent;

  constructor(
    private dialogService: DialogService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  handleAction(event: { action: string }) {
    if (event.action === 'add') {
      this.openCountriesForm();
    }
  }

  openCountriesForm() {
    this.ref = this.dialogService.open(CountriesFormComponent, {
      header: this.translate.instant('countries'),
      width: '50vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        // ✅ استدعاء الفانكشن المخصصة بدل ngOnInit
        this.countriesList.refresh();
        this.toastr.success(`${this.translate.instant('countries')} ${this.translate.instant('added_successfully')}`);
      }
    });
  }
}
