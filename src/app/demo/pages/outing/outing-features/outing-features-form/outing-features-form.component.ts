import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';
import { OutingFeaturesService } from 'src/app/shared/services/outing-features.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-outing-features-form',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, ImgUploaderComponent, ButtonModule],
  templateUrl: './outing-features-form.component.html',
  styleUrl: './outing-features-form.component.scss'
})
export class OutingFeaturesFormComponent implements OnInit {
  featureForm: FormGroup;
  selectedImage: File | null = null;
  existingImage: string | null = null;
  showImageError = false;

  constructor(
    private fb: FormBuilder,
    private outingFeaturesService: OutingFeaturesService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.config.data?.id) {
      this.patchFormWithExistingData();
    }
  }

  get nameCtrl() {
    return this.featureForm.get('name');
  }

  private initForm() {
    this.featureForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private patchFormWithExistingData() {
    const featureData = this.config.data;
    this.featureForm.patchValue({
      name: featureData.name
    });
    if (featureData.image) {
      this.existingImage = featureData.image;
    }
  }

  onImageSelected(files: File[]) {
    if (files && files.length > 0) {
      this.selectedImage = files[0];
      this.showImageError = false;
    }
  }

  onSubmit() {
    if (this.featureForm.invalid || (!this.selectedImage && !this.existingImage)) {
      this.showImageError = !this.selectedImage && !this.existingImage;
      this.featureForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('name', this.nameCtrl?.value);

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.config.data?.id) {
      formData.append('id', this.config.data.id.toString());
      this.updateFeature(formData);
    } else {
      this.createFeature(formData);
    }
  }

  private createFeature(formData: FormData) {
    this.outingFeaturesService.addOutingFeature(formData).subscribe({
      next: () => {
        this.toastr.success('Feature created successfully');
        this.ref.close(true);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error creating feature');
      }
    });
  }

  private updateFeature(formData: FormData) {
    this.outingFeaturesService.updateOutingFeature(formData).subscribe({
      next: () => {
        this.toastr.success('Feature updated successfully');
        this.ref.close(true);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error updating feature');
      }
    });
  }
}
