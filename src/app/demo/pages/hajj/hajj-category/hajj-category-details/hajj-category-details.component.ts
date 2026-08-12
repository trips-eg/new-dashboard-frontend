import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { environment } from 'src/environments/environment';
import { HajjCategoryService } from 'src/app/shared/services/hajj-category.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-hajj-category-details',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './hajj-category-details.component.html',
  styleUrl: './hajj-category-details.component.scss'
})
export class HajjCategoryDetailsComponent {
  category: any;
  loading = false;
  baseUrl = environment.imgUrl;

  constructor(
    public config: DynamicDialogConfig,
    private hajjCategoryService: HajjCategoryService
  ) {}

  ngOnInit(): void {
    if (this.config.data?.id) {
      this.loadCategoryDetails(this.config.data.id);
    }
  }

  loadCategoryDetails(id: number) {
    this.loading = true;
    this.hajjCategoryService.getHajjCategoryById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.category = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading hajj category details:', err);
        this.loading = false;
      }
    });
  }

  getImageUrl(): string {
    const imageUrl = this.category?.imageUrl || this.category?.uploadedImage || this.category?.imagePath;
    return imageUrl ? this.baseUrl + imageUrl : 'https://placehold.co/600x400?text=No+Image';
  }
}