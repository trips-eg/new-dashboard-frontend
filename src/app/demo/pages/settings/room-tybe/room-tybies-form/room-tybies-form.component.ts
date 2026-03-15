import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoomTybeService } from 'src/app/shared/services/room-tybe.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-room-tybies-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './room-tybies-form.component.html',
  styleUrl: './room-tybies-form.component.scss'
})
export class RoomTybiesFormComponent {
  roomTybeForm: FormGroup;
  isLoading = false; // Track loading state

  constructor(
    private fb: FormBuilder,
    private RoomTybeService: RoomTybeService, // Renamed for consistency
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef, // Inject DynamicDialogRef
    private messageService: MessageService, // For toast notifications
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createRTForm();
    if (this.config.data) {
      console.log(this.config);
      this.handleEdit();
    }
  }

  createRTForm() {
    this.roomTybeForm = this.fb.group({
      name: [null, Validators.required], // Add validation if required
      maxOccupancy: [1, [Validators.required, Validators.min(1)]]
    });
  }

  handleEdit() {
    if (this.config.data) {
      this.roomTybeForm.patchValue({
        name: this.config.data.name || '',
        maxOccupancy: this.config.data.maxOccupancy || 1
      });
      console.log('Editing room type:', this.config.data);
    }
  }

  onSubmit() {
    if (this.roomTybeForm.valid) {
      this.isLoading = true; // Show loading state
      if (this.config.data && this.config.data.id) {
        // Update operation
        this.RoomTybeService.updateRoomTybe({
          id: this.config.data.id,
          name: this.roomTybeForm.value.name,
          maxOccupancy: this.roomTybeForm.value.maxOccupancy
        }).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.ref.close(res); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.ToastrService.error('Failed to update room type', 'Error');
          }
        });
      } else {
        // Create operation
        this.RoomTybeService.setRoomTybe(this.roomTybeForm.value).subscribe({
          next: (res) => {
            this.isLoading = false;

            this.ref.close(this.roomTybeForm.value); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create room type'
            });
            console.error('Create error:', err);
          }
        });
      }
    } else {
      this.ToastrService.error('Form is invalid', 'Error');
      console.log('Form is invalid');
    }
  }

  onCancel() {
    this.ref.close(); // Close dialog without data
  }
}
