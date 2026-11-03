import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  @ViewChild('usernameInput') usernameInput: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput: ElementRef<HTMLInputElement>;
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
    private configService: ConfigureService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
      // Ticked: stay signed in on this browser. Not ticked: the session ends when the browser closes.
      // The password itself is never saved.
      rememberMe: [true]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  get currentLang(): string {
    return this.translate.currentLang || 'en';
  }
  changeLanguage(): void {
    const lang = this.currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('Language', lang);
    this.translate.use(lang);
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
  private isExactScanner(permissions: string[]): boolean {
    const scannerPermissions = ['Permissions.Scanner.View', 'Permissions.Scanner.Edit'];

    return permissions.length === scannerPermissions.length && scannerPermissions.every((p) => permissions.includes(p));
  }

  onSubmit() {
    if (this.isLoading) return;
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      const firstInvalidInput = this.signInForm.controls['username'].invalid ? this.usernameInput : this.passwordInput;
      firstInvalidInput.nativeElement.focus();
      return;
    }

    this.isLoading = true;
    this.showErrorMsg = false;

    const { username, password, rememberMe } = this.signInForm.value;
    this._loginService.login({ username, password }).subscribe(
      (response: any) => {
        if (response.success) {
          // حفظ بيانات اليوزر في ConfigureService
          this.configService.setUser(response.data, !!rememberMe);

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
        this.toast.error(this.translate.instant('AUTH_UI.NETWORK_ERROR'), this.translate.instant('AUTH_UI.ERROR_TITLE'));
      }
    );
  }
}
