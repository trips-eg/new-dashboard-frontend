import { NationalitiesService } from './../../../../../shared/services/nationalities.service';
import { co } from '@fullcalendar/core/internal-common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nationalities-form',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService],
  templateUrl: './nationalities-form.component.html',
  styleUrl: './nationalities-form.component.scss'
})
export class NationalitiesFormComponent implements OnInit {
  nationalitiesForm: FormGroup;
  
  nationalitiesFormGroup() {
    this.nationalitiesForm = this.fb.group({
      name: [null, [Validators.required]],
      nameAr: [null, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.nationalitiesForm.valid) {
      const payload = this.nationalitiesForm.value;

      // Check if update or create
      if (this.config?.data && this.config.data.id) {
        // Update operation
        this.NationalitiesService.updateNationality(this.config.data.id, payload).subscribe({
          next: (res) => {
            this.toaster.success('Updated successfully' , 'Success');
            this.ref.close(res); // Pass updated data
          },
          error: (err) => {
            this.toaster.error('Update error' , 'Error');
            this.ref.close();

            console.error('Update error:', err);
          }
        });
      } else {
        // Create operation
        this.NationalitiesService.setNationalities(payload).subscribe({
          next: (res) => {
            this.toaster.success('Created successfully' , 'Success');
            this.ref.close(payload); // Pass created data
          },
          error: (err) => {
            this.toaster.error('Create error' , 'Error');
            this.ref.close();

            console.error('Create error:', err);
          }
        });
      }
    } else {
      this.nationalitiesForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.ref.close();
  }
  handleEdit() {
    if (this.config.data) {
      this.nationalitiesForm.patchValue({
        name: this.config.data.name || '',
        nameAr: this.config.data.nameAr || ''
      });
      console.log('Editing bed type:', this.config.data.name);
    }
  }
  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private NationalitiesService: NationalitiesService , 
    private toaster:ToastrService
  ) {}
  ngOnInit(): void {
    this.nationalitiesFormGroup();
    if (this.config.data) {
      console.log('Received data:', this.config.data);
      this.handleEdit();
    }
  }
}
