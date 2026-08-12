import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UpdateBannerComponent } from './shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private swUpdate: SwUpdate,
    private toastr: ToastrService,
    private dialogService: DialogService
  ) {
    const currentLang = localStorage.getItem('Language') || 'en'; // Default to 'en'
    this.translate.use(currentLang);

    const activeLang = this.translate.currentLang;
    const dir = activeLang === 'ar' ? 'rtl' : 'ltr';

    this.document.documentElement.lang = activeLang;
    this.document.documentElement.dir = dir;
  }

  ngOnInit(): void {
    this.setupUpdateNotifications();
  }

  private setupUpdateNotifications(): void {
    //this.showUpdateDynamicDialog()
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
    ).subscribe(() => {
      this.showUpdateDynamicDialog();
    });
  }

  private showUpdateDynamicDialog(): void {
    const ref = this.dialogService.open(UpdateBannerComponent, {
      position: 'bottom',
      modal: false, // Non-blocking, lets user interact with page items/tabs
      showHeader: false, // Flat cookie-banner style
      styleClass: 'update-cookie-banner',
      contentStyle: { 'padding': '0', 'border-radius': '10px' },
      closable: false,
      closeOnEscape: false,
      dismissableMask: false
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result === true) {
        this.toastr.success(
          this.translate.currentLang === 'ar' ? 'جاري التحديث...' : 'Updating...', 
          '', 
          { timeOut: 1500 }
        );
        setTimeout(() => {
          this.swUpdate.activateUpdate().then(() => {
            this.document.location.reload();
          });
        }, 1500);
      }
    });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent): void {
    const token = localStorage.getItem('token');
    const currentUrl = this.router.url;

    // Prevent back to login if already authenticated
    if (currentUrl === '/default') {
      this.router.navigate(['/default'], { replaceUrl: true });
    }
  }
}
