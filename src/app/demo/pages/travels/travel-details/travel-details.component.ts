import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-travel-details',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './travel-details.component.html',
  styleUrl: './travel-details.component.scss'
})
export class TravelDetailsComponent implements OnInit {
  data: any;
  programs: any;
  travelId: number = null;
  currentLang = this.translateService.currentLang;
  paseurl = environment.imgUrl;

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
    private TravelTripsService: TravelTripsService,
    private ActivatedRoute: ActivatedRoute,
    private translateService: TranslateService
  ) {}
  ngOnInit(): void {
    this.ActivatedRoute.params.subscribe((params) => {
      this.travelId = params['id'];
      this.getTravelDetails();
      this.getPrograms();
    });
  }
  getTravelDetails() {
    this.TravelTripsService.getTravelById(this.travelId).subscribe((res: any) => {
      this.data = res.data;
      this.imgs = res.data.images.map((img) => this.paseurl + img.imageUrl);
      console.log('.............--------------------.............----....--..-.-.-.-', this.imgs);
    });
  }
  getPrograms() {
    this.TravelTripsService.getProgramStepsByTripId(this.travelId).subscribe((res: any) => {
      this.programs = res.data;
      console.log(this.programs);
    });
  }
}
