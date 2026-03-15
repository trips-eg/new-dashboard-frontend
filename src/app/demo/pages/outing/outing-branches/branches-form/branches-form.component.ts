import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingBranshesService } from 'src/app/shared/services/outing-branshes.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-branches-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './branches-form.component.html',
  styleUrl: './branches-form.component.scss'
})
export class BranchesFormComponent implements OnInit {
  branchesForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private outingBranshesService: OutingBranshesService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Populate data if edit mode
    if (this.config.data) {
      this.branchesForm.patchValue({
        name: this.config.data.name,
        description: this.config.data.description
      });
    }
  }

  initializeForm() {
    this.branchesForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]]
    });
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    // Mark all controls touched and validate
    this.branchesForm.markAllAsTouched();

    if (this.branchesForm.invalid) {
      return;
    }

    const payload = this.branchesForm.value;

    // Add id if in edit mode
    if (this.config?.data?.id) {
      // Typically update endpoints need ID in body or URL
      const updatePayload = { ...payload, id: this.config.data.id };
      this.updateBranch(updatePayload);
    } else {
      this.createBranch(payload);
    }
  }

  private createBranch(data: any) {
    this.outingBranshesService.addOutingBranches(data).subscribe({
      next: (res) => {
        if (res?.success) {
          this.toaster.success('Created successfully', 'Success');
          this.ref.close(res);
        } else {
          this.toaster.error('Failed to create', 'Error');
        }
      },
      error: (err) => {
        this.toaster.error('Create error', 'Error');
        console.error('Create error:', err);
      }
    });
  }

  private updateBranch(data: any) {
    this.outingBranshesService.updateOutingBranches(data).subscribe({
      next: (res) => {
        if (res?.success) {
          this.toaster.success('Updated successfully', 'Success');
          this.ref.close(res);
        } else {
          this.toaster.error('Failed to update', 'Error');
        }
      },
      error: (err) => {
        this.toaster.error('Update error', 'Error');
        console.error('Update error:', err);
      }
    });
  }

  // Helpers for template readability
  get nameCtrl() {
    return this.branchesForm.get('name');
  }

  get descCtrl() {
    return this.branchesForm.get('description');
  }
}
