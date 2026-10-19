import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import { ItemReviewsComponent } from 'src/app/shared/components/item-reviews/item-reviews.component';
import { Router, ActivatedRoute } from '@angular/router';
import {
  DetailPageHeaderComponent,
  DetailHeaderAction
} from '../../../../shared/components/detail-page-header/detail-page-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-travel-details',
  standalone: true,
  imports: [DetailPageHeaderComponent, SharedModule, ItemReviewsComponent],
  templateUrl: './travel-details.component.html',
  styleUrl: './travel-details.component.scss'
})
export class TravelDetailsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly routeChanged = new Subject<void>();
  loadError = false;
  data: any = null;
  programs: any[] = [];
  travelId: number = null;
  isLoading: boolean = true;
  currentLang = this.translateService.currentLang;
  paseurl = environment.imgUrl;

  imgs: string[] = [];
  actionButtons: DetailHeaderAction[] = [];
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
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.currentLang = event.lang;
      this.timelineAlign = event.lang === 'ar' ? 'right' : 'left';
    });
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.routeChanged.next();
      this.routeChanged.complete();
    });
    this.ActivatedRoute.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.routeChanged.next();
      this.data = null;
      this.programs = [];
      this.travelId = Number(params['id']);
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
    this.actionButtons = [...(this.canEdit() ? [{ label: 'Edit Trip', action: 'edit', icon: 'pi pi-pencil' }] : [])];
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
    this.loadError = false;
    if (!Number.isInteger(this.travelId) || this.travelId <= 0) {
      this.isLoading = false;
      this.loadError = true;
      return;
    }
    this.TravelTripsService.getTravelById(this.travelId)
      .pipe(takeUntil(this.routeChanged), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res?.success === false || !res?.data) {
            this.isLoading = false;
            this.loadError = true;
            return;
          }
          this.data = res.data;
          this.imgs = res.data?.images?.map((img: any) => this.paseurl + img.imageUrl) || [];
          if (!this.programs || !this.programs.length) {
            this.setPrograms(res.data?.segments || []);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.loadError = true;
          console.error('Error fetching trip details:', err);
        }
      });
  }

  getPrograms() {
    if (!Number.isInteger(this.travelId) || this.travelId <= 0) return;
    this.TravelTripsService.getProgramStepsByTripId(this.travelId)
      .pipe(takeUntil(this.routeChanged), takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
