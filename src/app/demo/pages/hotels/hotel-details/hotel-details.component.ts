import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { HotelService } from 'src/app/shared/services/hotel.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.scss'
})
export class HotelDetailsComponent {
  hotel: any = {}; // Replace 'any' with your Hotel interface
  rooms: any[] = []; // Replace 'any' with your Room interface
  hotelGalleryImages: string[] = [];
  imgs;
  roomImgs

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
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private Router: Router,
    private ToastrService: ToastrService
  ) {}
  goToRoomlReservationForm(id) {
    console.log('room-reservation-step');
    this.Router.navigate(['/room-details-last-step', id]);
  }
  ngOnInit(): void {
    // Get the hotel ID from the route parameters
    this.route.params.subscribe((params) => {
      const hotelId = +params['id']; // '+' converts string to number
      this.getHotelDetails(hotelId); // Fetch hotel details using the service
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

  private getHotelDetails(hotelId: number): void {
    this.hotelService.getHotelById(hotelId).subscribe({
      next: (res) => {
        this.hotel = res.data;
        this.rooms = res.data.rooms || []; //  rooms is an array
        this.imgs = res.data.images.map((img) => environment.imgUrl + img.url);
        //this.roomImgs = res.data.rooms.images.map((img) => environment.imgUrl + img.url);
      },
      error: (error) => {
        console.error('Error fetching hotel details:', error);
        this.ToastrService.error('Failed to load hotel details', 'Error');
      }
    });
  }
  
}
