import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HajjUmmrahService } from '../../services/hajj-ummrah.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../components/sub-header/sub-header.component';
import { environment } from 'src/environments/environment';
import { Imanasik } from '../../model/imanasik-details';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manasik-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './manasik-details.component.html',
  styleUrl: './manasik-details.component.scss'
})
export class ManasikDetailsComponent {
  private route = inject(ActivatedRoute);
  private _service = inject(HajjUmmrahService);
  timelineAlign: string = 'left';
  
  constructor(private translate: TranslateService) {
    // Update alignment when language changes
    this.translate.onLangChange.subscribe((event) => {
      this.timelineAlign = event.lang === 'ar' ? 'right' : 'left';
    });
    
    // Set initial alignment
    this.timelineAlign = this.translate.currentLang === 'ar' ? 'right' : 'left';
  }
  manasik: Imanasik = null;
  loading = true;
  images: any[] = [];
  programs: any[] = [];
  paseurl = environment.imgUrl;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadDetails(id);
  }

  loadDetails(id: number) {
    this._service.getManasikById(id).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        this.manasik = data;
        // prepare images with base url
        this.images = (data.images || []).map((x: any) => this.paseurl + (x.imageUrl || x.image || '')) ?? [];
        // segments map to programs (for timeline)
        this.programs = data.segments || [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
