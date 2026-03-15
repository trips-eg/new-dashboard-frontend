import { Component, OnInit, signal, WritableSignal, computed, effect } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { RoleService } from 'src/app/shared/services/role.service';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../../shared/components/sub-header/sub-header.component';
import { UseriesService } from 'src/app/shared/services/useries.service';
import { ImgUploaderComponent } from '../../../../../shared/img-uploader/img-uploader.component';
import { DropdownModule } from 'primeng/dropdown';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users-form',
  standalone: true,
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss',
  imports: [SharedModule, SubHeaderComponent, ImgUploaderComponent, DropdownModule]
})
export class UsersFormComponent implements OnInit {
  form: FormGroup;
  userlId: string;
  roles: any[] = [];
  vendors: any[] = [];
  vendorPage = 0;
  vendorSize = 20;
  loadingVendors = false;
  userFile: File | null = null;
  oldImage = '';
  showUserImgMessage = false;
  isEditMode = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private vendorService: VendorService,
    private UseriesService: UseriesService,
    private Router: Router,
    private ToastrService: ToastrService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.userlId = params['id'];
    });
  }

  // ngOnInit(): void {
  //   this.initForm();
  //   this.gettingAllRoles();

  //   this.form.get('Roles')?.valueChanges.subscribe((selectedRole) => {
  //     console.log('Selected Role:', selectedRole);
  //     this.selectedRole = selectedRole;
  //     if (selectedRole.roleType === 2) {
  //       this.form.get('CompanyId')?.setValidators(Validators.required);
  //     } else {
  //       this.form.get('CompanyId')?.reset();
  //       this.form.get('CompanyId')?.clearValidators();
  //     }
  //     this.form.get('CompanyId')?.updateValueAndValidity();
  //   });
  // }
  ngOnInit(): void {
    this.initForm();
    this.gettingAllRoles();

    if (this.userlId) {
      this.isEditMode = true;
      this.getUserDetails(+this.userlId);
    }

    this.form.get('Roles')?.valueChanges.subscribe((selectedRole) => {
      this.selectedRole = selectedRole;
      if (selectedRole.roleType === 2) {
        this.form.get('CompanyId')?.setValidators(Validators.required);
      } else {
        this.form.get('CompanyId')?.reset();
        this.form.get('CompanyId')?.clearValidators();
      }
      this.form.get('CompanyId')?.updateValueAndValidity();
    });
  }
  getUserDetails(id: number): void {
    this.form.get('Password')?.clearValidators();
    this.UseriesService.getUserById(id.toString()).subscribe({
      next: (res) => {
        const user = res.data;

        this.selectedRole = user.roles?.[0];

        if (this.selectedRole?.roleType === 2) {
          this.gettingAllVendors();
          this.form.get('CompanyId')?.setValidators(Validators.required);
          this.form.get('CompanyId')?.updateValueAndValidity();
        }

        this.form.patchValue({
          Username: user.username,
          FirstName: user.firstName,
          LastName: user.lastName,
          Email: user.email,
          PhoneNumber: user.phoneNumber,
          Roles: this.selectedRole,
          CompanyId: user.companyId || null,
          Gender: user.gender || null
        });

        if (user.imageUrl) {
          this.oldImage = user.imageUrl;
        }
      },
      error: (err) => {
        console.error('Error fetching user by ID:', err);
      }
    });
  }

  genderOptions = [
    { label: 'Male', value: 1 },
    { label: 'Female', value: 2 }
  ];
  noSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasSpace = /\s/.test(control.value);
      return hasSpace ? { hasSpaces: true } : null;
    };
  }
  initForm() {
    this.form = this.fb.group({
      Username: ['', [Validators.required, this.noSpacesValidator()]],
      Password: ['', Validators.required],
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Gender: [null, Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      PhoneNumber: ['', Validators.required],
      Roles: [null, Validators.required],
      CompanyId: [null]
    });
  }

  gettingAllRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (res) => {
        debugger;
        this.roles = res.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  onVendorSearch(event: { originalEvent: Event; filter: string }) {
    this.vendorPage = 0;
    const searchTerm = event.filter;

    this.gettingAllVendors(searchTerm);
  }

  gettingAllVendors(searchTerm: string = '') {
    const filterMap: FilterMap = {
      pageIndex: this.vendorPage,
      pageSize: this.vendorSize,
      search: searchTerm
    };

    this.loadingVendors = true;

    this.vendorService.getAllVendors(filterMap).subscribe({
      next: (res) => {
        this.vendors = res.data.data || res.data;
        this.loadingVendors = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingVendors = false;
      }
    });
  }
  selectedRole: any = null;

  onRoleChange(role: any) {
    console.log('Selected Role :', role);
    this.selectedRole = role;
    this.form.get('Roles')?.setValue(role);
    if (role.roleType === 2) {
      this.gettingAllVendors();
    } else {
      this.form.get('CompanyId')?.reset();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.ToastrService.error('Error', 'Please fill all required fields correctly.');
      return;
    }
    if (!this.isEditMode && !this.userFile) {
      this.showUserImgMessage = true;
      return;
    }

    const formData = new FormData();
    const formValue = this.form.value;

    for (const key in formValue) {
      if (formValue[key] !== null && formValue[key] !== undefined) {
        if (key === 'Password' && this.isEditMode) {
          continue; // ❌ لا تبعت الباسوورد لو تعديل
        }

        if (key === 'Roles') {
          formData.append('Roles', formValue.Roles.name);
        } else {
          formData.append(key, String(formValue[key]));
        }
      }
    }

    if (this.userFile) {
      formData.append('Image', this.userFile);
    }

    if (this.isEditMode) {
      // ✏️ call update API
      this.UseriesService.updateUser(formData).subscribe({
        next: (res) => {
          this.ToastrService.success('success', 'User updated successfully');
          this.Router.navigate(['/users']);
        },
        error: (err) => {
          this.ToastrService.error(err.error.message || 'Error', 'Failed to update user');
          console.error('Error updating user:', err);
        }
      });
    } else {
      // ➕ call create API
      this.UseriesService.createUser(formData).subscribe({
        next: (res) => {
          this.form.reset();
          this.userFile = null;
          this.Router.navigate(['/users']);
          this.ToastrService.success('success', 'User created successfully');
        },
        error: (err) => {
          this.ToastrService.error(err.error.message || 'Error', 'Failed to create user');
          console.error('Error creating user:', err);
        }
      });
    }
  }

  onUserFileSelect(event: File[]): void {
    this.userFile = event[0] ?? null;
    this.showUserImgMessage = false;
  }
  onCansel(): void {
    this.Router.navigate(['/users']);
  }
}
