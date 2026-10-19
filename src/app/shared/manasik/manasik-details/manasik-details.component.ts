import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HajjUmmrahService } from '../../services/hajj-ummrah.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DetailPageHeaderComponent } from '../../components/detail-page-header/detail-page-header.component';
import { ItemReviewsComponent } from '../../components/item-reviews/item-reviews.component';
import { environment } from 'src/environments/environment';
import { Imanasik } from '../../model/imanasik-details';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manasik-details',
  standalone: true,
  imports: [SharedModule, DetailPageHeaderComponent, ItemReviewsComponent],
  templateUrl: './manasik-details.component.html',
  styleUrl: './manasik-details.component.scss'
})
export class ManasikDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(HajjUmmrahService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routeChanged = new Subject<void>();
  private readonly translate = inject(TranslateService);
  currentLang = this.translate.currentLang || 'en';
  timelineAlign = this.currentLang === 'ar' ? 'right' : 'left';
  manasik: Imanasik = null;
  itemId = 0;
  loading = true;
  loadError = false;
  images: string[] = [];
  programs: any[] = [];
  readonly responsiveOptions = [
    { breakpoint: '1024px', numVisible: 4 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 2 }
  ];

  constructor() {
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.currentLang = event.lang;
      this.timelineAlign = event.lang === 'ar' ? 'right' : 'left';
    });
  }
  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.routeChanged.next();
      this.routeChanged.complete();
    });
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.routeChanged.next();
      this.itemId = Number(params.get('id'));
      this.manasik = null;
      this.programs = [];
      this.loadDetails(this.itemId);
    });
  }
  loadDetails(id: number): void {
    this.loading = true;
    this.loadError = false;
    if (!Number.isInteger(id) || id <= 0) {
      this.loading = false;
      this.loadError = true;
      return;
    }
    this.service
      .getManasikById(id)
      .pipe(takeUntil(this.routeChanged), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res?.data ?? res;
          if (res?.success === false || !data?.id) {
            this.loading = false;
            this.loadError = true;
            return;
          }
          this.manasik = data;
          this.images = (data.images || []).map((image: any) => {
            const path = image.imageUrl || image.image || '';
            return /^https?:\/\//i.test(path) ? path : environment.imgUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
          });
          this.programs = data.segments || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.loadError = true;
        }
      });
  }
}
