import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';

import { AdvertisingsService } from 'src/app/shared/services/advertisings.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-advertisings-form',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent, SubHeaderComponent],
  templateUrl: './advertisings-form.component.html',
  styleUrl: './advertisings-form.component.scss'
})
export class AdvertisingsFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private _AdvertisingsService = inject(AdvertisingsService);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router);
  private _ActivatedRoute = inject(ActivatedRoute);
  id = this._ActivatedRoute.snapshot.params['id'];
  paseUrl = environment.imgUrl;
  addsForm!: FormGroup;
  selectedImage: File | null = null;
  oldImage = '';

  ngOnInit(): void {
    this.buildAddsForm();
    if (this.id) {
      this.getAdById();
    }
    console.log(this.id);
  }

  getAdById() {
    this._AdvertisingsService.getAddById(this.id).subscribe({
      next: (res) => {
        const data = res.data;
        this.oldImage = res.data.imageUrl;

        this.addsForm.patchValue({
          Id: data.id,
          Title: data.title,
          TitleAr: data.titleAr,
          Description: data.description,
          DescriptionAr: data.descriptionAr,
          LinkUrl: data.linkUrl,
          ExpiryDate: data.expiryDate ? new Date(data.expiryDate) : null
        });
      }
    });
  }

  buildAddsForm() {
    this.addsForm = this.formBuilder.group({
      Id: [null],
      Title: ['', Validators.required],
      TitleAr: ['', Validators.required],
      Description: ['', Validators.required],
      DescriptionAr: ['', Validators.required],
      LinkUrl: [''],
      ExpiryDate: ['', Validators.required],
      Image: [null] // هنحط فيها الملف
    });
  }

  onLogoFileSelect(event: any): void {
    this.selectedImage = event[0];
  }

  buildFormData(): FormData {
    const v = this.addsForm.value;
    const fd = new FormData();
    fd.append('Id', v.Id ?? '');
    fd.append('Title', v.Title ?? '');
    fd.append('TitleAr', v.TitleAr ?? '');
    fd.append('Description', v.Description ?? '');
    fd.append('DescriptionAr', v.DescriptionAr ?? '');
    fd.append('LinkUrl', v.LinkUrl ?? '');

    if (v.ExpiryDate) {
      const isoDate = new Date(v.ExpiryDate).toISOString();
      fd.append('ExpiryDate', isoDate);
    } else {
      fd.append('ExpiryDate', '');
    }

    // ✅ إضافة الصورة لو موجودة
    if (this.selectedImage) {
      fd.append('Image', this.selectedImage, this.selectedImage.name);
    }

    return fd;
  }

  onDelete(id) {
    this._AdvertisingsService.deleteAdvertising(id).subscribe({
      next: (res) => {}
    });
  }

  submit() {
    if (this.addsForm.invalid) {

      this.addsForm.markAllAsTouched();
      return;
    }
    const formData = this.buildFormData();

    if (this.id) {
      // ✅ Update mode
      this._AdvertisingsService.updateAdd(formData).subscribe({
        next: (res) => {
          this._ToastrService.success(res.message, 'Updated');
          this._Router.navigate(['/advertisings']);
        }
      });
    } else {
      // ✅ Create mode
      this._AdvertisingsService.setAdvertising(formData).subscribe({
        next: (res) => {
          this._ToastrService.success(res.message, 'Created');
          this._Router.navigate(['/advertisings']);
        }
      });
    }
  }
}
