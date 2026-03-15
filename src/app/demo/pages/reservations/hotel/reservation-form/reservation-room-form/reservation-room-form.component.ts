import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../../../shared/components/sub-header/sub-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from 'src/app/shared/services/room.service';

@Component({
  selector: 'app-reservation-room-form',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './reservation-room-form.component.html',
  styleUrl: './reservation-room-form.component.scss'
})
export class ReservationRoomFormComponent implements OnInit {
  hotelId: string = null;
  hotelRooms: any = [];
  constructor(
    private Router: Router,
    private route: ActivatedRoute,
    private RoomService: RoomService
  ) {}

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    console.log(this.hotelId);
    this.getRoomsByHotelId(this.hotelId);
  }

  getRoomsByHotelId(hotelId) {
    this.RoomService.getAllRooms({ HotelId: hotelId }).subscribe({
      next: (res) => {
        this.hotelRooms = res.data.data;
        console.log(this.hotelRooms);
      }
    });
  }

  bookRoom(room: any): void {
    console.log('Booking room:', room);
    this.Router.navigate(['/room-details-last-step', room]);
  }
}
