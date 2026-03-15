import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { FilterTravelMap } from 'src/app/shared/mapping/filterMap';
import { Travel } from 'src/app/shared/model/travelDto';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-travels-reservation-list',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './travels-reservation-list.component.html',
  styleUrl: './travels-reservation-list.component.scss',
  providers: [ConfirmationService]
})
export class TravelsReservationListComponent {
  searchedWord: string;
  filter: FilterTravelMap = {};
  totalSize: number = 0;
  totalSizePercent: number = 0;
  totalRecords: number = 10;
  pagination: any;
  lang: string;
  pageIndex = 1;
  length: number;
  pageSize = 10;
  travels: Travel[] = [];
  travelType = [
    {
      label: 'All',
      value: null
    },
    {
      label: 'Internal',
      value: false
    },
    {
      label: 'External',
      value: true
    }
  ];
  columns = [
    { header: 'Name', field: 'name', isData: true, isCrudAction: false, width: 150 },
    { header: 'Country', field: 'country.name', isData: true, isCrudAction: false, width: 150 },
    { header: 'City', field: 'city.name', isData: true, isCrudAction: false, width: 150 },
    // { header: 'From Location', field: 'fromLocation', isData: true, isCrudAction: false, width:150 },
    // { header: 'To Location', field: 'toLocation', isData: true, isCrudAction: false, width:150 },
    { header: 'Days', field: 'numberOfDays', isData: true, isCrudAction: false, width: 150 },
    { header: 'Seats', field: 'capacity', isData: true, isCrudAction: false, width: 150 },
    { header: 'Remaining Seats', field: 'remainingSeats', isData: true, isCrudAction: false, width: 150 },

    { header: 'Start Date', field: 'startDate', isDate: true, width: 150 },
    { header: 'End Date', field: 'endDate', isDate: true, width: 150 },
    { header: 'Price', field: 'price', isData: true, isPrice: true, width: 150 },
    // { header: 'Status', field: 'isActive', isData: false, isStatus: true, mapping: 'AttendanceStatus', width: 150 },
    { header: 'Action', field: 'action', isData: false, isCrudAction: true, width: 150 }
  ];

  btnAction = [
    {
      name: 'View Details',
      styleClass: 'info',
      icon: 'pi pi-eye'
    },
    {
      name: 'Update',
      styleClass: 'success',
      icon: 'pi pi-pencil'
    },
    {
      name: 'Cancel',
      styleClass: 'danger',
      icon: 'pi pi-block'
    }
  ];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private travelServ: TravelTripsService,
    private toast: ToastrService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
  }
  ngOnInit() {
    this.filter.pageIndex = this.pageIndex;
    this.filter.pageSize = this.pageSize;
    this.getAllTravels(this.filter);
  }

  getAllTravels(filter) {
    this.travelServ.getAllTripReservation(filter).subscribe(
      (response) => {
        if (response.success) {
          this.travels = response.data.data;
          this.totalRecords = response.data.count;
        }
      },
      (error) => {}
    );
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToTravelForm();
        break;
    }
  }

  goToTravelForm() {
    console.log('work travels form ....');
    this.router.navigate(['/travel-trip-reservation-form']);
  }

  onPageChange(event: any): void {
    // this.isLoading = true; // Set loading true when data is being fetched
    let pageIndex = event.pageIndex;
    this.filter.pageIndex = pageIndex + 1;
    let pageSize = event.pageSize;
    this.filter.pageSize = pageSize;
    if (this.filter) {
      this.getAllTravels(this.filter); // Include search criteria and offset
    } else {
      this.getAllTravels(this.filter); // Include offset
    }
  }

  searchByName(searchedKey) {
    if (!searchedKey) return;
    this.filter.Search = searchedKey;
    this.filter.pageIndex = 1;
    this.getAllTravels(this.filter);
  }
  onSelectType(event: any) {
    const selectedValue = event.value; // Access the selected option value directly
    this.filter.IsExternalTrip = selectedValue;
    this.filter.pageIndex = 1;
    this.getAllTravels(this.filter);
  }

  handleTableAction(event: { action: string; payload: any }) {
    const { action, payload } = event;

    switch (action) {
      case 'View Details':
        this.view(payload);
        break;
      case 'Update':
        this.update(payload);
        break;
      case 'Delete':
        this.delete(payload);
        break;

      default:
        console.warn('Unhandled action:', action);
    }
  }

  view(event: any) {
    const selectedId = event.name;
    // Navigate to the details page with the selected ID
    this.router.navigate(['/travel-details', selectedId]);
  }
  update(event: any) {
    const selectedId = event.id;
    // Navigate to the details page with the selected ID
    this.router.navigate(['/travel-form'], { queryParams: { id: selectedId, mode: 'edit' } });
  }
  delete(event: any) {
    const selectedId = event.id;
    // Show confirmation message before deleting
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this trip?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteTravel(selectedId);
      },
      reject: () => {}
    });
  }

  deleteTravel(travelId) {
    this.travelServ.deleteTravel(travelId).subscribe(
      (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Delete',
            detail: 'Successfully Deleted'
          });

          this.getAllTravels(this.filter);
        }
      },
      (error) => {}
    );
  }
}
