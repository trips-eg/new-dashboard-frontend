import { ConfirmationService } from 'primeng/api';
import { NationalitiesService } from './../../../../../shared/services/nationalities.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { NationalitiesFormComponent } from '../nationalities-form/nationalities-form.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-nationalities-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './nationalities-list.component.html',
  styleUrl: './nationalities-list.component.scss'
})
export class NationalitiesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  constructor(
    private NationalitiesService: NationalitiesService,
    private dialogService: DialogService,
    private ConfirmationService: ConfirmationService,
    private ToastrService: ToastrService
  ) {}

  nationalities: any[] = [];
  searchTerm: string = '';
  totalRecords: number = 0;
  isLoading: boolean = false;
  ref: DynamicDialogRef | undefined;

  ngOnInit(): void {}

  loadNationalities(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.NationalitiesService.getAllNationalities(payload).subscribe({
      next: (res: any) => {
        this.nationalities = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('  error:', err);
        this.nationalities = [];
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

  handleEdit(name: string, nameAr: string, id: number) {
    this.ref = this.dialogService.open(NationalitiesFormComponent, {
      header: 'nationality',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id, name, nameAr },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.refresh();
      }
    });
  }

  handleDelete(id: number) {
    this.ConfirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised mx-2',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.NationalitiesService.deleteNationality(id).subscribe({
          next: () => {
            this.refresh();
            this.ToastrService.success(' deleted successfully', 'Success');
          },
          error: () => {
            this.ToastrService.error('Failed to delete ', 'Error');
          }
        });
      }
    });
  }
}
