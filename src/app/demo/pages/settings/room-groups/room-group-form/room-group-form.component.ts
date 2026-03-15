import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { IbedTybies } from 'src/app/shared/model/ibed-tybies';
import { Ihotel } from 'src/app/shared/model/ihotel';
import { IroomFeaturies } from 'src/app/shared/model/iroom-featuries';
import { IroomTypies } from 'src/app/shared/model/iroom-typies';
import { BedTybeService } from 'src/app/shared/services/bed-tybe.service';
import { HotelService } from 'src/app/shared/services/hotel.service';
import { RoomFeaturiesService } from 'src/app/shared/services/room-featuries.service';
import { RoomTybeService } from 'src/app/shared/services/room-tybe.service';
import { RoomService } from 'src/app/shared/services/room.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { RoomGroupsService } from 'src/app/shared/services/room-groups.service';
import { EnumsService } from 'src/app/shared/services/enums.service';

@Component({
  selector: 'app-room-group-form',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent, SubHeaderComponent],
  templateUrl: './room-group-form.component.html',
  styleUrl: './room-group-form.component.scss'
})
export class RoomGroupFormComponent {
  roomForm: FormGroup;
  submitted = false;
  roomTybies: IroomTypies[] = [];
  hotels: Ihotel[] = [];
  bedTybies: IbedTybies[] = [];
  roomFeaturies: IroomFeaturies[] = [];
  isEditing = false;
  roomId: number | null = null;
  displayFilesForUploader: any[] = [];
  vendorId = this.ConfigureService.UserId();
  boardingTypes: any[] = [];
  first = 0;
  rows = 10;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _MessageService: MessageService,
    private _HotelService: HotelService,
    private translate: TranslateService,
    private _RoomTybeService: RoomTybeService,
    private _RoomGroupsService: RoomGroupsService,
    private _BedTybeService: BedTybeService,
    private _RoomFeaturiesService: RoomFeaturiesService,
    private ToastrService: ToastrService,
    private ConfigureService: ConfigureService,
    private enums: EnumsService
  ) {}
  getBoardingTypes() {
    this.enums.getBoardingTypes().subscribe({
      next: (res: any) => {
        this.boardingTypes = res;
      },
      error: (err) => {
        console.error('Error fetching boarding types:', err);
      }
    });
  }
  ngOnInit(): void {
    console.log(this.vendorId);
    this.getBoardingTypes();
    const idParam = this.route.snapshot.paramMap.get('id');
    this.roomId = idParam ? Number(idParam) : null;

    if (this.roomId) {
      this.isEditing = true;
      this.roomForm = this.buildEditForm(); // Build form after setting isEditing

      this.loadGroupData(this.roomId);
    } else {
      this.gettingAllHotels(this.first, this.rows);
      this.getingAllBedTybies(this.first, this.rows);
      this.gettingAllRoomTybes(this.first, this.rows);
      this.getingAllRoomFeaturies(this.first, this.rows);
      this.isEditing = false;
      this.roomForm = this.buildEmptyForm(); // Build form after setting isEditing
    }
  }

  buildEditForm(): FormGroup {
    const form = this.fb.group({
      Id: [this.roomId],
      GroupName: ['', Validators.required]
    });
    return form;
  }

  buildEmptyForm(): FormGroup {
    const form = this.fb.group({
      Id: [this.vendorId],
      GroupName: ['', this.isEditing ? null : Validators.required],
      RoomsCount: [0, this.isEditing ? null : [Validators.required, Validators.min(1)]],
      Status: [true, Validators.required],
      Description: ['', Validators.required],
      Size: [0, [Validators.required, Validators.min(1)]],
      BedCount: [0, [Validators.required, Validators.min(1)]],
      Price: [0, [Validators.required, Validators.min(1)]],
      ChildPrice: [0, Validators.required],

      HolidayPrice: [0],
      Name: ['', Validators.required],
      CancellationPolicy: ['', Validators.required],
      IsRefundable: [false],
      MinimumDaysToRefund: [0],
      IsAllowPaymentUponArrival: [false],
      depositRate: [100],
      AvailableFrom: ['', Validators.required],
      AvailableTo: ['', Validators.required],
      Boarding: ['', Validators.required],
      HotelId: [0, [Validators.required, Validators.min(1)]],
      RoomTypeId: [0, [Validators.required, Validators.min(1)]],
      BedTypeId: [0, [Validators.required, Validators.min(1)]],
      IsIncludeVate: [false, Validators.required],

      Features: [[], Validators.required],
      CustomPrices: this.fb.array([this.createCustomPriceGroup()])
    });

    this.setupConditionalValidation(form);
    return form;
  }

  otherImages: File[] = [];
  onOtherImagesUpload(files: File[]): void {
    this.otherImages = files || [];
  }

  setupConditionalValidation(form: FormGroup): void {
    // Refundable validation
    form.get('IsRefundable')?.valueChanges.subscribe((isRefundable) => {
      const minimumDaysControl = form.get('MinimumDaysToRefund');
      if (isRefundable) {
        minimumDaysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        minimumDaysControl?.clearValidators();
        minimumDaysControl?.setValue(0);
      }
      minimumDaysControl?.updateValueAndValidity();
    });

    // Payment on arrival validation
    form.get('IsAllowPaymentUponArrival')?.valueChanges.subscribe((isAllowed) => {
      const depositRateControl = form.get('depositRate');
      if (isAllowed) {
        depositRateControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        depositRateControl?.clearValidators();
        depositRateControl?.setValue('');
      }
      depositRateControl?.updateValueAndValidity();
    });
  }

  createCustomPriceGroup(): FormGroup {
    return this.fb.group({
      from: [null],
      to: [null],
      price: [null]
    });
  }

  get customPrices(): FormArray {
    return this.roomForm.get('CustomPrices') as FormArray;
  }

  addCustomPrice(): void {
    this.customPrices.push(this.createCustomPriceGroup());
  }

  removeCustomPrice(index: number): void {
    this.customPrices.removeAt(index);
  }

  // fillFormData(data: any): void {
  //   // Map JSON data to form controls
  //   this.roomForm.patchValue({
  //     Id: data.id || 0,
  //     Name: data.name || '',
  //     Description: data.description || '',
  //     Size: data.size || 0,
  //     BedCount: data.bedCount || 0,
  //     Price: data.price || 0,
  //     HolidayPrice: data.holidayPrice || 0, // Default to 0 if not provided
  //     CancellationPolicy: data.cancellationPolicy || '',
  //     IsRefundable: data.isRefundable || false,
  //     MinimumDaysToRefund: data.minimumDaysToRefund || null,
  //     IsAllowPaymentUponArrival: data.isAllowPaymentUponArrival || false,
  //     depositRate: data.depositRate || 0,
  //     Boarding: data.boarding || '',
  //     AvailableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
  //     AvailableTo: data.availableTo ? new Date(data.availableTo) : null,
  //     HotelId: data.hotelId || 0,
  //     RoomTypeId: data.roomTypeId || 0,
  //     BedTypeId: data.bedTypeId || 0,
  //     CountRoomCreated: data.countRoomCreated || 1, // Default to 1 if not provided
  // Features: data.features ? data.features.map(f => f.id) : []
  //   });

  //   // Handle CustomPrices
  //   if (data.customPrices && data.customPrices.length > 0) {
  //     this.customPrices.clear();
  //     data.customPrices.forEach((price: any) => {
  //       const priceGroup = this.createCustomPriceGroup();
  //       priceGroup.patchValue({
  //         from: price.from ? new Date(price.from) : null,
  //         to: price.to ? new Date(price.to) : null,
  //         price: price.price || 0
  //       });
  //       this.customPrices.push(priceGroup);
  //     });
  //   } else {
  //     // Ensure at least one empty custom price group exists
  //     this.customPrices.clear();
  //     this.customPrices.push(this.createCustomPriceGroup());
  //   }

  //   // Trigger conditional validators
  //   this.roomForm.get('IsRefundable')?.updateValueAndValidity({ emitEvent: true });
  //   this.roomForm.get('IsAllowPaymentUponArrival')?.updateValueAndValidity({ emitEvent: true });
  // }

  loadGroupData(id: number): void {
    this._RoomGroupsService.getRoomTypeById(id).subscribe({
      next: (res) => {
        const roomData = res?.data;
        if (roomData) {
          this.roomForm.patchValue({
            GroupName: roomData.groupName
          });
          // Prepare images for the uploader component
          this.displayFilesForUploader = roomData.groupImages;
          // .map((image) => ({
          //   imagePath: image.url,
          //   imageId: image.id // or any identifier if you have one
          // }));
        }
      },
      error: (error) => {
        this._MessageService.add({
          severity: 'error',
          summary: this.translate.instant('Error'),
          detail: this.translate.instant('Failed to load room data: ' + (error.message || 'Unknown error'))
        });
        this.router.navigate(['/room-groups']);
      }
    });
  }

  getingAllBedTybies(pageIndex: number, pageSize: number, search?: string): void {
    this._BedTybeService.getAllBedTybies({ pageIndex, pageSize, search }).subscribe({
      next: (res: any) => {
        this.bedTybies = res.data.data;
      },
      error: (err) => {
        console.error('Get bed types error:', err);
      }
    });
  }

  gettingAllHotels(pageIndex: number, pageSize: number, search?: string): void {
    this._HotelService.getAllHotels({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.hotels = res.data.data;
      },
      error: (err) => {
        console.error('Error fetching hotels:', err);
        this.hotels = [];
      }
    });
  }

  gettingAllRoomTybes(pageIndex: number, pageSize: number, search?: string): void {
    this._RoomTybeService.getAllRoomTybes({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.roomTybies = res.data.data;
      },
      error: (err) => {
        console.error('Error fetching room types:', err);
      }
    });
  }

  getingAllRoomFeaturies(pageIndex: number, pageSize: number, search?: string): void {
    this._RoomFeaturiesService.getAllRoomFeaturies({ pageIndex, pageSize, search }).subscribe({
      next: (res: any) => {
        this.roomFeaturies = res.data.data;
      },
      error: (err) => {
        console.error('Get room features error:', err);
      }
    });
  }

  onRoomTybeFilter(event: any): void {
    const query = event.filter;
    this.gettingAllRoomTybes(this.first, this.rows, query);
  }

  onbedFilter(event: any): void {
    const query = event.filter;
    this.getingAllBedTybies(this.first, this.rows, query);
  }

  onHotelFilter(event: any): void {
    const query = event.filter;
    this.gettingAllHotels(this.first, this.rows, query);
  }

  onRoomFeaturiesFilter(event: any): void {
    const query = event.filter;
    this.getingAllRoomFeaturies(this.first, this.rows, query);
  }

  shouldShowError(controlPath: string, index?: number, controlName?: string): boolean {
    let control: AbstractControl | null;

    if (index !== undefined && controlName) {
      control = (this.roomForm.get(controlPath) as FormArray)?.at(index)?.get(controlName);
    } else {
      control = this.roomForm.get(controlPath);
    }

    if (!control) return false;

    // Special handling for conditional fields
    if (controlPath === 'MinimumDaysToRefund') {
      const isRefundable = this.roomForm.get('IsRefundable')?.value;
      return isRefundable && control.invalid && (control.dirty || control.touched || this.submitted);
    }

    if (controlPath === 'depositRate') {
      const isAllowed = this.roomForm.get('IsAllowPaymentUponArrival')?.value;
      return isAllowed && control.invalid && (control.dirty || control.touched || this.submitted);
    }

    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    this.roomForm.markAllAsTouched();

    // if (this.roomForm.invalid) {
    //   console.log('Form is invalid:', this.roomForm.errors);
    //   return;
    // }
    // Add this debug code
    Object.keys(this.roomForm.controls).forEach((key) => {
      const control = this.roomForm.get(key);
      if (control?.invalid) {
        console.log('Invalid control:', key, control.errors);
      }
    });

    if (this.isEditing) {
      this.updateRoom();
    } else {
      this.createGroupOfRooms();
    }
  }

  // Helper function to convert Date to ISO string or handle null/invalid dates
  private toISOString(date: any): string | null {
    if (!date) return null;
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
  }

  createGroupOfRooms(): void {
    debugger;
    this.submitted = true;

    // 1. Create FormData
    const formData = new FormData();
    const formValue = this.roomForm.value;

    // 2. Add text fields and convert dates to ISO
    Object.keys(formValue).forEach((key) => {
      if (key !== 'CustomPrices' && key !== 'Features' && formValue[key] !== null && formValue[key] !== undefined) {
        if (key === 'AvailableFrom' || key === 'AvailableTo') {
          const isoDate = this.toISOString(formValue[key]);
          if (isoDate) {
            formData.append(key, isoDate);
          }
        } else {
          formData.append(key, formValue[key]);
        }
      } else if (key === 'Features' && Array.isArray(formValue.Features)) {
        formValue.Features.forEach((feature: any, index: number) => {
          formData.append(`Features`, feature);
        });
      } else if (key === 'CustomPrices' && Array.isArray(formValue.CustomPrices)) {
        formValue.CustomPrices.forEach((PRICEPLAN: any) => {
          const fromIso = this.toISOString(PRICEPLAN.from);
          const toIso = this.toISOString(PRICEPLAN.to);

          if (fromIso && toIso) {
            const pricePlanData: any = {
              from: fromIso,
              to: toIso,
              price: PRICEPLAN.price
            };

            formData.append('CustomPrices', JSON.stringify(pricePlanData));
          }
        });
      }
    });
    //   if (key !== 'CustomPrices' && formValue[key] !== null && formValue[key] !== undefined && key !== 'Features') {
    //     if (key === 'AvailableFrom' || key === 'AvailableTo') {
    //       const isoDate = this.toISOString(formValue[key]);
    //       if (isoDate) {
    //         formData.append(key, isoDate);
    //       }
    //     } else {
    //       formData.append(key, formValue[key]);

    //     }
    //   } else {
    //     formValue.CustomPrices.forEach((PRICEPLAN: any, index: number) => {
    //       const fromIso = this.toISOString(PRICEPLAN.from);
    //       const toIso = this.toISOString(PRICEPLAN.to);
    //       if (fromIso && toIso) {
    //         const pricePlanData = {
    //           from: fromIso,
    //           to: toIso,
    //           price: PRICEPLAN.price
    //         };
    //         formData.append(`CustomPrices[${index}]`, JSON.stringify(pricePlanData));
    //       }
    //     });
    //   }
    // });

    // 4. Add images as binary
    this.otherImages.forEach((file, index) => {
      // formData.append(`ImagesFiles[${index}]`,file,file.name);

      formData.append('ImagesFiles', file, file.name);
    });

    // 5. Send the data
    this._RoomGroupsService.setGroupOfRooms(formData).subscribe({
      next: (response) => {
        this.router.navigate(['/room-groups']);
        this.ToastrService.success(`${response.message} Created successfully`);
      },
      error: (error) => {
        console.error('Error:', error);
        this.ToastrService.error('Error creating room');
      }
    });
  }

  updateRoom() {
    const model = this.roomForm.value;
    const formData = new FormData();

    // إضافة باقي حقول الفورم
    Object.keys(model).forEach((key) => {
      if (key !== 'groupImages' && model[key] !== null && model[key] !== undefined) {
        formData.append(key, model[key]);
      }
    });

    // إرسال الصور
    this.otherImages.forEach((file, index) => {
      // formData.append(`ImagesFiles[${index}]`,file,file.name);

      formData.append('UploadedImages', file, file.name);
    });

    this._RoomGroupsService.updateRoomGroup(formData).subscribe({
      next: () => {
        this.ToastrService.success(this.translate.instant('Room updated successfully'));
        this.router.navigate(['/room-groups']);
      },
      error: (error) => {
        console.error('Error updating room:', error);
        this.ToastrService.error(
          this.translate.instant('Error updating room: ') + (error.error?.message || error.message || 'Unknown error')
        );
      }
    });
  }

  onCancel(): void {
    if (this.roomForm.dirty) {
      if (confirm(this.translate.instant('Are you sure you want to discard changes?'))) {
        this.router.navigate(['/room-groups']);
      }
    } else {
      this.router.navigate(['/room-groups']);
    }
  }
}
