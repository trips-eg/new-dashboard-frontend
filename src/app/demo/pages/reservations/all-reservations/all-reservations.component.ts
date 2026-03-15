import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { ReservationListComponent } from '../hotel/reservation-list/reservation-list.component';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { RoomBookingInfoComponent } from 'src/app/shared/tables-booking-info/room-booking-info/room-booking-info.component';
import { TravelBookingInfoComponent } from 'src/app/shared/tables-booking-info/travel-booking-info/travel-booking-info.component';
import { ReservationsService } from 'src/app/shared/services/reservations.service';
import { OutingBookingInfoComponent } from 'src/app/shared/tables-booking-info/outing-booking-info/outing-booking-info.component';
import { ManasikBookingInfoComponent } from 'src/app/shared/tables-booking-info/manasik-booking-info/manasik-booking-info.component';

@Component({
  selector: 'app-all-reservations',
  standalone: true,
  imports: [
    SharedModule,
    SubHeaderComponent,
    ReservationListComponent,
    RoomBookingInfoComponent,
    TravelBookingInfoComponent,
    OutingBookingInfoComponent,
    ManasikBookingInfoComponent
  ],
  templateUrl: './all-reservations.component.html',
  styleUrl: './all-reservations.component.scss'
})
export class AllReservationsComponent implements OnInit, OnDestroy {
  travelList = [];
  roomsList = [];
  outingsList: any[] = [];
  manasikList: any[] = [];
  totalRecorsOfTravel = 0;
  totalRecorsOfRooms = 0;
  totalRecorsOfOutings = 0;
  totalRecorsOfManasik = 0;

  _ReservationsService = inject(ReservationsService);

  // Vendor permissions
  hasTravelPermission = false;
  hasRoomPermission = false;
  hasOutingPermission = false;
  hasManasikPermission = false;

  // Flag to ensure permissions are loaded before rendering tabs
  permissionsLoaded = false;

  first: number = 0;
  rows: number = 10;
  search: string = '';
  isLoading = false;

  filter = {
    pageIndex: Math.floor(this.first / this.rows) + 1,
    pageSize: this.rows,
    search: this.search
  };

  constructor(
    private ConfigureService: ConfigureService,
    private cdr: ChangeDetectorRef
  ) {}

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  ngOnInit(): void {
    console.log('========== Component Initialized ==========');

    // CRITICAL: Reset ALL permissions to false first (to clear any cached state)
    this.hasTravelPermission = false;
    this.hasRoomPermission = false;
    this.hasOutingPermission = false;
    this.hasManasikPermission = false;
    this.permissionsLoaded = false;

    // Clear all data
    this.travelList = [];
    this.roomsList = [];
    this.outingsList = [];
    this.manasikList = [];
    this.totalRecorsOfTravel = 0;
    this.totalRecorsOfRooms = 0;
    this.totalRecorsOfOutings = 0;
    this.totalRecorsOfManasik = 0;

    // Force change detection to clear old tabs
    this.cdr.detectChanges();

    // Now set the correct permissions based on current user
    const user = this.ConfigureService.parsedUser;

    console.log('Current user:', user);

    this.hasTravelPermission = user.isTravelCommission === true;
    this.hasRoomPermission = user.isHotelCommission === true;
    this.hasOutingPermission = user.isOutCommission === true;
    this.hasManasikPermission = user.isHajjCommission === true;

    // Mark permissions as loaded
    this.permissionsLoaded = true;

    console.log('Permissions set:', {
      travel: this.hasTravelPermission,
      room: this.hasRoomPermission,
      outing: this.hasOutingPermission,
      manasik: this.hasManasikPermission
    });

    // Trigger change detection to update the view with correct permissions
    this.cdr.detectChanges();

    // Load data
    if (this.isVendor()) {
      this.loadAllData(this.filter);
    }
  }

  ngOnDestroy(): void {
    // Clean up on component destroy
    this.hasTravelPermission = false;
    this.hasRoomPermission = false;
    this.hasOutingPermission = false;
    this.hasManasikPermission = false;
    this.permissionsLoaded = false;
  }

  loadAllData(filter) {
    this.filter = filter;
    // this.isLoading = true; // Don't trigger global loading for background updates if possible, or handle it differently

    if (this.permissionsLoaded) {
      if (this.hasTravelPermission) this.loadTravelData(filter);
      if (this.hasRoomPermission) this.loadRoomData(filter);
      if (this.hasOutingPermission) this.loadOutingData(filter);
      if (this.hasManasikPermission) this.loadManasikData(filter);
    }
  }

  loadTravelData(filter: any) {
    if (!this.hasTravelPermission) return;
    this._ReservationsService
      .getTravelReservationForVendor(filter)
      .pipe(
        catchError((err) => {
          console.error('Travel error:', err);
          return of({ data: { data: [], itemsCount: 0 } });
        })
      )
      .subscribe((response: any) => {
        this.travelList = response.data?.data || [];
        this.totalRecorsOfTravel = response.data?.itemsCount || 0;
        this.cdr.detectChanges();
      });
  }

  loadRoomData(filter: any) {
    if (!this.hasRoomPermission) return;
    this._ReservationsService
      .getRoomReservationForVendor(filter)
      .pipe(
        catchError((err) => {
          console.error('Room error:', err);
          return of({ data: { data: [], itemsCount: 0 } });
        })
      )
      .subscribe((response: any) => {
        this.roomsList = response.data?.data || [];
        this.totalRecorsOfRooms = response.data?.itemsCount || 0;
        this.cdr.detectChanges();
      });
  }

  loadOutingData(filter: any) {
    if (!this.hasOutingPermission) return;
    this._ReservationsService
      .getOutingReservationForVendor(filter)
      .pipe(
        catchError((err) => {
          console.error('Outing error:', err);
          return of({ data: { data: [], itemsCount: 0 } });
        })
      )
      .subscribe((response: any) => {
        this.outingsList = response.data?.data ?? response.data ?? [];
        this.totalRecorsOfOutings = response.data?.itemsCount ?? (Array.isArray(response.data) ? response.data.length : 0);
        this.cdr.detectChanges();
      });
  }

  loadManasikData(filter: any) {
    if (!this.hasManasikPermission) return;
    this._ReservationsService
      .getManasikReservationForVendor(filter)
      .pipe(
        catchError((err) => {
          console.error('Manasik error:', err);
          return of({ data: { data: [], itemsCount: 0 } });
        })
      )
      .subscribe((response: any) => {
        this.manasikList = response.data?.data ?? response.data ?? [];
        this.totalRecorsOfManasik = response.data?.itemsCount ?? (Array.isArray(response.data) ? response.data.length : 0);
        this.cdr.detectChanges();
      });
  }

  // Helper method if needed to satisfy template calling a generic method
  // But we will change template to call specific ones.
  // getVendorReservationsData is deprecated in favor of specific calls
  getVendorReservationsData(filter) {
    this.loadAllData(filter);
  }
  
  // --- كود ميزة الإلغاء اليدوي ---
  cancelReservation(booking: any) {
    const customerName = booking.customerName || 'Customer';
    const confirmed = confirm(`Are you sure, you want to cancel the booking of "${customerName}"?`);
    
    if (confirmed) {
      // هنا نقوم باستدعاء الـ API الخاص بالإلغاء
      // تأكد أن مبرمج الـ Backend وفر لنا مسار (endpoint) باسم cancelBooking
      this._ReservationsService.cancelBooking(booking.id).subscribe({
        next: (res) => {
          alert('Booking cancelled successfully');
          this.loadAllData(this.filter); // لتحديث الجدول بعد الحذف
        },
        error: (err) => {
          console.error('Error cancelling booking', err);
          alert('Failed to cancel booking');
        }
      });
    }
  }
  
}
