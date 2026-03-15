import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoomFeaturiesService } from 'src/app/shared/services/room-featuries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-room-features-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './room-features-form.component.html',
  styleUrl: './room-features-form.component.scss',
  providers: [MessageService] // Provide MessageService for toast
})
export class RoomFeaturesFormComponent {
  roomFeatureForm: FormGroup;
  isLoading = false; // Track loading state

  constructor(
    private fb: FormBuilder,
    private RoomFeaturiesService: RoomFeaturiesService, // Renamed for consistency
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef, // Inject DynamicDialogRef
    private messageService: MessageService // For toast notifications
  ) {}

  ngOnInit(): void {
    this.createRFForm();
    if (this.config.data) {
      console.log('Received data:', this.config.data);
      this.handleEdit();
    }
  }

  createRFForm() {
    this.roomFeatureForm = this.fb.group({
      name: ['', Validators.required] // Add validation if required
    });
  }

  handleEdit() {
    if (this.config.data) {
      this.roomFeatureForm.patchValue({
        name: this.config.data.name || ''
      });
      console.log('Editing  type:', this.config.data.name);
    }
  }

  onSubmit() {
    if (this.roomFeatureForm.valid) {
      this.isLoading = true; // Show loading state
      if (this.config.data && this.config.data.id) {
        // Update operation
        this.RoomFeaturiesService.updateRoomFeature(this.config.data.id, this.roomFeatureForm.get('name').value).subscribe({
          next: (res) => {
            this.isLoading = false;

            this.ref.close(res); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update bed type'
            });
            console.error('Update error:', err);
          }
        });
      } else {
        // Create operation
        this.RoomFeaturiesService.sendRoomFeature(this.roomFeatureForm.value).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Bed type created successfully'
            });
            this.ref.close(this.roomFeatureForm.value); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create bed type'
            });
            console.error('Create error:', err);
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Form',
        detail: 'Please fill in all required fields'
      });
      console.log('Form is invalid');
    }
  }

  onCancel() {
    this.ref.close(); // Close dialog without data
  }
}
