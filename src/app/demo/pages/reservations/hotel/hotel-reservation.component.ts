import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hotel-reservation',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, ReservationListComponent],
  templateUrl: './hotel-reservation.component.html',
  styleUrl: './hotel-reservation.component.scss'
})
export class HotelReservationComponent {
  constructor(private Router: Router) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToHotelReservationForm();
        break;
    }
  }

  goToHotelReservationForm() {
    console.log('hotel-reservation-step');
    this.Router.navigate(['/hotel-reservation-step']);
  }
}
