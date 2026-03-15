import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { EmailsService } from 'src/app/shared/services/emails.service';
import { EmailDetail } from 'src/app/shared/model/iemail-detail';
import { EmailTracker } from 'src/app/shared/model/iemails-trackers';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { EmailPreviewDialogComponent } from '../email-preview-dialog/email-preview-dialog.component';

@Component({
  selector: 'app-email-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  providers: [DialogService, ConfirmationService],
  templateUrl: './email-details.component.html',
  styleUrl: './email-details.component.scss'
})
export class EmailDetailsComponent implements OnInit, OnDestroy {
  emailId!: number;
  emailDetail: EmailDetail | null = null;
  trackers: EmailTracker[] = [];
  loading: boolean = false;
  trackersLoading: boolean = false;
  emailBlobUrl: SafeResourceUrl | null = null;
  private blobUrl: string | null = null;
  ref: DynamicDialogRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emailsService: EmailsService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.emailId = +this.route.snapshot.paramMap.get('id')!;
    this.loadEmailDetail();
    this.loadTrackers();
  }

  loadEmailDetail(): void {
    this.loading = true;
    this.emailsService.GetSendEmailLogByIdAsync(this.emailId).subscribe({
      next: (response) => {
        if (response.success) {
          this.emailDetail = response.data;
          // Create blob URL for email content
          if (this.emailDetail?.handlebars || this.emailDetail?.context) {
            const htmlContent = this.emailDetail.handlebars || this.emailDetail.context;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            this.blobUrl = URL.createObjectURL(blob);
            this.emailBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading email details:', error);
        this.toastr.error('Failed to load email details');
        this.loading = false;
      }
    });
  }

  loadTrackers(): void {
    this.trackersLoading = true;
    const filter: FilterMap = {
      LogId: this.emailId,
      pageIndex: 1,
      pageSize: 100
    };

    this.emailsService.getAllEmailsTrackers(filter).subscribe({
      next: (response) => {
        if (response.success) {
          this.trackers = response.data.data;
        }
        this.trackersLoading = false;
      },
      error: (error) => {
        console.error('Error loading trackers:', error);
        this.toastr.error('Failed to load tracking history');
        this.trackersLoading = false;
      }
    });
  }

  getStatusText(tracker: EmailTracker): string {
    if (tracker.isSend) return 'Sent';
    if (tracker.isExpired) return 'Expired';
    return 'Failed';
  }

  getStatusSeverity(tracker: EmailTracker): 'success' | 'warning' | 'danger' {
    if (tracker.isSend) return 'success';
    if (tracker.isExpired) return 'warning';
    return 'danger';
  }

  getStatusIcon(tracker: EmailTracker): string {
    if (tracker.isSend) return 'pi pi-check-circle';
    if (tracker.isExpired) return 'pi pi-exclamation-triangle';
    return 'pi pi-times-circle';
  }

  getStatusClass(tracker: EmailTracker): string {
    if (tracker.isSend) return 'status-success';
    if (tracker.isExpired) return 'status-warning';
    return 'status-danger';
  }

  getPurposeName(purpose: number): string {
    const purposes: { [key: number]: string } = {
      0: 'invalid',
      1: 'registration',
      2: 'forgot_password',
      3: 'promotion',
      4: 'reservation_email'
    };
    return purposes[purpose] || 'unknown';
  }

  getPurposeSeverity(purpose: number): 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    const severities: { [key: number]: 'success' | 'warning' | 'info' | 'danger' | 'secondary' } = {
      0: 'danger', // Invalid
      1: 'success', // Registration
      2: 'warning', // Forgot Password
      3: 'info', // Promotion
      4: 'secondary' // Reservation
    };
    return severities[purpose] || 'info';
  }

  viewSnapshot(tracker: EmailTracker): void {
    this.ref = this.dialogService.open(EmailPreviewDialogComponent, {
      header: 'Tracker Snapshot',
      width: '70%',
      height: '85vh',
      contentStyle: { overflow: 'auto', padding: '0' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        name: `Tracker #${tracker.id}`,
        email: tracker.toEmail,
        purpose: tracker.purpose,
        purposeName: this.getPurposeName(tracker.purpose),
        handlebars: tracker.context
      }
    });
  }

  resendEmail(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to resend this email?',
      header: 'Confirm Resend',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-success m-2',
      rejectButtonStyleClass: 'p-button-danger m-2',
      accept: () => {
        this.emailsService.sendEmail(this.emailId).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastr.success('Email resent successfully!');
              // Reload email details and trackers to update status
              this.loadEmailDetail();
              this.loadTrackers();
            } else {
              this.toastr.error('Failed to resend email');
            }
          },
          error: (error) => {
            console.error('Error resending email:', error);
            this.toastr.error('Failed to resend email');
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/emails']);
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
  }
}
