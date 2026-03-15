import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-email-preview-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './email-preview-dialog.component.html',
  styleUrl: './email-preview-dialog.component.scss'
})
export class EmailPreviewDialogComponent implements OnDestroy {
  emailData: any;
  emailBlobUrl: SafeResourceUrl | null = null;
  private blobUrl: string | null = null;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizer: DomSanitizer
  ) {
    this.emailData = this.config.data;
    if (this.emailData?.handlebars) {
      // Create a blob URL for the HTML content
      const blob = new Blob([this.emailData.handlebars], { type: 'text/html' });
      this.blobUrl = URL.createObjectURL(blob);
      this.emailBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
    }
  }

  close() {
    this.ref.close();
  }

  ngOnDestroy() {
    // Clean up the blob URL when component is destroyed
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
  }
}
