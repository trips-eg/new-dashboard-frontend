import { Component } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [SharedModule,SubHeaderComponent],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss'
})
export class RoomDetailsComponent {
  productStatus:boolean
  handleAction(e){

  }
}
