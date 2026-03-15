import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { RolesService } from 'src/app/shared/services/roles.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [SharedModule],
  providers: [ToastrService],
  templateUrl: './roles-form.component.html',
  styleUrl: './roles-form.component.scss'
})
export class RolesFormComponent implements OnInit {
  roleForm!: FormGroup;
  roleTypes = [
    { label: 'Admin', value: 1 },
    { label: 'vendor', value: 2 },
    { label: 'User', value: 3 } ,
    {label:'Security',value:4}
  ];
  constructor(
    private fb: FormBuilder,
    private RolesService: RolesService,
    private toaster:ToastrService,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      roleType: [null, Validators.required]
    });
  }
onSubmit(): void {
  if (this.roleForm.valid) {
    const formValue = this.roleForm.value;

    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('roleType', formValue.roleType);

    this.RolesService.addRole(formData).subscribe({
      next: (res) => {
        this.toaster.success('Role added successfully');
        this.ref.close(res);
      },
      error: (err) => {
        this.toaster.error('Failed to add role');
      }
    });
  } else {
    this.roleForm.markAllAsTouched();
  }
}

  getControl(controlName: string) {
    return this.roleForm.get(controlName);
  }
  onCancel() {
    this.ref.close();
  }
}
