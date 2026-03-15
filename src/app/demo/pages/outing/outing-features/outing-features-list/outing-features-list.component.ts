import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { OutingFeaturesService } from 'src/app/shared/services/outing-features.service';
import { OutingFeaturesFormComponent } from '../outing-features-form/outing-features-form.component';
import { environment } from 'src/environments/environment';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-outing-features-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './outing-features-list.component.html',
  styleUrl: './outing-features-list.component.scss'
})
export class OutingFeaturesListComponent implements OnInit {
  baasicImageUrl: string = environment.imgUrl;
  @ViewChild('dt') dt!: Table;

  features: any[] = [];
  searchTerm: string = '';
  totalRecords: number = 0;
  loading: boolean = false;
  // first = 0;
  // rows = 10;
  ref: DynamicDialogRef | undefined;
  // filter: FilterMap = {};

  constructor(
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private outingFeaturesService: OutingFeaturesService
  ) {}

  ngOnInit(): void {
    // Initial load handled by p-table lazy load
  }

  loadFeatures(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.outingFeaturesService.getAllOutingFeatures(payload).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.features = res.data.data || res.data;
          this.totalRecords = res.data.itemsCount || this.features.length;
        } else if (Array.isArray(res)) {
          this.features = res;
          this.totalRecords = res.length;
        } else {
          this.features = res?.data || [];
          this.totalRecords = this.features.length;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching outing features', err);
        this.loading = false;
      }
    });
  }

  refresh() {
    this.dt.reset();
  }
  onSearch() {
    this.dt.reset();
  }

  pageChange(event: any) {
    // Deprecated for loadFeatures
  }

  searchByName(searchedKey: string) {
    // Deprecated for onSearch
  }

  handleEdit(item: any) {
    this.ref = this.dialogService.open(OutingFeaturesFormComponent, {
      header: 'Edit Outing Feature',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id: item.id, name: item.name, image: item.imageUrl },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.dt.reset();
      }
    });
  }

  handleDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.outingFeaturesService.deleteOutingFeature(id).subscribe({
          next: () => {
            this.dt.reset();
            this.toastr.success('Deleted successfully', 'Success');
          },
          error: () => {
            this.toastr.error('Failed to delete', 'Error');
          }
        });
      }
    });
  }
}
