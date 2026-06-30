import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';
import { OutingCategoryServiseService } from 'src/app/shared/services/outing-category-servise.service';
import { OutingFeaturesService } from 'src/app/shared/services/outing-features.service';
import { IOutingFeature } from 'src/app/shared/model/iouting-feature';
import { OutingService } from 'src/app/shared/services/outing.service';
import { OutingBranshesService } from 'src/app/shared/services/outing-branshes.service';
import { OutingSchedule } from 'src/app/shared/model/outing-schedule';
import { MessageService } from 'primeng/api';
import { catchError, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-outing-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, ImgUploaderComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './outing-form.component.html',
  styleUrl: './outing-form.component.scss'
})
export class OutingFormComponent implements OnInit {
  outingForm: FormGroup;
  addOnsForm: FormGroup;
  offersForm: FormGroup;
  ticketsForm: FormGroup;
  schedulesForm: FormGroup;
  @ViewChild('excelUploader') excelUploader: FileUpload | undefined;

  activeStep = 0;
  outingId: number | null = null;
  isEditMode: boolean = false;
  selectedImages: File[] = [];
  existingImages: { id: number; url: string }[] = [];
  showImageError = false;
  imgPaseUrl = environment.imgUrl;
  isLoading = false;
  isLoadingData = false;

  originalFeatureIds: number[] = [];
  originalImageIds: number[] = [];
  deletedImageIds: number[] = [];
  deletedFeatureIds: number[] = [];

  // Lists for steps 2, 3, 4
  addOnsList: any[] = [];
  offer: any = null;
  ticketsList: any[] = [];
  schedulesList: OutingSchedule[] = [];

  get availableDays() {
    // Filter used days. Ensure type safety by converting to number for comparison or using loose check.
    const usedDays = this.schedulesList.reduce((acc: number[], s) => acc.concat(s.dayOfWeek || []), []).map(Number);
    return this.daysOfWeek.filter((day) => !usedDays.includes(Number(day.value)));
  }

  daysOfWeek = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 }
  ];

  SchedualType = {
    Spacific: 1,
    Interval: 2
  };
  OutingType = {
    Normal: 1,
    Scheduled: 2
  };

  outingTypeOptions = [
    { label: 'Normal', value: 1 },
    { label: 'Scheduled', value: 2 }
  ];

  // Excel upload for tickets
  uploadedExcelFile: File | null = null;
  excelSerialNumbers: any[] = [];
  isUploadingExcel = false;
  // Track if availableQuantity is disabled due to excel upload
  isAvailableQuantityDisabled = false;
  expandedRows: any = {};
  reloadStepper = true;

  // Track which ticket is being edited (-1 means not editing, adding new)
  editingTicketIndex: number = -1;

  // Temporary storage for time slots while building a schedule
  tempTimeSlots: { id?: number; startTime: string; endTime: string }[] = [];

  // Dropdown data
  categories: any[] = [];
  features: IOutingFeature[] = [];
  branches: any[] = []; // List of branches
  newBranchName: string = ''; // For adding new branch
  newBranchLocation: string = ''; // For adding new branch location
  starRatings = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private outingCategoryService: OutingCategoryServiseService,
    private outingFeaturesService: OutingFeaturesService,
    private outingService: OutingService,
    private outingBranshesService: OutingBranshesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadCategories();
    this.loadFeatures();
    this.loadBranches(); // Load branches on init

    // Check if editing existing outing
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.outingId = +params['id'];
        this.isEditMode = true;
        this.loadOutingData(this.outingId);
      }
    });
  }

  // In your component
  // This method handles deleted images
  onImageDeleted(imageId: number): void {
    console.log('Image deleted with ID:', imageId);

    if (imageId && !this.deletedImageIds.includes(imageId)) {
      this.deletedImageIds.push(imageId);
    }

    // Remove from existing images display
    this.existingImages = this.existingImages.filter((img) => img.id !== imageId);

    // Update validation
    this.showImageError = this.selectedImages.length === 0 && this.existingImages.length === 0;
  }
  /**
   * Setup conditional validators for policy fields
   */
  setupPolicyValidators() {
    // Watch IsRefundable changes
    this.outingForm.get('IsRefundable')?.valueChanges.subscribe((isRefundable) => {
      const minimumDaysControl = this.outingForm.get('MinimumDaysToRefund');

      if (isRefundable) {
        minimumDaysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        minimumDaysControl?.clearValidators();
        minimumDaysControl?.setValue(null);
      }
      minimumDaysControl?.updateValueAndValidity();
    });
  }

  /**
   * Setup conditional validators for StartDate and EndDate based on OutingType
   * Type 1 (Normal): StartDate and EndDate are required
   * Type 2 (Scheduled): StartDate and EndDate are not required
   */
  setupOutingTypeValidators() {
    this.outingForm.get('OutingType')?.valueChanges.subscribe((outingType) => {
      const startDateControl = this.outingForm.get('StartDate');
      const endDateControl = this.outingForm.get('EndDate');

      if (outingType === this.OutingType.Normal) {
        // Type 1: Normal - dates are required
        startDateControl?.setValidators([Validators.required]);
        endDateControl?.setValidators([Validators.required]);
      } else {
        // Type 2: Scheduled - dates are not required
        startDateControl?.clearValidators();
        endDateControl?.clearValidators();
        startDateControl?.setValue(null);
        endDateControl?.setValue(null);
      }
      startDateControl?.updateValueAndValidity();
      endDateControl?.updateValueAndValidity();

      // Force stepper reload to update step visibility
      this.reloadStepper = false;
      setTimeout(() => {
        this.reloadStepper = true;
      }, 0);
    });
  }

  initializeForms() {
    // Step 1: Main outing form
    this.outingForm = this.fb.group({
      OutingType: [1, Validators.required], // Default to Normal (1)
      Name: ['', [Validators.required, Validators.minLength(3)]],
      Description: ['', [Validators.required, Validators.minLength(5)]],
      Location: ['', [Validators.required]],
      ExternalLink: [''], // Added ExternalLink field
      StartDate: [null, Validators.required], // Required by default for Normal type
      EndDate: [null, Validators.required], // Required by default for Normal type
      TargetAudience: [''],
      IsActive: [true, Validators.required],
      IsBlocked: [false, Validators.required],
      OutingCategoryId: [null, Validators.required],
      FeatureIds: [[], [Validators.required, Validators.minLength(1)]],
      BranchIds: [[]], // Added BranchIds control
      Rating: [1, [Validators.required, Validators.min(0), Validators.max(5)]],
      PriceBefore: [null], // Added PriceBefore field
      // Policy fields
      IsRefundable: [false],
      MinimumDaysToRefund: [1],
      depositRate: [null],
      CancellationPolicy: ['', Validators.required],
      SavingsRatio: [null, [Validators.min(0), Validators.max(100)]]
    });

    // Add conditional validators for policy fields
    this.setupPolicyValidators();

    // Setup OutingType validators
    this.setupOutingTypeValidators();

    // Step 2: Add-ons form
    this.addOnsForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });

    // Step 3: Offers form
    this.offersForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });

    // Step 4: Tickets form
    this.ticketsForm = this.fb.group({
      ticketType: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      availableQuantity: [1, [Validators.required, Validators.min(1)]],
      isActive: [true, Validators.required],
      hasSerialNumber: [false, Validators.required]
    });

    // Step 5: Schedules form
    this.schedulesForm = this.fb.group({
      dayOfWeek: [[], Validators.required],
      schedualType: [this.SchedualType.Interval, Validators.required],
      // startTime and endTime are now managed via tempTimeSlots
      startTime: [null],
      endTime: [null],
      validFrom: [null, Validators.required],
      validTo: [null, Validators.required]
    });

    // When hasSerialNumber toggles, enable/disable availableQuantity accordingly
    this.ticketsForm.get('hasSerialNumber')?.valueChanges.subscribe((hasSerial) => {
      const availableCtrl = this.ticketsForm.get('availableQuantity');
      if (!hasSerial) {
        // If user disables serial numbers, clear any excel data and enable quantity input
        this.clearExcelUpload();
        availableCtrl?.enable({ emitEvent: false });
        this.isAvailableQuantityDisabled = false;
      } else {
        // If they enable serial numbers and there are excel serials, apply them
        if (this.excelSerialNumbers && this.excelSerialNumbers.length > 0) {
          this.applyExcelSerialsToForm();
        }
      }
    });
  }

  /**
   * Load existing outing data for edit mode
   */
  loadOutingData(id: number) {
    this.isLoadingData = true;

    forkJoin({
      outing: this.outingService.getOutingById(id).pipe(
        catchError((error) => {
          console.error('Error loading outing data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load outing data'
          });
          return of(null);
        })
      ),
      schedules: this.outingService.getOutingSchedulesByOutingId(id).pipe(
        catchError((error) => {
          console.error('Error loading schedules:', error);
          return of(null);
        })
      )
    })
      .pipe(
        finalize(() => {
          this.isLoadingData = false;
        })
      )
      .subscribe((results: any) => {
        if (results.outing?.success && results.outing?.data) {
          this.populateFormsWithData(results.outing.data);
        }

        if (results.schedules?.success && results.schedules?.data) {
          const schedulesData = results.schedules.data.data || [];
          if (schedulesData.length > 0) {
            this.schedulesList = schedulesData.map((schedule: any) => ({
              id: schedule.id,
              dayOfWeek: Array.isArray(schedule.dayOfWeek) ? schedule.dayOfWeek : [schedule.dayOfWeek],
              schedualType: schedule.schedualType,
              times: (schedule.timeSlots || []).map((t: any) => ({
                id: t.id,
                startTime: t.startTime,
                endTime: t.endTime
              })),
              validFrom: schedule.validFrom,
              validTo: schedule.validTo,
              outingId: schedule.outingId
            }));
          }
        }
      });
  }

  /**
   * Populate all forms with existing data
   */
  populateFormsWithData(data: any) {
    // Determine OutingType based on data - if data has outingType use it, otherwise default to Normal (1)
    const outingType = data.outingType || this.OutingType.Normal;

    // Step 1: Main outing information
    this.outingForm.patchValue({
      OutingType: outingType,
      Name: data.name,
      Description: data.description,
      Location: data.location,
      ExternalLink: data.externalLink || '', // Added ExternalLink field
      StartDate: data.startDate ? new Date(data.startDate) : null,
      EndDate: data.endDate ? new Date(data.endDate) : null,
      TargetAudience: data.targetAudience || '',
      IsActive: data.isActive,
      IsBlocked: data.isBlocked,
      OutingCategoryId: data.outingCategoryId,
      FeatureIds: data.features?.map((f: any) => f.id) || [],
      Rating: data.rating || 1,
      PriceBefore: data.priceBefore || null, // Added PriceBefore field
      // Policy fields
      IsRefundable: data.isRefundable || false,
      MinimumDaysToRefund: data.minimumDaysToRefund || null,
      depositRate: data.depositRate || null,
      CancellationPolicy: data.cancellationPolicy || '',
      SavingsRatio: data.savingsRatio || null,
      BranchIds: (data.branshes || data.branches || []).map((b: any) => b.id) // Populate existing branches
    });

    // Store original feature IDs for comparison
    this.originalFeatureIds = data.features?.map((f: any) => f.id) || [];

    // Populate existing images and store original IDs
    if (data.images && data.images.length > 0) {
      this.existingImages = data.images.map((img: any) => ({
        id: img.id,
        url: img.url
      }));
      this.originalImageIds = data.images.map((img: any) => img.id);
    }

    // Step 2: Add-ons
    if (data.addOns && data.addOns.length > 0) {
      this.addOnsList = data.addOns.map((addon: any) => ({
        id: addon.id, // Store ID for update
        name: addon.name,
        price: addon.price,
        description: addon.description || ''
      }));
    }

    // Step 3: Offers (single offer)
    if (data.offers && data.offers.length > 0) {
      const firstOffer = data.offers[0];
      this.offer = {
        id: firstOffer.id, // Store ID for update
        title: firstOffer.title,
        description: firstOffer.description
      };
    }

    // Step 4: Tickets
    if (data.tickets && data.tickets.length > 0) {
      this.ticketsList = data.tickets.map((ticket: any) => ({
        id: ticket.id, // Store ID for update
        ticketType: ticket.ticketType,
        description: ticket.description,
        price: ticket.price,
        // If the ticket has serial numbers, calculate availableQuantity from the serial array length
        availableQuantity:
          ticket.hasSerialNumber && ticket.outingTicketSerialNumbers && ticket.outingTicketSerialNumbers.length > 0
            ? ticket.outingTicketSerialNumbers.length
            : ticket.availableQuantity,
        isActive: ticket.isActive,
        hasSerialNumber: ticket.hasSerialNumber,
        excelData: ticket.outingTicketSerialNumbers || []
      }));
    }

    // Step 5: Schedules
    if (data.schedules && data.schedules.length > 0) {
      this.schedulesList = data.schedules.map((schedule: any) => ({
        id: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
        schedualType: schedule.schedualType,
        validFrom: schedule.validFrom,
        validTo: schedule.validTo,
        times: (schedule.times || []).map((t: any) => ({
          id: t.id,
          startTime: t.startTime,
          endTime: t.endTime
        }))
      }));
    }
  }

  loadCategories(pageIndex: number = 1, pageSize: number = 100, search: string = '') {
    this.outingCategoryService.getAlloutingCategoty({ pageIndex, pageSize, search }).subscribe({
      next: (res: any) => {
        const items = res?.data?.data || [];
        this.categories = items.map((c: any) => ({
          label: c.name || c.Name || c.Title || c.title,
          value: c.id || c.Id
        }));
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadFeatures() {
    this.outingFeaturesService.getAllOutingFeatures({ pageIndex: 1, pageSize: 1000, Search: '' }).subscribe({
      next: (res: any) => {
        const items = res?.data?.data || [];
        this.features = items;
      },
      error: (err) => {
        console.error('Error loading features:', err);
      }
    });
  }

  onFeaturesFilter(event: any) {
    this.loadFeatures();
  }

  /**
   * Load available branches from service
   */
  loadBranches() {
    this.outingBranshesService.getAllOutingBranches({ pageIndex: 1, pageSize: 1000 }).subscribe({
      next: (res: any) => {
        if (res?.success) {
          // Handle both direct array and paginated response (data.data)
          if (Array.isArray(res.data)) {
            this.branches = res.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            this.branches = res.data.data;
          } else {
            this.branches = [];
            console.warn('Branches response format unexpected:', res);
          }
        }
      },
      error: (err) => {
        console.error('Error loading branches:', err);
      }
    });
  }

  /**
   * Add a new branch dynamically
   */
  addNewBranch() {
    if (!this.newBranchName || this.newBranchName.trim() === '') {
      return;
    }

    const payload = {
      name: this.newBranchName,
      description: '-', // Optional or default if required
      location: this.newBranchLocation
    };

    this.outingBranshesService.addOutingBranches(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Branch added successfully'
          });

          // 1. Get the new branch ID from response
          let newBranchId = res.data;
          // If response data is an object with ID, extract it
          if (typeof res.data === 'object' && res.data?.id) {
            newBranchId = res.data.id;
          }

          // Re-load branches to get the full object properly or push safely
          this.outingBranshesService.getAllOutingBranches({ pageIndex: 1, pageSize: 1000 }).subscribe((branchesRes: any) => {
            if (branchesRes?.success) {
              let loadedBranches: any[] = [];
              if (Array.isArray(branchesRes.data)) {
                loadedBranches = branchesRes.data;
              } else if (branchesRes.data?.data && Array.isArray(branchesRes.data.data)) {
                loadedBranches = branchesRes.data.data;
              }

              this.branches = loadedBranches;

              // 2. Select the new branch in the form
              if (newBranchId) {
                const currentBranches = this.outingForm.get('BranchIds')?.value || [];
                this.outingForm.patchValue({
                  BranchIds: [...currentBranches, newBranchId]
                });
              }
            }
          });

          this.newBranchName = ''; // Reset input
          this.newBranchLocation = ''; // Reset location input
        }
      },
      error: (err) => {
        console.error('Error adding branch:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add branch'
        });
      }
    });
  }

  // ============= STEP 1: Outing Information =============
  onNext(nextCallback?: any) {
    this.outingForm.markAllAsTouched();

    // In edit mode, images are optional if there are existing images
    if (this.isEditMode) {
      this.showImageError = this.selectedImages.length === 0 && this.existingImages.length === 0;
    } else {
      this.showImageError = this.selectedImages.length === 0;
    }

    if (this.outingForm.invalid || this.showImageError) {
      return;
    }

    if (this.isLoading) return;

    // In edit mode, call update endpoint
    if (this.isEditMode && this.outingId) {
      this.updateOutingInfo(nextCallback);
    } else {
      this.createOutingInfo(nextCallback);
    }
  }

  createOutingInfo(nextCallback?: any) {
    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.outingForm.value;

    formData.append('OutingType', formValue.OutingType?.toString() || '1');
    formData.append('Name', formValue.Name);
    formData.append('Description', formValue.Description);
    formData.append('Location', formValue.Location);
    if (formValue.ExternalLink) {
      formData.append('ExternalLink', formValue.ExternalLink);
    }
    formData.append('StartDate', formValue.StartDate?.toISOString() || '');
    formData.append('EndDate', formValue.EndDate?.toISOString() || '');
    formData.append('OutingCategoryId', formValue.OutingCategoryId?.toString() || '');
    formData.append('TargetAudience', formValue.TargetAudience || '');
    formData.append('Rating', formValue.Rating?.toString() || '1');
    formData.append('IsActive', formValue.IsActive?.toString() || 'true');
    formData.append('IsBlocked', formValue.IsBlocked?.toString() || 'false');
    formData.append('VendorId', '0');

    // PriceBefore field
    if (formValue.PriceBefore !== null && formValue.PriceBefore !== undefined) {
      formData.append('PriceBefore', formValue.PriceBefore.toString());
    }

    // Policy fields
    formData.append('IsRefundable', formValue.IsRefundable?.toString() || 'false');
    if (formValue.MinimumDaysToRefund) {
      formData.append('MinimumDaysToRefund', formValue.MinimumDaysToRefund.toString());
    }
    if (formValue.depositRate) {
      formData.append('depositRate', formValue.depositRate.toString());
    }
    if (formValue.CancellationPolicy) {
      formData.append('CancellationPolicy', formValue.CancellationPolicy);
    }
    if (formValue.SavingsRatio !== null && formValue.SavingsRatio !== undefined) {
      formData.append('SavingsRatio', formValue.SavingsRatio.toString());
    }

    // Only send features if selected
    if (formValue.FeatureIds && formValue.FeatureIds.length > 0) {
      formValue.FeatureIds.forEach((id: number) => {
        formData.append('features', id.toString());
      });
    }

    // Append BranchIds
    if (formValue.BranchIds && formValue.BranchIds.length > 0) {
      formValue.BranchIds.forEach((id: number) => {
        formData.append('Branshes', id.toString());
      });
    }

    if (this.selectedImages && this.selectedImages.length > 0) {
      this.selectedImages.forEach((file: File) => {
        formData.append('UploadedImages', file, file.name);
      });
    }

    this.outingService
      .addOutingOnly(formData)
      .pipe(
        catchError((error) => {
          console.error('Error creating outing:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create outing'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response?.id) {
          this.outingId = response.data;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Outing created successfully!'
          });

          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          }
        }
      });
  }

  updateOutingInfo(nextCallback?: any) {
    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.outingForm.value;

    // Add the outing ID for update
    formData.append('Id', this.outingId!.toString());
    formData.append('OutingType', formValue.OutingType?.toString() || '1');
    formData.append('Name', formValue.Name);
    formData.append('Description', formValue.Description);
    formData.append('Location', formValue.Location);
    if (formValue.ExternalLink) {
      formData.append('ExternalLink', formValue.ExternalLink);
    }
    formData.append('StartDate', formValue.StartDate?.toISOString() || '');
    formData.append('EndDate', formValue.EndDate?.toISOString() || '');
    formData.append('OutingCategoryId', formValue.OutingCategoryId?.toString() || '');
    formData.append('TargetAudience', formValue.TargetAudience || '');
    formData.append('Rating', formValue.Rating?.toString() || '1');
    formData.append('IsActive', formValue.IsActive?.toString() || 'true');
    formData.append('IsBlocked', formValue.IsBlocked?.toString() || 'false');

    // PriceBefore field
    if (formValue.PriceBefore !== null && formValue.PriceBefore !== undefined) {
      formData.append('PriceBefore', formValue.PriceBefore.toString());
    }

    // Policy fields
    formData.append('IsRefundable', formValue.IsRefundable?.toString() || 'false');
    if (formValue.MinimumDaysToRefund) {
      formData.append('MinimumDaysToRefund', formValue.MinimumDaysToRefund.toString());
    }
    if (formValue.depositRate) {
      formData.append('depositRate', formValue.depositRate.toString());
    }
    if (formValue.CancellationPolicy) {
      formData.append('CancellationPolicy', formValue.CancellationPolicy);
    }

    if (formValue.SavingsRatio !== null && formValue.SavingsRatio !== undefined) {
      formData.append('SavingsRatio', formValue.SavingsRatio.toString());
    }

    // Calculate deleted feature IDs
    // Ensure unique IDs to prevent duplication
    const rawFeatureIds = formValue.FeatureIds || [];
    const currentFeatureIds = [...new Set(rawFeatureIds)] as number[];

    this.deletedFeatureIds = this.originalFeatureIds.filter((id) => !currentFeatureIds.includes(id));

    // ✅ Append current feature IDs as separate entries (Features) - only if selected
    if (currentFeatureIds.length > 0) {
      currentFeatureIds.forEach((id: number) => {
        formData.append('Features', id.toString());
      });
    }

    // Append BranchIds for update
    const currentBranchIds = formValue.BranchIds || [];
    if (currentBranchIds.length > 0) {
      currentBranchIds.forEach((id: number) => {
        formData.append('Branshes', id.toString()); // Using 'branches' as per consistency
      });
    }

    // ✅ Append deleted feature IDs as separate entries (DeletedFeatureIds)
    if (this.deletedFeatureIds.length > 0) {
      this.deletedFeatureIds.forEach((id: number) => {
        formData.append('DeletedFeatureIds', id.toString());
      });
    }

    // ✅ Append deleted image IDs as separate entries (DeletedImageIds)
    if (this.deletedImageIds.length > 0) {
      this.deletedImageIds.forEach((id: number) => {
        formData.append('DeletedImageIds', id.toString());
      });
    }

    // Only append new images if any were selected
    if (this.selectedImages && this.selectedImages.length > 0) {
      this.selectedImages.forEach((file: File) => {
        formData.append('UploadedImages', file, file.name);
      });
    }

    // Debug: Log FormData contents
    console.log('=== FormData Contents ===');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // Call update endpoint
    this.outingService
      .updateOutingOnly(formData)
      .pipe(
        catchError((error) => {
          console.error('Error updating outing:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update outing'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Outing updated successfully!'
          });

          // Reset deleted arrays after successful update
          this.deletedImageIds = [];
          this.deletedFeatureIds = [];

          // Update original values for next comparison
          this.originalFeatureIds = formValue.FeatureIds || [];
          this.originalImageIds = this.existingImages.map((img) => img.id);

          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          }
        }
      });
  }

  // ============= STEP 2: Add-Ons Management =============
  addAddOn() {
    if (this.addOnsForm.invalid) return;
    this.addOnsList.push({ ...this.addOnsForm.value });
    this.addOnsForm.reset({ name: '', price: 0, description: '' });
  }

  removeAddOn(index: number) {
    if (this.addOnsList[index].id) {
      // If the add-on has an ID, delete from backend
      this.outingService.deleteOutingAddOns(this.addOnsList[index].id).subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Add-on deleted successfully!'
            });
          }
        },
        error: (err) => {
          console.error('Error deleting add-on:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to delete add-on'
          });
        }
      });
    }

    this.addOnsList.splice(index, 1);
  }

  onNextAddOns(nextCallback?: any) {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const addOnsPayload = {
      outingId: this.outingId,
      addOns: this.addOnsList.map((addon) => ({
        id: addon.id, // Include ID when updating
        name: addon.name,
        description: addon.description || '',
        price: addon.price
      }))
    };

    // Use update endpoint in edit mode, otherwise add
    const apiCall = this.isEditMode
      ? this.outingService.updateOutingAddOns(addOnsPayload)
      : this.outingService.addOutingAddOns(addOnsPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error with add-ons:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save add-ons'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Add-ons updated successfully!' : 'Add-ons saved successfully!'
          });

          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          }
        }
      });
  }

  // ============= STEP 3: Offers Management =============
  addOffer() {
    if (this.offersForm.invalid) return;

    if (this.offer && this.offer.id) {
      // Update existing offer
      this.offer = {
        id: this.offer.id, // Preserve the ID
        title: this.offersForm.value.title,
        description: this.offersForm.value.description
      };
    } else {
      // Create new offer
      this.offer = { ...this.offersForm.value };
    }
  }

  removeOffer() {
    // clear the single offer
    this.outingService.deleteOutingOffers(this.offer.id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Offer deleted successfully!'
          });
          this.offer = null;
        }
      },
      error: (err) => {
        console.error('Error deleting offer:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to delete offer'
        });
      }
    });
  }

  onNextOffers(nextCallback?: any) {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    if (!this.offer) {
      this.isLoading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Skipped offers step.'
      });
      if (nextCallback) {
        setTimeout(() => nextCallback.emit(), 200);
      }
      return;
    }

    // Build payload based on mode (add vs update)
    const offerPayload: any = {
      title: this.offer.title,
      description: this.offer.description,
      outingId: this.outingId
    };
    // Include offer ID when updating
    if (this.isEditMode) {
      offerPayload.id = this.offer.id;
    }

    // Use update endpoint in edit mode, otherwise add
    const apiCall = this.isEditMode
      ? this.outingService.updateOutingOffers(offerPayload)
      : this.outingService.addOutingOffers(offerPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error with offer:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save offer'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Offer updated successfully!' : 'Offer saved successfully!'
          });
          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 300);
          }
        }
      });
  }

  // ============= STEP 4: Tickets Management =============
  addTicket() {
    if (this.ticketsForm.invalid) return;

    const ticketData: any = { ...this.ticketsForm.value };

    // If hasSerialNumber is true, include the excelData
    if (ticketData.hasSerialNumber) {
      if (this.excelSerialNumbers.length === 0 && this.editingTicketIndex === -1) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please upload an Excel file with serial numbers first'
        });
        return;
      }
      if (this.excelSerialNumbers.length > 0) {
        ticketData.excelData = [...this.excelSerialNumbers];
        ticketData.availableQuantity = ticketData.excelData.length;
      } else if (this.editingTicketIndex >= 0) {
        // Keep existing excelData when editing without uploading new file
        ticketData.excelData = this.ticketsList[this.editingTicketIndex].excelData || [];
      }
    }

    // If we are editing an existing ticket, update it in the list
    if (this.editingTicketIndex >= 0) {
      // Preserve the id if editing an existing ticket
      ticketData.id = this.ticketsList[this.editingTicketIndex].id;
      this.ticketsList[this.editingTicketIndex] = ticketData;
      this.editingTicketIndex = -1;
    } else {
      // Adding new ticket
      this.ticketsList.push(ticketData);
    }

    // Ensure the available quantity is enabled before resetting the form so reset works correctly
    this.ticketsForm.get('availableQuantity')?.enable({ emitEvent: false });
    this.ticketsForm.reset({ ticketType: '', description: '', price: 0, availableQuantity: 1, isActive: true, hasSerialNumber: false });
    this.isAvailableQuantityDisabled = false;

    // Reset Excel data
    this.uploadedExcelFile = null;
    this.excelSerialNumbers = [];
  }

  /**
   * Edit an existing ticket - load its data into the form
   */
  editTicket(index: number) {
    const ticket = this.ticketsList[index];
    this.editingTicketIndex = index;

    // Populate the form with ticket data
    this.ticketsForm.patchValue({
      ticketType: ticket.ticketType,
      description: ticket.description,
      price: ticket.price,
      availableQuantity: ticket.availableQuantity,
      isActive: ticket.isActive,
      hasSerialNumber: ticket.hasSerialNumber
    });

    // If ticket has serial numbers, load them for preview
    if (ticket.hasSerialNumber && ticket.excelData?.length > 0) {
      this.excelSerialNumbers = ticket.excelData.map((item: any) => ({
        ticketCode: item.ticketCode || item.serialNumber
      }));
      this.ticketsForm.get('availableQuantity')?.disable({ emitEvent: false });
      this.isAvailableQuantityDisabled = true;
    }
  }

  /**
   * Cancel editing and reset the form
   */
  cancelTicketEdit() {
    this.editingTicketIndex = -1;
    this.ticketsForm.get('availableQuantity')?.enable({ emitEvent: false });
    this.ticketsForm.reset({ ticketType: '', description: '', price: 0, availableQuantity: 1, isActive: true, hasSerialNumber: false });
    this.isAvailableQuantityDisabled = false;
    this.uploadedExcelFile = null;
    this.excelSerialNumbers = [];
  }

  /**
   * Save individual ticket update via API
   */
  saveIndividualTicket(index: number) {
    const ticket = this.ticketsList[index];

    if (!ticket.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Ticket has not been saved to the server yet. Please use the Next/Finish button to save all tickets.'
      });
      return;
    }

    this.isLoading = true;

    const ticketPayload = {
      id: ticket.id,
      ticketType: ticket.ticketType,
      description: ticket.description,
      price: ticket.price,
      availableQuantity: ticket.availableQuantity,
      isActive: ticket.isActive,
      hasSerialNumber: ticket.hasSerialNumber || false,
      excelData: (ticket.excelData || []).map((item: any) => ({
        ticketCode: item.ticketCode || item.serialNumber
      }))
    };

    this.outingService
      .updateOutingTicket(ticketPayload)
      .pipe(
        catchError((error) => {
          console.error('Error updating ticket:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to update ticket'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Ticket updated successfully!'
          });
        }
      });
  }

  removeTicket(index: number) {
    // Cancel edit if deleting the ticket being edited
    if (this.editingTicketIndex === index) {
      this.cancelTicketEdit();
    } else if (this.editingTicketIndex > index) {
      // Adjust editing index if a ticket before it is deleted
      this.editingTicketIndex--;
    }

    if (this.ticketsList[index].id) {
      this.outingService.deleteOutingTicket(this.ticketsList[index].id).subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Ticket deleted successfully!'
            });
          }
        },
        error: (err) => {
          console.error('Error deleting ticket:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to delete ticket'
          });
        }
      });
    }
    this.ticketsList.splice(index, 1);
  }

  // ============= STEP 5: Schedules Management =============
  // ============= STEP 5: Schedules Management =============

  // Helper to add a time slot to the temp list
  addTimeSlot() {
    const formValue = this.schedulesForm.value;
    const startTime = formValue.startTime instanceof Date ? formValue.startTime.toISOString() : formValue.startTime;
    const endTime = formValue.endTime instanceof Date ? formValue.endTime.toISOString() : formValue.endTime;

    if (!startTime || !endTime) return;

    this.tempTimeSlots.push({ startTime, endTime });

    // Reset time inputs but keep other fields
    this.schedulesForm.patchValue({
      startTime: null,
      endTime: null
    });
  }

  removeTimeSlot(index: number) {
    this.tempTimeSlots.splice(index, 1);
  }

  addSchedule() {
    const formValue = this.schedulesForm.value;

    // Check for duplicate day
    const selectedDays: number[] = Array.isArray(formValue.dayOfWeek) ? formValue.dayOfWeek : [formValue.dayOfWeek];
    const usedDays = this.schedulesList.reduce((acc: number[], s) => acc.concat(s.dayOfWeek || []), []).map(Number);

    if (selectedDays.some((day) => usedDays.includes(Number(day)))) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'One or more selected days are already scheduled. Please delete existing schedule to modify.'
      });
      return;
    }

    // Check if form is valid (excluding start/end time if we have slots)
    // We strictly require day, validity, type, AND at least one time slot
    if (this.schedulesForm.invalid || this.tempTimeSlots.length === 0) {
      if (this.tempTimeSlots.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please add at least one time slot' });
      }
      return;
    }

    // const formValue = this.schedulesForm.value; // Already declared above
    const schedule: OutingSchedule = {
      dayOfWeek: formValue.dayOfWeek,
      schedualType: formValue.schedualType,
      validFrom: formValue.validFrom instanceof Date ? formValue.validFrom.toISOString() : formValue.validFrom,
      validTo: formValue.validTo instanceof Date ? formValue.validTo.toISOString() : formValue.validTo,
      times: [...this.tempTimeSlots]
    };

    this.schedulesList = [...this.schedulesList, schedule];

    // Reset form and temp slots
    this.schedulesForm.reset({
      schedualType: this.SchedualType.Interval // Keep default type
    });
    this.tempTimeSlots = [];
  }

  removeSchedule(index: number) {
    if (this.schedulesList[index].id) {
      this.outingService.deleteOutingSchedules(this.schedulesList[index].id).subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Schedule deleted successfully!'
            });
            this.schedulesList = this.schedulesList.filter((_, i) => i !== index);
          }
        },
        error: (err) => {
          console.error('Error deleting schedule:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to delete schedule'
          });
        }
      });
    } else {
      this.schedulesList = this.schedulesList.filter((_, i) => i !== index);
    }
  }

  onNextSchedules(nextCallback?: any) {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.schedulesList.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add at least one schedule'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const schedulesPayload = {
      outingId: this.outingId,
      schedules: this.schedulesList.map((s) => ({
        id: s.id || 0,
        dayOfWeek: s.dayOfWeek,
        schedualType: s.schedualType,
        validFrom: s.validFrom,
        validTo: s.validTo,
        times: s.times.map((t) => ({
          id: t.id,
          startTime: t.startTime,
          endTime: t.endTime
        }))
      }))
    };

    const apiCall = this.isEditMode
      ? this.outingService.updateOutingSchedules(schedulesPayload)
      : this.outingService.addOutingSchedules(schedulesPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error saving schedules:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save schedules'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Schedules saved successfully!'
          });
          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          } else {
            setTimeout(() => {
              this.router.navigate(['/outing']);
            }, 1500);
          }
        }
      });
  }

  onNextTickets(nextCallback?: any) {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const ticketsPayload = {
      outingId: this.outingId,
      tickets: this.ticketsList.map((ticket) => ({
        id: ticket.id, // Include ID when updating
        ticketType: ticket.ticketType,
        description: ticket.description,
        price: ticket.price,
        availableQuantity: ticket.availableQuantity,
        isActive: ticket.isActive,
        hasSerialNumber: ticket.hasSerialNumber || false,
        excelData: ticket.excelData || []
      }))
    };

    // Use update endpoint in edit mode, otherwise add
    const apiCall = this.isEditMode
      ? this.outingService.updateOutingTickets(ticketsPayload)
      : this.outingService.addOutingTickets(ticketsPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error with tickets:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save tickets'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Tickets updated successfully!' : 'Tickets saved successfully!'
          });

          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          }
        }
      });
  }

  /**
   * Finish the form for Normal type outings (without schedules step)
   * Saves tickets and navigates to the outing list
   */
  onFinishNormal() {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const ticketsPayload = {
      outingId: this.outingId,
      tickets: this.ticketsList.map((ticket) => ({
        id: ticket.id,
        ticketType: ticket.ticketType,
        description: ticket.description,
        price: ticket.price,
        availableQuantity: ticket.availableQuantity,
        isActive: ticket.isActive,
        hasSerialNumber: ticket.hasSerialNumber || false,
        excelData: ticket.excelData || []
      }))
    };

    const apiCall = this.isEditMode
      ? this.outingService.updateOutingTickets(ticketsPayload)
      : this.outingService.addOutingTickets(ticketsPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error with tickets:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save tickets'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Outing updated successfully!' : 'Outing created successfully!'
          });
          // Navigate to outing list after finishing
          setTimeout(() => {
            this.router.navigate(['/outing']);
          }, 1500);
        }
      });
  }

  // ============= Helper Methods =============
  onImagesUpload(files: File[] | null): void {
    this.selectedImages = files || [];
    this.showImageError = false;
  }

  // ============= Excel Upload Methods =============
  onExcelFileSelect(event: any) {
    const file = event.files[0];
    if (!file) return;

    // Clear the uploader immediately to allow re-selecting the same file if needed
    if (this.excelUploader) {
      this.excelUploader.clear();
    }

    this.uploadedExcelFile = file;
    this.uploadExcelFile(file);
  }

  uploadExcelFile(file: File) {
    this.isUploadingExcel = true;
    const formData = new FormData();
    formData.append('excelFile', file);

    this.outingService
      .addTicketExel(formData)
      .pipe(
        catchError((error) => {
          this.isUploadingExcel = false;

          console.error('Error uploading Excel:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to upload Excel file'
          });
          return of(null);
        }),
        finalize(() => {
          this.isUploadingExcel = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success) {
          this.excelSerialNumbers = response.data;
          // Apply excel serial numbers automatically to available quantity
          this.applyExcelSerialsToForm();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Excel file uploaded successfully! ${this.excelSerialNumbers.length} serial numbers found.`
          });
        }
      });
  }

  clearExcelUpload() {
    this.uploadedExcelFile = null;
    this.excelSerialNumbers = [];
    // Re-enable available quantity after clearing excel
    this.ticketsForm.get('availableQuantity')?.enable({ emitEvent: false });
    this.ticketsForm.get('availableQuantity')?.setValue(1);
    this.isAvailableQuantityDisabled = false;
  }

  /**
   * When an excel file is uploaded, set the availableQuantity to the number of serial numbers
   * and disable the control to prevent user edits.
   */
  applyExcelSerialsToForm() {
    const count = this.excelSerialNumbers?.length || 0;
    const availableCtrl = this.ticketsForm.get('availableQuantity');
    if (count > 0) {
      availableCtrl?.setValue(count);
      availableCtrl?.disable({ emitEvent: false });
      this.isAvailableQuantityDisabled = true;
    } else {
      availableCtrl?.enable({ emitEvent: false });
      this.isAvailableQuantityDisabled = false;
    }
  }

  onBack(prevCallback?: any) {
    if (prevCallback) {
      prevCallback.emit();
    } else {
      this.router.navigate(['/outing']);
    }
  }

  isDaySelected(value: number): boolean {
    const selected = this.schedulesForm.get('dayOfWeek')?.value || [];
    return selected.includes(value);
  }

  toggleDaySelection(value: number) {
    const control = this.schedulesForm.get('dayOfWeek');
    let selected = [...(control?.value || [])];
    if (selected.includes(value)) {
      selected = selected.filter(v => v !== value);
    } else {
      selected.push(value);
    }
    control?.setValue(selected);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  isDayDisabled(value: number): boolean {
    const available = this.availableDays.map(d => d.value);
    return !available.includes(value);
  }

  get selectedCategoryName(): string {
    const categoryId = this.outingForm.get('OutingCategoryId')?.value;
    if (!categoryId) return '';
    const category = this.categories.find(c => c.value === categoryId);
    return category ? category.label : '';
  }

  getStartingPrice(): number {
    if (!this.ticketsList || this.ticketsList.length === 0) return 0;
    return Math.min(...this.ticketsList.map(t => t.price || 0));
  }

  onFinish() {
    this.router.navigate(['/outing']);
  }

  // ============= Form Control Getters =============
  get nameCtrl() {
    return this.outingForm.get('Name');
  }
  get descCtrl() {
    return this.outingForm.get('Description');
  }
  get locationCtrl() {
    return this.outingForm.get('Location');
  }
  get startDateCtrl() {
    return this.outingForm.get('StartDate');
  }
  get endDateCtrl() {
    return this.outingForm.get('EndDate');
  }
  get categoryCtrl() {
    return this.outingForm.get('OutingCategoryId');
  }

  get featuresCtrl() {
    return this.outingForm.get('FeatureIds');
  }
  get ratingCtrl() {
    return this.outingForm.get('Rating');
  }
  get targetAudienceCtrl() {
    return this.outingForm.get('TargetAudience');
  }
  get isActiveCtrl() {
    return this.outingForm.get('IsActive');
  }
  get isBlockedCtrl() {
    return this.outingForm.get('IsBlocked');
  }

  get isScheduledOuting(): boolean {
    return this.outingForm.get('OutingType')?.value === this.OutingType.Scheduled;
  }

  // Helper method for error display
  shouldShowError(controlName: string): boolean {
    const control = this.outingForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  trackByFn(index: number, item: any) {
    return index;
  }
}
