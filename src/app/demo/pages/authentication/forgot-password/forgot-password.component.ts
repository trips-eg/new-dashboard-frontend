import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/shared/services/account.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { InputOtpModule } from 'primeng/inputotp';
import { StepperModule } from 'primeng/stepper';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule, InputOtpModule, StepperModule, PasswordModule, InputTextModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  otpForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  email = '';
  activeStep = 0;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.passwordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator }
    );
  }

  sendOtp() {
    if (this.emailForm.invalid) return;
    this.loading = true;
    this.email = this.emailForm.value.email;

    this.accountService.sendOtp(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success || res.status === 200) {
          // Adjust based on actual API response
          this.toast.success('OTP sent to your email');
          this.activeStep = 1;
        } else {
          this.toast.error(res.message || 'Failed to send OTP');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Failed to send OTP');
      }
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;
    this.loading = true;
    const model = {
      email: this.email,
      otp: this.otpForm.value.otp
    };

    this.accountService.verifyOtp(model).subscribe({
      next: (res: any) => {
        this.loading = false;
        // Assuming success if no error, but ideally check res.success
        this.toast.success('OTP verified');
        this.activeStep = 2;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Invalid OTP');
      }
    });
  }

  resetPassword() {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    const model = {
      email: this.email,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.accountService.resetPassword(model).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.toast.success('Password reset successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Failed to reset password');
      }
    });
  }
}

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword ? null : { mismatch: true };
}
