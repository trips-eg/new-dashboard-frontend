import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { INotification } from 'src/app/shared/model/inotification';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-notification-details',
  standalone: true,
  imports: [CommonModule, SharedModule, ButtonModule],
  templateUrl: './notification-details.component.html',
  styleUrl: './notification-details.component.scss'
})
export class NotificationDetailsComponent {
  notification: INotification | undefined;
  baseUrl: string = environment.imgUrl;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    if (this.config.data) {
      this.notification = this.config.data;
    }
  }

  close() {
    this.ref.close();
  }
}
