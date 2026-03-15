import { AfterViewInit, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../components/sub-header/sub-header.component';
import { ActivatedRoute, Route } from '@angular/router';
import { ReservationsService } from '../services/reservations.service';
import { TravelBookingInfoComponent } from '../tables-booking-info/travel-booking-info/travel-booking-info.component';
import { RoomBookingInfoComponent } from '../tables-booking-info/room-booking-info/room-booking-info.component';
import { ItravelbookingInfo } from '../model/itravelbooking-info';
import { IroomBookingInfo } from '../model/iroom-booking-info';
import { EnumsService } from '../services/enums.service';
import { TranslateService } from '@ngx-translate/core';
import { OutingBookingInfoComponent } from '../tables-booking-info/outing-booking-info/outing-booking-info.component';
import { ManasikBookingInfoComponent } from "../tables-booking-info/manasik-booking-info/manasik-booking-info.component";

@Component({
  selector: 'app-payment-info',
  standalone: true,
  imports: [
    SharedModule,
    SubHeaderComponent,
    TravelBookingInfoComponent,
    RoomBookingInfoComponent,
    OutingBookingInfoComponent,
    ManasikBookingInfoComponent
],
  templateUrl: './payment-info.component.html',
  styleUrl: './payment-info.component.scss'
})
export class PaymentInfoComponent implements OnInit ,AfterViewInit {
  paymentId: number = 0;
  paymentRef: number = 0;
  reservationData: any = {};
  paymentStatus: any[] = [];
  roomReservationDetail: IroomBookingInfo[] = [];
  travelReservationDetail: ItravelbookingInfo[] = [];
  outingReservationDetail: any[] = [];
  hajjReservationDetail: any[] = [];
  reservationUser = {};
  totalRecorsOfTravel = 0;
  totalRecorsOfRooms = 0;
  totalRecorsOfOutings = 0;
  totalRecorsOfHajj = 0;
  isLoading:boolean = false;

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private ReservationsService: ReservationsService,
    private cdr: ChangeDetectorRef,
    private EnumsService: EnumsService,
    private translate: TranslateService
  ) {}
  
  ngOnInit(): void {
    this.paymentId = this.ActivatedRoute.snapshot.params['id'];
    this.paymentRef = this.ActivatedRoute.snapshot.params['paymentRef'];
    console.log(this.paymentId);
    if (this.paymentId) this.getpayMentInfo(this.paymentId);
    if (this.paymentRef) this.getpayMentInfoByRef(String(this.paymentRef));

    this.getStatus();
  }
  
  ngAfterViewInit(): void {
    this.isLoading = false;
  }

  getroomReservationDetail() {
    this.ReservationsService.getRoomReservationDetail(this.paymentId).subscribe({
      next: (res) => {
        this.roomReservationDetail = res.data;
        this.totalRecorsOfRooms = res.data.itemsCount;
      }
    });
  }
  
  getTravelReservationDetail() {
    this.ReservationsService.getTravelReservationDetail(this.paymentId).subscribe({
      next: (res) => {
        this.travelReservationDetail = res.data;
        this.totalRecorsOfTravel = res.data.itemsCount;
      }
    });
  }
  
  getOutingReservationDetail() {
    this.ReservationsService.getOutingReservationDetail(this.paymentId).subscribe({
      next: (res) => {
        this.outingReservationDetail = res.data;
        this.totalRecorsOfOutings = res.data.itemsCount;
      }
    });
  }

  getHajjReservationDetail() {
    this.ReservationsService.getManasikReservationDetail(this.paymentId).subscribe({
      next: (res) => {
        console.log('Hajj Reservation Detail:', res);
        this.hajjReservationDetail = res.data;
        this.totalRecorsOfHajj = res.data.itemsCount || res.data.length;
      },
      error: (err) => {
        console.error('Error fetching Hajj reservation detail:', err);
      }
    });
  }

  getpayMentInfo(id: number) {
    this.isLoading = true;
    this.ReservationsService.getReservationById(id).subscribe({
      next: (res) => {
        console.log(res);
        this.reservationData = res.data;
        this.reservationUser = res.data.user;
        this.getroomReservationDetail();
        this.getTravelReservationDetail();
        this.getOutingReservationDetail();
        this.getHajjReservationDetail();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
  getpayMentInfoByRef(ref: string) {
    this.ReservationsService.getBookingByRefrance(ref).subscribe({
      next: (res) => {
        debugger;
        console.log(res);
        this.reservationData = res.data;
        this.reservationUser = res.data.user;
        this.roomReservationDetail = res.data.roomBookings;
        this.travelReservationDetail = res.data.tripReservations;
        this.outingReservationDetail = res.data.outingReservations;
        this.hajjReservationDetail = res.data.hajjReservations;
        
        // Set total records for each type
        this.totalRecorsOfRooms = res.data.roomBookings?.length || 0;
        this.totalRecorsOfTravel = res.data.tripReservations?.length || 0;
        this.totalRecorsOfOutings = res.data.outingBookings?.length || 0;
        this.totalRecorsOfHajj = res.data.hajjBookings?.length || 0;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getStatusLabel(value: number): string {
    const status = this.paymentStatus.find((s) => s.value === value);
    console.log(status);
    const lang = this.translate.currentLang;
    if (!status) return lang === 'ar' ? 'غير معروف' : 'Unknown';
    return lang === 'ar' ? status.nameAr : status.nameEn;
  }

  getStatusClass(value: number): string {
    switch (value) {
      case 1:
        return 'status-pending';
      case 2:
        return 'status-confirmed';
      case 3:
        return 'status-cancelled';
      case 4:
        return 'status-completed';
      case 5:
        return 'status-refunded';
      default:
        return 'status-unknown';
    }
  }

  getStatus() {
    this.EnumsService.getPaymentStatus().subscribe({
      next: (res) => {
        this.paymentStatus = res;
      }
    });
  }
}