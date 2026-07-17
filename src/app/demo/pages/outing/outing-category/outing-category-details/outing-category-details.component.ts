import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingCategoryServiseService } from 'src/app/shared/services/outing-category-servise.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-outing-category-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './outing-category-details.component.html',
  styleUrl: './outing-category-details.component.scss'
})
export class OutingCategoryDetailsComponent implements OnInit {
  category: any = null;
  loading: boolean = true;
  baseUrl: string = environment.imgUrl;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private outingCategoryService: OutingCategoryServiseService
  ) {
    // If data is passed directly, we can use it as initial fallback state
    if (this.config.data) {
      this.category = this.config.data;
    }
  }

  ngOnInit(): void {
    if (this.config.data && this.config.data.id) {
      this.loadCategoryDetails(this.config.data.id);
    } else {
      this.loading = false;
    }
  }

  loadCategoryDetails(id: number): void {
    this.loading = true;
    this.outingCategoryService.getOutingCategoryById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.category = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching category details:', err);
        this.loading = false;
      }
    });
  }

  getImageUrl(url: string): string {
    return url ? `${this.baseUrl}${url}` : 'https://placehold.co/600x400?text=No+Image';
  }

  close(): void {
    this.ref.close();
  }
}
