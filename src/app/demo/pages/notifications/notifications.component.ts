import { Component, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Router } from '@angular/router';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotificationsFormComponent } from './notifications-form/notifications-form.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, NotificationsListComponent],
  providers: [DialogService],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(NotificationsListComponent) notificationsList!: NotificationsListComponent;

  constructor(
    private router: Router,
    public dialogService: DialogService
  ) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToNotificationForm();
        break;
    }
  }

  goToNotificationForm() {
    this.ref = this.dialogService.open(NotificationsFormComponent, {
      header: 'Send Notification',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true
    });

    this.ref.onClose.subscribe((res) => {
      if (res) {
        this.notificationsList.loadNotifications({
          first: 0,
          rows: this.notificationsList.dt.rows,
          sortField: 'id',
          sortOrder: 1
        });
      }
    });
  }
}
