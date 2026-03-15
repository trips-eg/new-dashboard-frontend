import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PoliciesService } from 'src/app/shared/services/policies.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './policy-form.component.html',
  styleUrl: './policy-form.component.scss'
})
export class PolicyFormComponent implements OnInit {
  isEditMode = false;
  policiesForm: FormGroup;

  constructor(
    private policiesService: PoliciesService,
    private fb: FormBuilder,
    private ToastrService: ToastrService,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initPolicyForm();
    this.getPolicies();
  }
  getDirection(): 'rtl' | 'ltr' {
    return this.translateService.currentLang === 'ar' ? 'rtl' : 'ltr';
  }
  initPolicyForm() {
    this.policiesForm = this.fb.group({
      id: [''],
      policyPragraph: [null],
      enPolicyPragraph: [null]
    });
  }

  onEdit() {
    this.isEditMode = true;
    this.ToastrService.info('You can now edit the policy', 'Edit Mode');
  }

  onCancel() {
    this.isEditMode = false;
    this.ToastrService.warning('Edit cancelled', 'Cancelled');
    this.getPolicies();
  }

  onSave() {
    this.isEditMode = false;
    console.log(this.policiesForm.value);
    this.policiesService.updatePolicies(this.policiesForm.value).subscribe({
      next: (res) => {
        this.ToastrService.success('Policy updated successfully', 'Success');
      }
    });
  }

  fillFormWithData(data: any) {
    this.policiesForm.patchValue({
      id: data.id,
      policyPragraph: data.policyPragraph,
      enPolicyPragraph: data.enPolicyPragraph
    });
  }

  getPolicies() {
    this.policiesService.getPolicies().subscribe({
      next: (res) => {
        if (res?.data) {
          this.fillFormWithData(res.data);
        }
      }
    });
  }
}
