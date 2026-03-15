import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BedTybeService } from 'src/app/shared/services/bed-tybe.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MessageService } from 'primeng/api'; // For toast messages

@Component({
  selector: 'app-bed-tybe-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './bed-tybe-form.component.html',
  styleUrl: './bed-tybe-form.component.scss',
  providers: [MessageService] // Provide MessageService for toast
})
export class BedTybeFormComponent implements OnInit {
  bedTybeForm: FormGroup;
  isLoading = false; // Track loading state

  constructor(
    private fb: FormBuilder,
    private bedTybeService: BedTybeService, // Renamed for consistency
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef, // Inject DynamicDialogRef
    private messageService: MessageService // For toast notifications
  ) {}

  ngOnInit(): void {
    this.createBTForm();
    if (this.config.data) {
      console.log('Received data:', this.config.data);
      this.handleEdit();
    }
  }

  createBTForm() {
    this.bedTybeForm = this.fb.group({
      name: ['', Validators.required] // Add validation if required
    });
  }

  handleEdit() {
    if (this.config.data) {
      this.bedTybeForm.patchValue({
        name: this.config.data.name || ''
      });
      console.log('Editing bed type:', this.config.data.name);
    }
  }

  onSubmit() {
    if (this.bedTybeForm.valid) {
      this.isLoading = true; // Show loading state
      if (this.config.data && this.config.data.id) {
        // Update operation
        this.bedTybeService.updateBedTybe(this.config.data.id, this.bedTybeForm.get('name').value).subscribe({
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
        this.bedTybeService.sendBedTybe(this.bedTybeForm.value).subscribe({
          next: (res) => {
            this.isLoading = false;

            this.ref.close(this.bedTybeForm.value); // Close dialog and pass data
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
