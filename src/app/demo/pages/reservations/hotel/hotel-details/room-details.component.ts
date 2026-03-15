import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { RoomService } from 'src/app/shared/services/room.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss'
})
export class RoomDetailsComponent implements OnInit {
  productStatus: boolean;
  room: any = {};
  roomId: any;
  imgs = [];
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  constructor(
    private RoomService: RoomService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id');
    console.log(this.roomId);
    this.gettingRoomById(this.roomId);
  }
  gettingRoomById(id) {
    this.RoomService.getRoomById(id).subscribe({
      next: (res) => {
        this.room = res.data;
        this.imgs = res.data.images.map((img) => environment.imgUrl + img.url);
        console.log(this.room);
      }
    });
  }


getRoomImages(room: any) {
  if (room.images?.length) {
    return room.images.map((img: any) => environment.imgUrl + img.url);
  } else if (room.groupImages?.length) {
    return room.groupImages.map((img: any) => environment.imgUrl + img.url);
  } else {
    return ['https://placehold.co/600x400?text=No+Image'];
  }
}


}
