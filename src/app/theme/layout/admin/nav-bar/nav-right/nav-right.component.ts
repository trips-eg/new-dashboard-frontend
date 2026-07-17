// Angular import
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';

import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit, OnDestroy {
  currentLang: string;
  username: string;
  userID: string;
  userEmail: string;
  userRole: string[];
  notificationsList: any;
  selectedNotification: any;
  unreadCount: number;
  vendorId
  private userStateSubscription: Subscription;

  constructor(
    private translationService: TranslateService,
    private _configSer: ConfigureService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private swUpdate: SwUpdate,
    private toastr: ToastrService
  ) {
    this.currentLang = this.translationService.getDefaultLang();
    this.refreshUserData();

    // Subscribe to user state changes
    this.userStateSubscription = this._configSer.userState$.subscribe(() => {
      this.refreshUserData();
    });
  }

  ngOnInit(): void {
    // Refresh user data on component initialization
    this.refreshUserData();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.userStateSubscription) {
      this.userStateSubscription.unsubscribe();
    }
  }

  // Method to refresh user data - call this when user state changes
  refreshUserData() {
    this.username = this._configSer.UserName();
    this.userID = this._configSer.UserId();
    this.vendorId = this._configSer.vendorId();
    this.userEmail = this._configSer.UserEmail();
    this.userRole = this._configSer.userRoles();
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    localStorage.setItem('Language', this.currentLang);
    this.translationService.use(this.currentLang);
    // Update the direction
    const dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = this.currentLang;
    this.document.documentElement.dir = dir;
  }

  logout() {
    // Use the ConfigureService logout method which handles notifications
    this._configSer.Logout();
  }

//is vendor or admin //
 isVendor(): boolean {
    const roles = this._configSer.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.toastr.info(
        this.currentLang === 'ar' ? 'جاري التحقق من وجود تحديثات...' : 'Checking for updates...',
        '',
        { timeOut: 2000 }
      );
      this.swUpdate.checkForUpdate().then(hasUpdate => {
        if (!hasUpdate) {
          this.toastr.success(
            this.currentLang === 'ar' ? 'لوحة التحكم محدثة بالفعل إلى أحدث إصدار.' : 'The dashboard is already up to date.',
            '',
            { timeOut: 3000 }
          );
        } else {
          this.toastr.info(
            this.currentLang === 'ar' ? 'تم العثور على تحديث! جاري تنزيل الملفات...' : 'Update found! Downloading assets in the background...',
            '',
            { timeOut: 4000 }
          );
        }
      }).catch(err => {
        console.error('Check for updates failed:', err);
        this.toastr.error(
          this.currentLang === 'ar' ? 'فشل التحقق من التحديثات.' : 'Failed to check for updates.',
          '',
          { timeOut: 3000 }
        );
      });
    } else {
      this.toastr.warning(
        this.currentLang === 'ar' ? 'التحقق من التحديثات غير متاح في بيئة التطوير.' : 'Update check is not available in development mode.',
        '',
        { timeOut: 3000 }
      );
    }
  }

}
