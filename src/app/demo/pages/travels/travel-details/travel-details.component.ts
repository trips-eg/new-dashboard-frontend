import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-travel-details',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './travel-details.component.html',
  styleUrl: './travel-details.component.scss'
})
export class TravelDetailsComponent implements OnInit {
  data: any = null;
  programs: any[] = [];
  travelId: number = null;
  isLoading: boolean = true;
  currentLang = this.translateService.currentLang;
  paseurl = environment.imgUrl;

  imgs: string[] = [];
  actionButtons: any[] = [];
  timelineAlign: string = 'left';

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
    private router: Router,
    private ActivatedRoute: ActivatedRoute,
    private TravelTripsService: TravelTripsService,
    private translateService: TranslateService,
    private configureService: ConfigureService
  ) {
    this.timelineAlign = this.translateService.currentLang === 'ar' ? 'right' : 'left';
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.timelineAlign = event.lang === 'ar' ? 'right' : 'left';
    });
  }

  ngOnInit(): void {
    this.ActivatedRoute.params.subscribe((params) => {
      this.travelId = params['id'];
      this.initActionButtons();
      this.getTravelDetails();
      this.getPrograms();
    });
  }

  canEdit(): boolean {
    const roles = this.configureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.') || role.startsWith('Admin') || role.startsWith('SuperAdmin'));
  }

  initActionButtons() {
    this.actionButtons = [
      { label: 'Back', action: 'back', icon: 'pi pi-arrow-left', class: 'btn-outline-secondary' },
      ...(this.canEdit() ? [{ label: 'Edit Trip', action: 'edit', icon: 'pi pi-pencil', class: 'btn-primary' }] : [])
    ];
  }

  handleAction(event: any) {
    if (event.action === 'edit') {
      this.router.navigate(['/travel-form'], { queryParams: { id: this.travelId, mode: 'edit' } });
    } else if (event.action === 'back') {
      this.router.navigate(['/travels']);
    }
  }

  setPrograms(list: any[]) {
    this.programs = (list || []).map((item, idx) => ({
      ...item,
      stepNumber: idx + 1
    }));
  }

  getStepIndex(program: any): number {
    if (program && program.stepNumber) {
      return program.stepNumber;
    }
    if (this.programs && this.programs.length) {
      const idx = this.programs.indexOf(program);
      if (idx !== -1) return idx + 1;
    }
    return 1;
  }

  getTravelDetails() {
    this.isLoading = true;
    this.TravelTripsService.getTravelById(this.travelId).subscribe({
      next: (res: any) => {
        this.data = res.data;
        this.imgs = res.data?.images?.map((img: any) => this.paseurl + img.imageUrl) || [];
        if (!this.programs || !this.programs.length) {
          this.setPrograms(res.data?.segments || []);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching trip details:', err);
      }
    });
  }

  getPrograms() {
    this.TravelTripsService.getProgramStepsByTripId(this.travelId).subscribe({
      next: (res: any) => {
        if (res.data && res.data.length) {
          this.setPrograms(res.data);
        } else if (this.data?.segments) {
          this.setPrograms(this.data.segments);
        }
      },
      error: () => {
        if (this.data?.segments) {
          this.setPrograms(this.data.segments);
        }
      }
    });
  }

  getTripTypeBadge(type?: number): { label: string; severity: 'info' | 'warning' | 'success' | 'secondary'; icon: string } {
    switch (type) {
      case 1:
        return { label: 'Normal', severity: 'info', icon: 'pi pi-calendar' };
      case 2:
        return { label: 'Periodic', severity: 'warning', icon: 'pi pi-clock' };
      case 3:
        return { label: 'Day Use', severity: 'success', icon: 'pi pi-sun' };
      default:
        return { label: 'Normal', severity: 'secondary', icon: 'pi pi-tag' };
    }
  }

  getDateStatus(startDate: string, endDate?: string): { label: string; severity: 'success' | 'info' | 'warning' | 'secondary' } {
    if (!startDate || startDate.startsWith('0001-01-01')) return { label: 'Upcoming', severity: 'info' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = endDate && !endDate.startsWith('0001-01-01') ? new Date(endDate) : new Date(startDate);
    end.setHours(23, 59, 59, 999);

    if (today < start) {
      return { label: 'Upcoming', severity: 'info' };
    } else if (today >= start && today <= end) {
      return { label: 'In Progress', severity: 'warning' };
    } else {
      return { label: 'Completed', severity: 'secondary' };
    }
  }

  getOccupancyRate(): number {
    if (!this.data || !this.data.capacity) return 0;
    const booked = this.data.capacity - (this.data.remainingSeats || 0);
    return Math.max(0, Math.min(100, Math.round((booked / this.data.capacity) * 100)));
  }

  getSegmentIcon(program: any): string {
    const type = program?.type;
    const name = ((program?.typeObj?.nameEn || '') + ' ' + (program?.typeObj?.nameAr || '')).toLowerCase();
    if (type === 1 || name.includes('transport') || name.includes('نقل') || name.includes('انتقال')) {
      return 'fa-solid fa-bus';
    }
    if (type === 2 || name.includes('hotel') || name.includes('فندق') || name.includes('إقامة')) {
      return 'fa-solid fa-hotel';
    }
    if (name.includes('flight') || name.includes('طيران') || name.includes('مطار')) {
      return 'fa-solid fa-plane-departure';
    }
    if (name.includes('meal') || name.includes('مطعم') || name.includes('وجبة') || name.includes('غداء') || name.includes('عشاء')) {
      return 'fa-solid fa-utensils';
    }
    if (name.includes('tour') || name.includes('جولة') || name.includes('نشاط') || name.includes('زيارة')) {
      return 'fa-solid fa-compass';
    }
    return 'fa-solid fa-location-dot';
  }

  getSegmentTypeClass(program: any): string {
    const type = program?.type;
    const name = ((program?.typeObj?.nameEn || '') + ' ' + (program?.typeObj?.nameAr || '')).toLowerCase();
    if (type === 1 || name.includes('transport') || name.includes('نقل')) return 'segment-type-transport';
    if (type === 2 || name.includes('hotel') || name.includes('فندق') || name.includes('إقامة')) return 'segment-type-hotel';
    if (name.includes('flight') || name.includes('طيران')) return 'segment-type-flight';
    if (name.includes('meal') || name.includes('مطعم') || name.includes('وجبة')) return 'segment-type-meal';
    if (name.includes('tour') || name.includes('جولة') || name.includes('نشاط')) return 'segment-type-tour';
    return 'segment-type-default';
  }
}
