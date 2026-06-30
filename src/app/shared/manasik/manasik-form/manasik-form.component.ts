import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { ManasikType } from '../../Enums/manasikType';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from '../../img-uploader/img-uploader.component';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { EditorModule } from 'primeng/editor';
import { SubHeaderComponent } from '../../components/sub-header/sub-header.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-manasik-form',
  standalone: true,
  imports: [
    SharedModule,
    ImgUploaderComponent,
    StepperModule,
    ButtonModule,
    ToastModule,
    PanelModule,
    EditorModule,
    SubHeaderComponent,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './manasik-form.component.html',
  styleUrls: ['./manasik-form.component.scss']
})
export class ManasikFormComponent implements OnInit {
  // Stepper control
  activeStep: number = 0;
  isLoading: boolean = false;

  // Edit mode tracking
  isEditMode: boolean = false;
  manasikId: number | null = null;

  // Step 1 form
  form!: FormGroup;
  type!: ManasikType;
  selectedImages: File[] = [];
  existingImages: any[] = [];
  deletedImageIds: number[] = [];
  accommodationTypeList: { label: string; value: any }[] = [];
  displayAddAccommodationTypeDialog: boolean = false;
  accommodationTypeForm: FormGroup = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: ['', Validators.required]
  });
  isSavingAccommodationType: boolean = false;

  travelFeatureList: { label: string; value: any }[] = [];
  displayAddTravelFeatureDialog: boolean = false;
  travelFeatureForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });
  isSavingTravelFeature: boolean = false;

  childPricingTypes = [
    { label: 'Percentage (%)', value: 1 },
    { label: 'Fixed Amount', value: 2 }
  ];

  // Step 2 form – Steps (Segments)
  stepsForm!: FormGroup;

  // Step 3 form – Tickets
  ticketsForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: HajjUmmrahService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private travelService: TravelTripsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.type = Number(params['type']);
      this.manasikId = params['id'] ? Number(params['id']) : null;
      this.isEditMode = !!this.manasikId;

      this.buildForm();
      this.buildStepsForm();
      this.buildTicketsForm();
      this.getDropDownList();

      if (this.isEditMode && this.manasikId) {
        this.loadManasikData(this.manasikId);
      }
    });
  }

  // ... (keep loadManasikData, populateFormWithData, buildForm, descriptions, addDescription, removeDescription, buildStepsForm, steps, addStep, removeStep, getStepDescriptions, addStepDescription, removeStepDescription, buildTicketsForm, tickets, addTicket)

  // -------------------------
  // Load existing manasik data
  // -------------------------
  loadManasikData(id: number): void {
    this.isLoading = true;
    this.service.getManasikById(id).subscribe({
      next: (res: any) => {
        this.populateFormWithData(res.data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load manasik data:', err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load manasik data'
        });
      }
    });
  }

  // -------------------------
  // Populate forms with existing data
  // -------------------------
  populateFormWithData(data: any): void {
    // Step 1: Basic Information
    this.form.patchValue({
      Name: data.name,
      Rating: data.rating,
      Price: data.price,
      ChildPrice: data.childPrice,
      PriceBefore: data.priceBefore || null, // Added PriceBefore field
      StartDate: data.startDate ? new Date(data.startDate) : null,
      EndDate: data.endDate ? new Date(data.endDate) : null,
      IsActive: data.isActive,
      Capacity: data.capacity,
      DaysInMakkah: data.daysInMakkah,
      DaysInMadinah: data.daysInMadinah,
      ResidenceInMakkah: data.residenceInMakkah,
      ResidenceInMadinah: data.residenceInMadinah,
      FlightLine: data.flightLine,
      ExternalLink: data.externalLink,
      NumberOfDays: data.numberOfDays,
      IsRecommended: data.isRecommended,
      IsFake: data.isFake,
      CancellationPolicy: data.cancellationPolicy,
      IsRefundable: data.isRefundable,
      MinimumDaysToRefund: data.minimumDaysToRefund,
      IsAllowPaymentUponArrival: data.isAllowPaymentUponArrival,
      depositRate: data.depositRate,
      IsIncludeVate: data.isIncludeVate,
      FromLocation: data.fromLocation || '',
      ToLocation: data.toLocation || '',
      AccommodationTypeId: data.accommodationTypeId || null,
      Features: data.features?.map((f: any) => f.id) || [],
      Type: data.type
    });

    // Populate Descriptions
    this.descriptions.clear();
    if (data.descriptions && data.descriptions.length > 0) {
      data.descriptions.forEach((desc: any) => {
        this.descriptions.push(
          this.fb.group({
            id: [desc.id],
            description: [desc.description]
          })
        );
      });
    }

    // Populate Child Pricing Policies
    this.childPricingPolicies.clear();
    if (data.childPricingPolicies && data.childPricingPolicies.length > 0) {
      data.childPricingPolicies.forEach((policy: any) => {
        this.childPricingPolicies.push(
          this.fb.group({
            id: [policy.id || 0],
            minAge: [policy.minAge, [Validators.required, Validators.min(0)]],
            maxAge: [policy.maxAge, [Validators.required, Validators.min(0)]],
            pricingType: [policy.pricingType, Validators.required],
            value: [policy.value, [Validators.required, Validators.min(0)]]
          })
        );
      });
    }

    // Populate Images (for display only)
    this.existingImages = data.images
      ? data.images.map((img: any) => ({
          id: img.id,
          url: img.imageUrl,
          isFavorite: img.isFavoriteImage
        }))
      : [];

    // Step 2: Segments (Program Steps)
    this.steps.clear();
    if (data.segments && data.segments.length > 0) {
      data.segments.forEach((segment: any) => {
        const stepGroup = this.fb.group({
          id: [segment.id],
          type: [segment.type, Validators.required],
          title: [segment.title, Validators.required],
          details: [segment.details],
          time: [segment.time ? new Date(segment.time) : null],
          fromLocation: [segment.fromLocation],
          toLocation: [segment.toLocation],
          fromTime: [segment.fromTime ? new Date(segment.fromTime) : null],
          toTime: [segment.toTime ? new Date(segment.toTime) : null],
          stepDescriptions: this.fb.array([])
        });

        // Populate step descriptions
        if (segment.stepDescriptions && segment.stepDescriptions.length > 0) {
          const stepDescArray = stepGroup.get('stepDescriptions') as FormArray;
          segment.stepDescriptions.forEach((desc: any) => {
            stepDescArray.push(
              this.fb.group({
                id: [desc.id],
                description: [desc.description]
              })
            );
          });
        }

        this.steps.push(stepGroup);
      });
    }

    // Step 3: Tickets
    if (data.tickets && data.tickets.length > 0) {
      data.tickets.forEach((ticket: any) => {
        const ticketGroup = this.fb.group({
          id: [ticket.id],
          ticketType: [ticket.ticketType, Validators.required],
          description: [ticket.description],
          price: [ticket.price, Validators.required],
          availableQuantity: [ticket.availableQuantity, Validators.required],
          isActive: [ticket.isActive]
        });
        this.tickets.push(ticketGroup);
      });
    }
  }

  // -------------------------
  // Step 1: Build Manasik form
  // -------------------------
  buildForm() {
    this.form = this.fb.group({
      Name: ['', Validators.required],
      Rating: [0, Validators.required],
      Price: [0, [Validators.required, Validators.min(1)]],
      ChildPrice: [0],
      PriceBefore: [null], // Added PriceBefore field
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      IsActive: [true],
      Capacity: [0, [Validators.required, Validators.min(1)]],
      DaysInMakkah: [0, [Validators.required, Validators.min(0)]],
      DaysInMadinah: [0, [Validators.required, Validators.min(0)]],
      ResidenceInMakkah: ['', Validators.required],
      ResidenceInMadinah: ['', Validators.required],
      FlightLine: ['', Validators.required],
      ExternalLink: [''],
      NumberOfDays: [0, [Validators.required, Validators.min(1)]],
      IsRecommended: [false],
      IsFake: [false],
      CancellationPolicy: ['', Validators.required],
      IsRefundable: [false],
      MinimumDaysToRefund: [0],
      IsAllowPaymentUponArrival: [false],
      depositRate: [0],
      IsIncludeVate: [false],
      FromLocation: ['', Validators.required],
      ToLocation: ['', Validators.required],
      Descriptions: this.fb.array([]),
      Type: [this.type],
      AccommodationTypeId: [null],
      Features: [[]],
      ChildPricingPolicies: this.fb.array([])
    });
  }

  get descriptions(): FormArray {
    return this.form.get('Descriptions') as FormArray;
  }

  addDescription() {
    this.descriptions.push(
      this.fb.group({
        id: [null], // null for new descriptions
        description: ['']
      })
    );
  }

  removeDescription(index: number) {
    this.descriptions.removeAt(index);
  }

  // -------------------------
  // Step 2: Build Steps form
  // -------------------------
  buildStepsForm() {
    this.stepsForm = this.fb.group({
      steps: this.fb.array([])
    });
  }

  get steps(): FormArray {
    return this.stepsForm.get('steps') as FormArray;
  }

  addStep() {
    const stepGroup = this.fb.group({
      // null for new steps
      type: [1, Validators.required],
      title: ['', Validators.required],
      details: [''],
      time: [null],
      fromLocation: [null],
      toLocation: [null],
      fromTime: [null],
      toTime: [null],
      stepDescriptions: this.fb.array([])
    });

    this.steps.push(stepGroup);
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
  }

  // -------------------------
  // StepDescriptions inside each step
  // -------------------------
  getStepDescriptions(stepIndex: number): FormArray {
    return this.steps.at(stepIndex).get('stepDescriptions') as FormArray;
  }

  addStepDescription(stepIndex: number) {
    this.getStepDescriptions(stepIndex).push(
      this.fb.group({
        id: [null], // null for new step descriptions
        description: ['']
      })
    );
  }

  removeStepDescription(stepIndex: number, descIndex: number) {
    this.getStepDescriptions(stepIndex).removeAt(descIndex);
  }

  // -------------------------
  // Step 3: Build Tickets form
  // -------------------------
  buildTicketsForm() {
    this.ticketsForm = this.fb.group({
      ticketType: ['', Validators.required],
      description: [''],
      price: [0, Validators.required],
      availableQuantity: [0, Validators.required],
      isActive: [true]
    });
  }

  get tickets(): FormArray {
    if (!this.ticketsForm.contains('ticketsList')) {
      this.ticketsForm.addControl('ticketsList', this.fb.array([]));
    }
    return this.ticketsForm.get('ticketsList') as FormArray;
  }

  addTicket() {
    if (this.ticketsForm.invalid) {
      this.ticketsForm.markAllAsTouched();
      return;
    }

    const ticketGroup = this.fb.group({
      id: [null], // null for new tickets
      ticketType: [this.ticketsForm.get('ticketType')?.value, Validators.required],
      description: [this.ticketsForm.get('description')?.value],
      price: [this.ticketsForm.get('price')?.value, Validators.required],
      availableQuantity: [this.ticketsForm.get('availableQuantity')?.value, Validators.required],
      isActive: [this.ticketsForm.get('isActive')?.value]
    });

    this.tickets.push(ticketGroup);

    // Reset the form fields
    this.ticketsForm.patchValue({
      ticketType: '',
      description: '',
      price: 0,
      availableQuantity: 0,
      isActive: true
    });
  }

  removeTicket(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this ticket?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ticketId = this.tickets.at(index).get('id')?.value;
        if (ticketId) {
          this.service.deleteManasikTicket(ticketId).subscribe({
            next: (res) => {
              if (res?.success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Deleted successfully'
                });
                this.tickets.removeAt(index); // Remove only after success
              }
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete ticket'
              });
              console.error('Failed to delete ticket:', err);
            }
          });
        } else {
          // New ticket not saved to DB yet, just remove from UI
          this.tickets.removeAt(index);
        }
      }
    });
  }

  // -------------------------
  // Image handling
  // -------------------------
  onImagesUpload(files: File[]) {
    this.selectedImages = files;
  }

  onImageDeleted(imageId: number): void {
    console.log('Image deleted with ID:', imageId);

    if (imageId && !this.deletedImageIds.includes(imageId)) {
      this.deletedImageIds.push(imageId);
    }

    // Remove from existing images display
    this.existingImages = this.existingImages.filter((img) => img.id !== imageId);
  }

  // -------------------------
  // Step 1: Build FormData
  // -------------------------
  buildFormData(): FormData {
    const formData = new FormData();
    const value = this.form.value;

    // Add manasik ID for edit mode
    if (this.isEditMode && this.manasikId) {
      formData.append('Id', this.manasikId.toString());
    }

    // List of date fields that need conversion
    const dateFields = ['StartDate', 'EndDate'];

    // Append normal fields (excluding Descriptions, Features, ChildPricingPolicies)
    Object.keys(value).forEach((key) => {
      if (key === 'Descriptions' || key === 'Features' || key === 'ChildPricingPolicies') return;

      // Convert dates to ISO string
      if (dateFields.includes(key) && value[key]) {
        const dateValue = new Date(value[key]);
        formData.append(key, dateValue.toISOString());
      } else {
        const safeValue = value[key] === null || value[key] === undefined ? '' : value[key];
        formData.append(key, safeValue);
      }
    });

    // Append Descriptions with IDs for edit mode
    value.Descriptions.forEach((desc: any) => {
      if (desc.id) {
        // Existing description with ID
        formData.append('Descriptions', JSON.stringify({ id: desc.id, description: desc.description }));
      } else {
        // New description without ID
        formData.append('Descriptions', JSON.stringify({ description: desc.description }));
      }
    });

    // Append deleted image IDs
    this.deletedImageIds.forEach((id) => {
      formData.append('DeletedImageIds', id.toString());
    });

    // Append new images
    this.selectedImages.forEach((file) => {
      formData.append('ImagesFiles', file);
    });

    // Append Features
    if (value.Features && value.Features.length > 0) {
      value.Features.forEach((id: any) => {
        formData.append('Features', id.toString());
      });
    }

    // Append ChildPricingPolicies
    if (value.ChildPricingPolicies && value.ChildPricingPolicies.length > 0) {
      value.ChildPricingPolicies.forEach((policy: any) => {
        formData.append('ChildPricingPolicies', JSON.stringify(policy));
      });
    }

    return formData;
  }

  // -------------------------
  // Submit Step 1
  // -------------------------
  submitStep1(nextCallback?: EventEmitter<void>) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields'
      });
      return;
    }

    this.isLoading = true;
    const formData = this.buildFormData();

    const apiCall = this.isEditMode ? this.service.updateManasikInfo(formData) : this.service.addManasik(formData);

    apiCall.subscribe({
      next: (res: any) => {
        if (!this.isEditMode) {
          this.manasikId = res.data;
          this.isEditMode = true; // Switch to edit mode after creation
        }

        console.log('Step 1 saved, manasikId =', this.manasikId);
        this.isLoading = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Manasik information saved successfully'
        });

        // Go to step 2
        if (nextCallback) {
          nextCallback.emit();
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save manasik information'
        });
      }
    });
  }

  // -------------------------
  // Submit Step 2
  // -------------------------
  submitStep2(nextCallback?: EventEmitter<void>) {
    if (!this.manasikId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please complete Step 1 first'
      });
      return;
    }

    // Convert dates to ISO and prepare payload
    const stepsWithIsoDates = this.steps.value.map((step: any) => {
      const convertedStep = { ...step };

      const timeFields = ['time', 'fromTime', 'toTime'];

      timeFields.forEach((field) => {
        if (convertedStep[field]) {
          const dateValue = convertedStep[field] instanceof Date ? convertedStep[field] : new Date(convertedStep[field]);

          if (!isNaN(dateValue.getTime())) {
            convertedStep[field] = dateValue.toISOString();
          }
        }
      });

      // Handle step descriptions with IDs
      if (convertedStep.stepDescriptions) {
        convertedStep.stepDescriptions = convertedStep.stepDescriptions.map((desc: any) => {
          if (desc.id) {
            return { id: desc.id, description: desc.description };
          } else {
            return { description: desc.description };
          }
        });
      }

      return convertedStep;
    });

    const payload = {
      tripIds: [this.manasikId],
      steps: stepsWithIsoDates
    };

    this.isLoading = true;

    // Use different API based on mode
    const apiCall = this.isEditMode ? this.service.updateManasikProgram(payload) : this.service.addManasikProgram(payload);

    apiCall.subscribe({
      next: () => {
        console.log('Step 2 saved successfully');
        this.isLoading = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Program steps saved successfully'
        });

        // Go to step 3
        if (nextCallback) {
          nextCallback.emit();
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save program steps'
        });
      }
    });
  }

  // -------------------------
  // Submit Step 3 (Final)
  // -------------------------
  submitStep3() {
    if (!this.manasikId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please complete previous steps first'
      });
      return;
    }

    if (this.tickets.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add at least one ticket'
      });
      return;
    }

    // Prepare tickets payload with IDs for edit mode
    const ticketsPayload = this.tickets.value.map((ticket: any) => {
      if (ticket.id) {
        // Existing ticket with ID
        return {
          id: ticket.id,
          ticketType: ticket.ticketType,
          description: ticket.description,
          price: ticket.price,
          availableQuantity: ticket.availableQuantity,
          isActive: ticket.isActive
        };
      } else {
        // New ticket without ID
        return {
          ticketType: ticket.ticketType,
          description: ticket.description,
          price: ticket.price,
          availableQuantity: ticket.availableQuantity,
          isActive: ticket.isActive
        };
      }
    });

    const payload = {
      hajjId: this.manasikId,
      tickets: ticketsPayload
    };

    this.isLoading = true;
    const apiCall = this.isEditMode
      ? this.service.updateManasikTicket(payload) // ✅ NEW - Uses POST
      : this.service.addManasikTicket(payload); // Existing - Uses POST

    apiCall.subscribe({
      next: () => {
        console.log('Step 3 tickets saved successfully');
        this.isLoading = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Manasik updated successfully!' : 'Manasik created successfully!'
        });

        // Navigate back to list after 1 second
        setTimeout(() => {
          debugger;
          if (this.type == ManasikType.Hajj) {
            this.router.navigate(['/hajj']);
          } else if (this.type == ManasikType.Umrah) {
            this.router.navigate(['/ummrah']);
          }
        }, 1000);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save tickets'
        });
      }
    });
  }

  getDropDownList() {
    this.getAccommodationTypeList();
    this.getTravelFeatures();
  }

  getAccommodationTypeList() {
    this.travelService.getAllAccommodationTypes().subscribe((response) => {
      if (response && response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
        this.accommodationTypeList = list.map((type: any) => ({
          label: type.name || type.description,
          value: type.id
        }));
      } else if (Array.isArray(response)) {
        this.accommodationTypeList = response.map((type: any) => ({
          label: type.name || type.description,
          value: type.id
        }));
      }
    });
  }

  showAddAccommodationTypeDialog() {
    this.accommodationTypeForm.reset();
    this.displayAddAccommodationTypeDialog = true;
  }

  selectAccommodationType(value: any) {
    this.form.get('AccommodationTypeId')?.setValue(value);
    this.form.get('AccommodationTypeId')?.markAsTouched();
  }

  saveAccommodationType() {
    if (this.accommodationTypeForm.invalid) return;

    this.isSavingAccommodationType = true;
    this.travelService.addAccommodationType(this.accommodationTypeForm.value).subscribe({
      next: (response) => {
        this.isSavingAccommodationType = false;
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Accommodation Type added successfully' });
          this.displayAddAccommodationTypeDialog = false;
          this.getAccommodationTypeList();
          if (response.data && response.data.id) {
            this.selectAccommodationType(response.data.id);
          }
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to add accommodation type' });
        }
      },
      error: (error) => {
        this.isSavingAccommodationType = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'Error occurred while saving' });
      }
    });
  }

  getTravelFeatures() {
    this.travelService.getAllTravelFeatures().subscribe((response) => {
      if (response && response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
        this.travelFeatureList = list.map((feat: any) => ({
          label: feat.name,
          value: feat.id
        }));
      } else if (Array.isArray(response)) {
        this.travelFeatureList = response.map((feat: any) => ({
          label: feat.name,
          value: feat.id
        }));
      }
    });
  }

  showAddTravelFeatureDialog() {
    this.travelFeatureForm.reset();
    this.displayAddTravelFeatureDialog = true;
  }

  saveTravelFeature() {
    if (this.travelFeatureForm.invalid) return;

    this.isSavingTravelFeature = true;
    this.travelService.createTravelFeature(this.travelFeatureForm.value).subscribe({
      next: (response) => {
        this.isSavingTravelFeature = false;
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Travel Feature added successfully' });
          this.displayAddTravelFeatureDialog = false;
          this.getTravelFeatures();
          if (response.data && response.data.id) {
            const currentFeatures = this.form.get('Features')?.value || [];
            this.form.get('Features')?.setValue([...currentFeatures, response.data.id]);
          }
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to add travel feature' });
        }
      },
      error: (error) => {
        this.isSavingTravelFeature = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'Error occurred while saving' });
      }
    });
  }

  isTravelFeatureSelected(id: any): boolean {
    const currentFeatures = this.form.get('Features')?.value || [];
    return currentFeatures.includes(id);
  }

  toggleTravelFeature(id: any): void {
    const control = this.form.get('Features');
    const currentFeatures = control?.value || [];
    if (currentFeatures.includes(id)) {
      control?.setValue(currentFeatures.filter((item: any) => item !== id));
    } else {
      control?.setValue([...currentFeatures, id]);
    }
    control?.markAsTouched();
  }

  get childPricingPolicies(): FormArray {
    return this.form.get('ChildPricingPolicies') as FormArray;
  }

  addChildPricingPolicy(): void {
    const policyGroup = this.fb.group({
      id: [0],
      minAge: [0, [Validators.required, Validators.min(0)]],
      maxAge: [0, [Validators.required, Validators.min(0)]],
      pricingType: [1, Validators.required],
      value: [0, [Validators.required, Validators.min(0)]]
    });
    this.childPricingPolicies.push(policyGroup);
  }

  removeChildPricingPolicy(index: number): void {
    this.childPricingPolicies.removeAt(index);
  }
}
