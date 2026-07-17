import { OutingCategoryServiseService } from './../../../../../shared/services/outing-category-servise.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';

@Component({
  selector: 'app-outing-categoryform',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent],
  templateUrl: './outing-categoryform.component.html',
  styleUrl: './outing-categoryform.component.scss'
})
export class OutingCategoryformComponent {
  OutingCategoryform: FormGroup;
  newImages: File[] = [];
  existingImages: { id: number; url: string }[] = [];
  showImageError = false;
  

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private OutingCategoryServise: OutingCategoryServiseService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Populate data if edit mode
    if (this.config.data && this.config.data.id) {
      this.loadCategoryDetails(this.config.data.id);
    }
  }

  loadCategoryDetails(id: number): void {
    this.OutingCategoryServise.getOutingCategoryById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const category = res.data;
          this.OutingCategoryform.patchValue({
            Name: category.name,
            Description: category.description,
            IsActive: category.isActive ?? true,
            Sequence: category.sequence ?? 0
          });

          if (category.imageUrl) {
            this.existingImages = [{ id: 0, url: category.imageUrl }];
          }
        }
      },
      error: (err) => {
        this.toaster.error('Failed to load category details', 'Error');
        console.error('Error loading category:', err);
      }
    });
  }

  initializeForm() {
    this.OutingCategoryform = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(3)]],
      Description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]] ,
      IsActive: [true],
      Sequence: [0, [Validators.required, Validators.min(0)]]
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
  // Mark all controls touched and validate
  this.OutingCategoryform.markAllAsTouched();
  this.OutingCategoryform.updateValueAndValidity();

  // Validate image
  this.showImageError = this.newImages.length === 0 && this.existingImages.length === 0;

  // Stop submission if any invalid
  if (this.OutingCategoryform.invalid || this.showImageError) {
    return;
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append('Name', this.OutingCategoryform.get('Name')?.value);
  formData.append('Description', this.OutingCategoryform.get('Description')?.value);
  formData.append('IsActive', this.OutingCategoryform.get('IsActive')?.value);
  formData.append('Sequence', this.OutingCategoryform.get('Sequence')?.value);

  if (this.newImages.length > 0) {
    formData.append('UploadedImage', this.newImages[0]);
  }

  // Add id if in edit mode (backend expects it in body)
  if (this.config?.data?.id) {
    formData.append('id', this.config.data.id.toString());
    this.updateOutingCategory(formData);
  } else {
    this.createOutingCategory(formData);
  }
}



  private createOutingCategory(formData: FormData) {
    this.OutingCategoryServise.setOutingCategory(formData).subscribe({
      next: (res) => {
        this.toaster.success('Created successfully', 'Success');
        this.ref.close(res);
      },
      error: (err) => {
        this.toaster.error('Create error', 'Error');
        console.error('Create error:', err);
      }
    });
  }

  private updateOutingCategory(formData: FormData) {
  this.OutingCategoryServise.updateOutingCategory(formData).subscribe({
    next: (res) => {
      this.toaster.success('Updated successfully', 'Success');
      this.ref.close(res);
    },
    error: (err) => {
      this.toaster.error('Update error', 'Error');
      console.error('Update error:', err);
    }
  });
}


  // Helpers for template readability
  get nameCtrl() {
    return this.OutingCategoryform.get('Name');
  }

  get descCtrl() {
    return this.OutingCategoryform.get('Description');
  }

  get sequenceCtrl() {
    return this.OutingCategoryform.get('Sequence');
  }
}
