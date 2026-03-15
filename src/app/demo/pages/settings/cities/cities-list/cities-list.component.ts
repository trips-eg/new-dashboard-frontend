import { Component, OnInit, ViewChild } from '@angular/core';
import { Icities } from 'src/app/shared/model/Icities';
import { CitiesService } from 'src/app/shared/services/cities.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-cities-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, MessageService, DialogService],
  templateUrl: './cities-list.component.html',
  styleUrl: './cities-list.component.scss'
})
export class CitiesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  searchTerm: string = '';
  cities: Icities[] = [];
  totalRecords: number = 0;
  isLoading: boolean = false;
  ref: DynamicDialogRef | undefined;
  currentLang: string;

  constructor(
    private _CitiesService: CitiesService,
    private ToastrService: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || 'en';
    this.translate.onLangChange.subscribe((lang) => {
      this.currentLang = lang.lang;
    });
  }

  loadCities(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this._CitiesService.getAllCities(payload).subscribe({
      next: (res) => {
        this.cities = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.cities = [];
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
    this._CitiesService.editStatus(payload).subscribe({
      next: () => {
        if (status === true) {
          this.ToastrService.success('Status updated successfully', 'Updated', {
            timeOut: 3000,
            progressBar: true,
            progressAnimation: 'increasing',
            closeButton: true,
            positionClass: 'toast-top-right'
          });
        } else {
          this.ToastrService.error('Status deactivated successfully', 'Updated', {
            timeOut: 3000,
            progressBar: true,
            progressAnimation: 'increasing',
            closeButton: true,
            positionClass: 'toast-top-right'
          });
        }
      },
      error: () => {}
    });
  }
}
