import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesAganciesService } from 'src/app/shared/services/sales-agancies.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sales-agencies-form',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent, SubHeaderComponent],
  templateUrl: './sales-agencies-form.component.html',
  styleUrl: './sales-agencies-form.component.scss'
})
export class SalesAgenciesFormComponent {
  salesAgencyForm!: FormGroup;
  oldImage: any = null; // عشان لو بتعدل وعاوز تعرض الصورة القديمة
  selectedLogoFile!: File;
  id = this.route.snapshot.params['id'];

  constructor(
    private fb: FormBuilder,
    private SalesAganciesService: SalesAganciesService,
    private ToastrService: ToastrService,
    private route: ActivatedRoute,
    private Router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.id) {
      this.loadAgency(this.id);
    }
  }

  initForm() {
    this.salesAgencyForm = this.fb.group({
      Name: ['', Validators.required],
      Phone: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Address: ['', Validators.required],
      Description: [''],

      IsTravelCommission: [false, Validators.required],
      TravelCommissionRate: [0],

      IsHotelCommission: [false, Validators.required],
      HotelCommissionRate: [0]
    });
  }

  loadAgency(id) {
    this.SalesAganciesService.getSalesAgancyById(id).subscribe({
      next: (res) => {
        const agency = res.data; // حسب الـ API عندك

        this.salesAgencyForm.patchValue({
          Name: agency.name,
          Phone: agency.phone,
          Email: agency.email,
          Address: agency.address,
          Description: agency.description ,
          IsTravelCommission: agency.isTravelCommission,
          TravelCommissionRate: agency.travelCommissionRate,
          IsHotelCommission: agency.isHotelCommission,
          HotelCommissionRate: agency.hotelCommissionRate
        });

        // لو عندك صورة قديمة
        if (agency.logoUrl) {
          this.oldImage = agency.logoUrl;
        }
      }
    });
  }

  // لما المستخدم يرفع صورة
  onLogoFileSelect(files: File[]) {
    if (files && files.length > 0) {
      this.selectedLogoFile = files[0]; // أول صورة
      console.log('Selected file:', this.selectedLogoFile);
    } else {
      this.selectedLogoFile = null;
    }
  }

  submit() {
    if (this.salesAgencyForm.invalid) {
      this.salesAgencyForm.markAllAsTouched();
      return;
    }

    const formValues = this.salesAgencyForm.value;
    const formData = new FormData();

    formData.append('Name', formValues.Name);
    formData.append('Phone', formValues.Phone);
    formData.append('Email', formValues.Email);
    formData.append('Address', formValues.Address);
    formData.append('Description', formValues.Description);
    formData.append('IsTravelCommission', formValues.IsTravelCommission ? 'true' : 'false');
    formData.append('TravelCommissionRate', formValues.TravelCommissionRate.toString());
    formData.append('IsHotelCommission', formValues.IsHotelCommission ? 'true' : 'false');
    formData.append('HotelCommissionRate', formValues.HotelCommissionRate.toString());

    if (this.selectedLogoFile) {
      formData.append('ImageLogo', this.selectedLogoFile, this.selectedLogoFile.name);
    }

    if (this.id) {
      // Update
      formData.append('Id', this.id.toString());
      this.SalesAganciesService.updateSalesAgancy(formData).subscribe({
        next: (res) => {
          this.ToastrService.success(res.message, 'Updated');
          this.Router.navigate(['/Sales-Agencies']);
        }
      });
    } else {
      // Add
      this.SalesAganciesService.setSalesAgancy(formData).subscribe({
        next: (res) => {
          this.ToastrService.success(res.message, 'Added');
          this.Router.navigate(['/Sales-Agencies']);
        }
      });
    }
  }
}
