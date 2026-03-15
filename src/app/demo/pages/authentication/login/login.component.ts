import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/shared/services/account.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CarouselModule } from 'primeng/carousel';
import { NavigationItem } from 'src/app/theme/layout/admin/navigation/navigation';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    SharedModule,
    ReactiveFormsModule,
    PasswordModule,
    CheckboxModule,
    InputTextModule,
    ProgressSpinnerModule,
    CarouselModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent {
  @ViewChild('signInNgForm') signInNgForm: NgForm;
  signInForm: FormGroup;
  showErrorMsg: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;
  currentYear: number = new Date().getFullYear();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private _loginService: AccountService,
    private toast: ToastrService,
    private navService: NavigationItem,
    private configService: ConfigureService
  ) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
      // rememberMe: [false]
    });

    // Check for saved credentials
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      this.signInForm.patchValue({
        username: credentials.username,
        password: credentials.password,
        rememberMe: true
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = this.showPassword ? 'text' : 'password';
  }
  private isExactScanner(permissions: string[]): boolean {
    const scannerPermissions = ['Permissions.Scanner.View', 'Permissions.Scanner.Edit'];

    return permissions.length === scannerPermissions.length && scannerPermissions.every((p) => permissions.includes(p));
  }

  onSubmit() {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.showErrorMsg = false;

    if (this.signInForm.value.rememberMe) {
      localStorage.setItem(
        'savedCredentials',
        JSON.stringify({
          username: this.signInForm.value.username,
          password: this.signInForm.value.password
        })
      );
    } else {
      localStorage.removeItem('savedCredentials');
    }

    this._loginService.login(this.signInForm.value).subscribe(
      (response: any) => {
        if (response.success) {
          // حفظ بيانات اليوزر في ConfigureService
          this.configService.setUser(response.data);

          const permissions = response.data.permissions || [];
          const roles = response.data.roles || [];

          // Redirect حسب permission أو role
          if (this.isExactScanner(permissions)) {
            this.router.navigate(['/scanner'], { replaceUrl: true });
          } else {
            this.router.navigate(['/default'], { replaceUrl: true });
          }

          // Notifying components about user state
          this.configService.notifyUserStateChange();

          this.isLoading = false;
        } else {
          this.showErrorMsg = true;
          this.isLoading = false;
        }
      },
      (error) => {
        this.showErrorMsg = true;
        this.isLoading = false;
        this.toast.error('Login failed. Please try again.', 'Error');
      }
    );
  }
}
