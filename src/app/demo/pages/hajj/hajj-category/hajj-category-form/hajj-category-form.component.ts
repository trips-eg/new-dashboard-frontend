import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { HajjCategoryService } from 'src/app/shared/services/hajj-category.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-hajj-category-form',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent],
  templateUrl: './hajj-category-form.component.html',
  styleUrl: './hajj-category-form.component.scss'
})
export class HajjCategoryFormComponent {
  hajjCategoryForm!: FormGroup;
  newImages: File[] = [];
  existingImages: { id: number; url: string }[] = [];
  showImageError = false;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private hajjCategoryService: HajjCategoryService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    if (this.config.data?.id) {
      this.loadCategoryDetails(this.config.data.id);
    }
  }

  initializeForm() {
    this.hajjCategoryForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(3)]],
      IsActive: [true],
      Sequence: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadCategoryDetails(id: number): void {
    this.hajjCategoryService.getHajjCategoryById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const category = res.data;
          const imageUrl = category.imageUrl || category.uploadedImage || category.imagePath;
          this.hajjCategoryForm.patchValue({
            Name: category.name,
            IsActive: category.isActive ?? true,
            Sequence: category.sequence ?? 0
          });

          if (imageUrl) {
            this.existingImages = [{ id: 0, url: imageUrl }];
          }
        }
      },
      error: (err) => {
        this.toaster.error('Failed to load category details', 'Error');
        console.error('Error loading hajj category:', err);
      }
    });
  }

  onImagesUpload(files: File[] | null): void {
    this.newImages = files || [];
    this.showImageError = false;
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    this.hajjCategoryForm.markAllAsTouched();
    this.hajjCategoryForm.updateValueAndValidity();

    this.showImageError = this.newImages.length === 0 && this.existingImages.length === 0;

    if (this.hajjCategoryForm.invalid || this.showImageError) {
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.hajjCategoryForm.get('Name')?.value);
    formData.append('IsActive', this.hajjCategoryForm.get('IsActive')?.value);
    formData.append('Sequence', this.hajjCategoryForm.get('Sequence')?.value);

    if (this.newImages.length > 0) {
      formData.append('UploadedImage', this.newImages[0]);
    }

    if (this.config.data?.id) {
      formData.append('id', this.config.data.id.toString());
      this.updateHajjCategory(formData);
    } else {
      this.createHajjCategory(formData);
    }
  }

  private createHajjCategory(formData: FormData) {
    this.hajjCategoryService.addHajjCategory(formData).subscribe({
      next: (res) => {
        this.toaster.success('Created successfully', 'Success');
        this.ref.close(res);
      },
      error: (err) => {
        this.toaster.error('Create error', 'Error');
        console.error('Create hajj category error:', err);
      }
    });
  }

  private updateHajjCategory(formData: FormData) {
    this.hajjCategoryService.updateHajjCategory(formData).subscribe({
      next: (res) => {
        this.toaster.success('Updated successfully', 'Success');
        this.ref.close(res);
      },
      error: (err) => {
        this.toaster.error('Update error', 'Error');
        console.error('Update hajj category error:', err);
      }
    });
  }

  get nameCtrl() {
    return this.hajjCategoryForm.get('Name');
  }

  get sequenceCtrl() {
    return this.hajjCategoryForm.get('Sequence');
  }
}