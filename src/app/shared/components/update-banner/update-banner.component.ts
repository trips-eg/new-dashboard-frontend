import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-update-banner',
  template: `
    <div class="update-banner-container" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <div class="banner-content">
        <div class="banner-icon icon-pulse">
          <i class="pi pi-cloud-download"></i>
        </div>
        <div class="banner-text">
          <h4 class="banner-title">{{ 'Update Available' | translate }}</h4>
          <p class="banner-desc">
            {{ currentLang === 'ar' 
              ? 'يتوفر إصدار جديد من التطبيق مع تحسينات جديدة وميزات متطورة. يرجى التحديث الآن للحصول على أفضل تجربة.' 
              : 'A new version of the application is available with improvements and new features. Please update now for the best experience.' }}
          </p>
        </div>
      </div>
      <div class="banner-actions">
        <button class="btn-update" (click)="accept()">
          <i class="pi pi-refresh me-1"></i>
          {{ currentLang === 'ar' ? 'تحديث الآن' : 'Update Now' }}
        </button>
        <button class="btn-later" (click)="reject()">
          {{ currentLang === 'ar' ? 'لاحقاً' : 'Later' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .update-banner-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 16px 28px;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.9);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
    .banner-content {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-grow: 1;
    }
    .banner-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      background: rgba(25, 118, 210, 0.12);
      color: #1976d2;
      border-radius: 50%;
      font-size: 22px;
      flex-shrink: 0;
    }
    .icon-pulse {
      animation: pulse 2.2s infinite;
    }
    .banner-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .banner-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    .banner-desc {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }
    .banner-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .btn-update {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 11px 22px;
      background: #1976d2;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(25, 118, 210, 0.2);
    }
    .btn-update:hover {
      background: #1565c0;
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(25, 118, 210, 0.3);
    }
    .btn-later {
      padding: 11px 18px;
      background: transparent;
      color: #64748b;
      border: none;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-later:hover {
      background: rgba(226, 232, 240, 0.6);
      color: #334155;
    }
    @keyframes pulse {
      0% {
        transform: scale(0.96);
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.45);
      }
      70% {
        transform: scale(1.02);
        box-shadow: 0 0 0 12px rgba(25, 118, 210, 0);
      }
      100% {
        transform: scale(0.96);
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
      }
    }
    @media (max-width: 768px) {
      .update-banner-container {
        flex-direction: column;
        align-items: stretch;
        padding: 20px;
        gap: 16px;
      }
      .banner-actions {
        justify-content: flex-end;
      }
    }
  `]
})
export class UpdateBannerComponent implements OnInit {
  currentLang: string;

  constructor(
    public ref: DynamicDialogRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || 'en';
  }

  accept(): void {
    this.ref.close(true);
  }

  reject(): void {
    this.ref.close(false);
  }
}
