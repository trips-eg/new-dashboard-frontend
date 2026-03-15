import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OutingService } from 'src/app/shared/services/outing.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-outing-details',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './outing-details.component.html',
  styleUrls: ['./outing-details.component.scss']
})
export class OutingDetailsComponent implements OnInit {
  outing: any = null;
  outingId: number | null = null;
  imgBaseUrl: string = environment.imgUrl || '';
  imgs: string[] = []; // used by Galleria (same name as travel example)
  currentLang: string;
  scheduledDates: Date[][] = []; // Store dates for each schedule

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 4 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  constructor(
    private route: ActivatedRoute,
    private outingService: OutingService,
    private translateService: TranslateService
  ) {
    this.currentLang = this.translateService.currentLang || 'en';
    // Ensure no trailing slash
    this.imgBaseUrl = this.imgBaseUrl.replace(/\/$/, '');
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.outingId = +params['id'];
      this.getOutingDetails();
    });
  }

  getOutingDetails() {
    if (!this.outingId) return;

    this.outingService.getOutingById(this.outingId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.outing = res.data;
          this.buildImages();
          this.processScheduleDates();
        } else {
          console.error('Failed to load outing or invalid response:', res);
        }
      },
      error: (err) => {
        console.error('Error loading outing details:', err);
      }
    });
  }

  private buildImages() {
    if (!this.outing?.images?.length) {
      this.imgs = [];
      return;
    }

    this.imgs = this.outing.images.map((img: any) => {
      const path = (img.url || img.path || img.imageUrl || '').toString();
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `${this.imgBaseUrl}/${cleanPath}`;
    });

    console.log('Final image URLs:', this.imgs);
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/no-image.png'; // ضع صورة افتراضية في assets
  }

  private processScheduleDates() {
    if (!this.outing?.outingSchedules?.length) {
      this.scheduledDates = [];
      return;
    }

    // Process dates and convert validFrom/validTo to Date objects
    this.outing.outingSchedules.forEach((schedule: any) => {
      // Convert validFrom and validTo to Date objects
      if (schedule.validFrom && typeof schedule.validFrom === 'string') {
        schedule.validFrom = new Date(schedule.validFrom);
      }
      if (schedule.validTo && typeof schedule.validTo === 'string') {
        schedule.validTo = new Date(schedule.validTo);
      }
    });

    this.scheduledDates = this.outing.outingSchedules.map((schedule: any) => {
      if (!schedule.days?.length) return [];
      return schedule.days.map((day: string) => new Date(day));
    });
  }

  getDayOfWeekName(dayNumber: number): string {
    // API uses 1-based index: 1=Saturday, 2=Sunday, 3=Monday, etc.
    const days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ,'Saturday'];
    return days[dayNumber] || 'N/A';
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return 'N/A';

    // If it's in ISO format (contains 'Z' or 'T'), extract just the time part
    if (timeStr.includes('Z') || timeStr.includes('T')) {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // If it's already in HH:mm format, return as is
    return timeStr;
  }
}
