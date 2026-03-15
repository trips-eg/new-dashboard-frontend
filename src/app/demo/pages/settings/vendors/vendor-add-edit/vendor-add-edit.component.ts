import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Vendor } from 'src/app/shared/model/vendoreDto';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { SalesAganciesService } from 'src/app/shared/services/sales-agancies.service';

@Component({
  selector: 'app-vendor-add-edit',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, ImgUploaderComponent],
  templateUrl: './vendor-add-edit.component.html',
  styleUrls: ['./vendor-add-edit.component.scss'],
  providers: [MessageService]
})
export class VendorAddEditComponent implements OnInit {
  vendorId: string | null = null;
  form: FormGroup;
  submitted = false;
  logoFile: File | null = null;
  oldImage = '';
  licenceFiles: File[] = [];
  commercialFiles: File[] = [];
  oldlicenceFiles: File[] = [];
  oldcommercialFiles: File[] = [];
  showLicenceMessage = false;
  showCommercialMessage = false;

  isHotel = false;
  isTravel = false;
   isHajj = false;
  isOut = false;
  showLogoMessage = false;
  salesAgencies: any[] = [];
  filterMap: FilterMap = {
    pageIndex: 1,
    pageSize: 10,
    sort: '',
    Search: ''
  };
  constructor(
    private salesAganciesService: SalesAganciesService,
    private readonly formBuilder: FormBuilder,
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private location: Location,
    private messageService: MessageService,
    private ToastrService: ToastrService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['id']) this.vendorId = params['id'];
      this.getVendorById(this.vendorId);
    });
  }
  loadSalesAgancies(): void {
    this.salesAganciesService.getSalesAgancies(this.filterMap).subscribe({
      next: (res: any) => {
        this.salesAgencies = res.data.data || [];
      }
    });
  }
  onsalesAgentsFilter(event: any): void {
    this.filterMap.Search = event.filter; // الكلمة اللي المستخدم كتبها
    this.filterMap.pageIndex = 1; // نرجع لأول صفحة
    this.loadSalesAgancies();
  }
  ngOnInit(): void {
    this.initializeForm();
    this.loadSalesAgancies();
  }

  private initializeForm(): void {
    this.form = this.formBuilder.group({
      Id: [0], // integer
      Name: ['', Validators.required], // string
      Description: ['', Validators.required], // string
      Email: ['', [Validators.required, Validators.email]], // email
      Address: ['', Validators.required], // string
      Phone: ['', [Validators.required]], // phone
      SalesId: [null],
      IsHotelCommission: [false], // boolean
      HotelCommissionRate: [0], // number
      IsTravelCommission: [false], // boolean
      TravelCommissionRate: [0] , // number
       

      // ✅ New commissions
      IsHajjCommission: [false],
      HajjCommissionRate: [0],
      IsOutCommission: [false],
      OutCommissionRate: [0]
    });
  }

  getVendorById(vendorId) {
    this.vendorService.getVendorById(vendorId).subscribe(
      (response) => {
        if (response.success) {
          debugger;
          let vendor = response.data;

          // Bind travel data to travelForm
          this.bindFormDate(vendor);
          if (vendor?.logoUrl) {
            this.oldImage = vendor.logoUrl;
          }
          if (vendor?.licenceDocuments) {
            this.oldlicenceFiles = vendor.licenceDocuments;
          }

          if (vendor?.commercialDocuments) {
            this.oldcommercialFiles = vendor.commercialDocuments; // روابط أو أسماء من الباك
          }

          this.isHotel = this.form.get('IsHotelCommission').value;
          this.isTravel = this.form.get('IsTravelCommission').value;
           this.isHajj = this.form.get('IsHajjCommission').value;
          this.isOut = this.form.get('IsOutCommission').value;
        }
      },
      (error) => {}
    );
  }
  addVendor(): void {
    this.submitted = true;
    this.form.get('IsHotelCommission').setValue(this.isHotel);
    this.form.get('IsTravelCommission').setValue(this.isTravel);

    if (!this.isHotel) this.form.get('HotelCommissionRate').setValue(0);
    if (!this.isTravel) this.form.get('TravelCommissionRate').setValue(0);

    const isFormInvalid = this.form.invalid;
    const isLogoMissing = !this.logoFile;
    const isLicenceMissing = this.licenceFiles.length === 0;
    const isCommercialMissing = this.commercialFiles.length === 0;

    this.showLogoMessage = isLogoMissing;
    this.showLicenceMessage = isLicenceMissing;
    this.showCommercialMessage = isCommercialMissing;

    if (isFormInvalid || isLogoMissing || isLicenceMissing || isCommercialMissing) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitFormData();
  }

  updateVendor(): void {
    this.submitted = true;
    this.form.get('IsHotelCommission').setValue(this.isHotel);
    this.form.get('IsTravelCommission').setValue(this.isTravel);

    if (!this.isHotel) this.form.get('HotelCommissionRate').setValue(0);
    if (!this.isTravel) this.form.get('TravelCommissionRate').setValue(0);
    if (!this.isHajj) this.form.get('HajjCommissionRate').setValue(0);
    if (!this.isOut) this.form.get('OutCommissionRate').setValue(0);

    const isFormInvalid = this.form.invalid;
    const isLogoMissing = !this.logoFile && !this.oldImage;
    const isLicenceMissing = this.licenceFiles.length === 0 && this.oldlicenceFiles.length === 0;
    const isCommercialMissing = this.commercialFiles.length === 0 && this.oldcommercialFiles.length === 0;

    this.showLogoMessage = isLogoMissing;
    this.showLicenceMessage = isLicenceMissing;
    this.showCommercialMessage = isCommercialMissing;

    if (isFormInvalid || isLogoMissing || isLicenceMissing || isCommercialMissing) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitFormUpdatedData();
  }

  removeCommercialImageFromDB(id) {
    this.vendorService.deleteLisenceDocument(id).subscribe({
      next: (res) => {
        this.ToastrService.success('Successfully Deleted');
      },
      error: (err) => {}
    });
  }

  private submitFormData(): void {
    const formData = new FormData();
    // Append each form field to the FormData object
    Object.keys(this.form.controls).forEach((key) => {
      const value = this.form.get(key)?.value;
      formData.append(key, value !== null ? value.toString() : '');
    });

    if (this.logoFile) {
      formData.append('ImageLogo', this.logoFile, this.logoFile.name);
    }
    // append LicenceDocuments
    this.licenceFiles.forEach((file, index) => {
      formData.append('LicenceDocuments', file, file.name);
    });

    // append CommercialDocuments
    this.commercialFiles.forEach((file, index) => {
      formData.append('CommercialDocuments', file, file.name);
    });

    this.vendorService.addVendor(formData).subscribe(
      (response) => {
        if (response.success) {
          this.ToastrService.success('Vendor added successfully');

          this.onCancel();
        }
      },
      (error) => {
        this.ToastrService.error(`Error: ${error.error.message}`);
      }
    );
  }
  private submitFormUpdatedData(): void {
    const formData = new FormData();

    // Append each form field
    Object.keys(this.form.controls).forEach((key) => {
      const value = this.form.get(key)?.value;
      formData.append(key, value !== null ? value.toString() : '');
    });

    // --- Logo ---
    if (this.logoFile) {
      formData.append('ImageLogo', this.logoFile, this.logoFile.name);
    } else if (this.oldImage) {
      formData.append('ImageLogo', this.oldImage);
    }

    // --- LicenceDocuments ---
    this.oldlicenceFiles.forEach((file) => {
      formData.append('OldLicenceDocuments', file); // أو append as string حسب الباك
    });
    this.licenceFiles.forEach((file) => {
      formData.append('LicenceDocuments', file, file.name);
    });

    // --- CommercialDocuments ---
    this.oldcommercialFiles.forEach((file) => {
      formData.append('OldCommercialDocuments', file);
    });
    this.commercialFiles.forEach((file) => {
      formData.append('CommercialDocuments', file, file.name);
    });

    this.vendorService.updateVendor(formData).subscribe(
      (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Update',
            detail: 'Successfully Updated'
          });
          this.onCancel();
        }
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `${error.error.message}`
        });
      }
    );
  }

  onLogoFileSelect(event: any): void {
    this.logoFile = event[0];
    this.showLogoMessage = false;
  }

  bindFormDate(vendorData): void {
    this.form.patchValue({
      Id: vendorData?.id,
      Name: vendorData?.name,
      Description: vendorData?.description,
      Email: vendorData?.email,
      Address: vendorData?.address,
      Phone: vendorData?.phone,
      IsHotelCommission: vendorData?.isHotelCommission,
      HotelCommissionRate: vendorData?.hotelCommissionRate,
      IsTravelCommission: vendorData?.isTravelCommission,
      TravelCommissionRate: vendorData?.travelCommissionRate ,
      SalesId: vendorData?.salesId ,
      // ✅ New commissions
      IsHajjCommission: vendorData?.isHajjCommission,
      HajjCommissionRate: vendorData?.hajjCommissionRate,
      IsOutCommission: vendorData?.isOutCommission,
      OutCommissionRate: vendorData?.outCommissionRate
    });
  }
  onCancel() {
    this.form.reset();
    this.location.back();
  }

  onLicenceFilesSelect(files: File[]): void {
    this.licenceFiles = files;
  }

  onCommercialFilesSelect(files: File[]): void {
    this.commercialFiles = files;
  }
}
