import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Icountries } from 'src/app/shared/model/icountries';
import { CountriesService } from 'src/app/shared/services/countries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-countries-list',
  standalone: true,
  imports: [SharedModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './countries-list.component.html',
  styleUrl: './countries-list.component.scss'
})
export class CountriesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  searchTerm: string = '';
  countries: Icountries[] = [];
  totalRecords: number = 0;
  isLoading: boolean = false;
  ref: DynamicDialogRef | undefined;
  currentLang: string;

  constructor(
    private countriesService: CountriesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || 'en';
    this.translate.onLangChange.subscribe((lang) => {
      this.currentLang = lang.lang;
    });
  }

  loadCountries(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.countriesService.getAllCountries(payload).subscribe({
      next: (res) => {
        this.countries = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.countries = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  onStatusChange(id: number, status: boolean) {
    const payload = { id, status };
    this.countriesService.editStatus(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: status ? 'success' : 'error',
          summary: 'Updated',
          detail: status ? 'Status updated successfully' : 'Status deactivated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update status'
        });
      }
    });
  }
}
