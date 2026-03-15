import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { EmailsService } from 'src/app/shared/services/emails.service';
import { Daum } from 'src/app/shared/model/iemails';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmailPreviewDialogComponent } from '../email-preview-dialog/email-preview-dialog.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService],
  templateUrl: './email-list.component.html',
  styleUrl: './email-list.component.scss'
})
export class EmailListComponent implements OnInit {
  @Input() userId?: number; // Optional userId filter for customer details page
  @Input() showSearch: boolean = true; // Show/hide search bar
  @ViewChild('dt') dt: Table;

  emails: Daum[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  searchTerm: string = '';
  ref: DynamicDialogRef | undefined;

  constructor(
    private emailsService: EmailsService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {}

  loadEmails(event: TableLazyLoadEvent): void {
    this.loading = true;
    const payload: any = TableRequestBuilder.build(event, this.searchTerm);

    if (this.userId) {
      payload.UserId = this.userId;
    }

    this.emailsService.getAllEmails(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.emails = response.data.data;
          this.totalRecords = response.data.itemsCount;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching emails:', error);
        this.loading = false;
      }
    });
  }

  onSearch(event?: any): void {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  showEmailPreview(email: Daum): void {
    this.ref = this.dialogService.open(EmailPreviewDialogComponent, {
      header: 'Email Preview',
      width: '70%',
      height: '85vh',
      contentStyle: { overflow: 'auto', padding: '0' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        name: email.name,
        email: email.email,
        purpose: email.purpose,
        purposeName: this.getPurposeName(email.purpose),
        template: email.template,
        handlebars: email.handlebars
      }
    });
  }

  viewEmailDetails(emailId: number): void {
    this.router.navigate(['/email-details', emailId]);
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
}
