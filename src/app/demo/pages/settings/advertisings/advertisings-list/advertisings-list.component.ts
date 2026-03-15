import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { AdvertisingsService } from 'src/app/shared/services/advertisings.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-advertisings-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService],
  templateUrl: './advertisings-list.component.html',
  styleUrl: './advertisings-list.component.scss'
})
export class AdvertisingsListComponent implements OnInit {
  _AdvertisingsService = inject(AdvertisingsService);
  toastrService = inject(ToastrService);
  confirmationService = inject(ConfirmationService);
  private Router = inject(Router);

  first: number = 0;
  rows: number = 10;
  search: string;
  addsData: any[] = [];
  totalRecords = 0;
  baseUrl = environment.imgUrl;

  onDelete(id) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this._AdvertisingsService.deleteAdvertising(id).subscribe({
          next: (res) => {
            this.toastrService.success('deleted sussesfuly', 'deleted');
            this.getAllAdvertisings();
          }
        });
      },
      reject: () => {
      }
    });
  }
  onEdit(id){
    this.Router.navigate(['\advertisings-form', id])
  }
  private buildFilter(): FilterMap {
    return {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: this.search
    };
  }
  ngOnInit(): void {}
  getAllAdvertisings() {
    this._AdvertisingsService.getAllAdvertisings(this.buildFilter()).subscribe({
      next: (res) => {
        debugger;
        this.addsData = res.data.data;
        this.totalRecords = res.data.itemsCount;
      }
    });
  }
  onSearch() {
    this.first = 0;
    this.getAllAdvertisings();
  }
  onPageChange(event) {
    this.first = event.first;
    this.rows = event.rows;
    this.getAllAdvertisings();
  }

 
}
