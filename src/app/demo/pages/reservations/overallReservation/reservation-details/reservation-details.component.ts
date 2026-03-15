import { Component } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [SharedModule,SubHeaderComponent],
  templateUrl: './reservation-details.component.html',
  styleUrl: './reservation-details.component.scss'
})
export class ReservationDetailsComponent {

}
