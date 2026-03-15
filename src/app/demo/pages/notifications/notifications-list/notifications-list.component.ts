import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { INotification } from 'src/app/shared/model/inotification';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { NotificationsFormComponent } from '../notifications-form/notifications-form.component';
import { NotificationDetailsComponent } from '../notification-details/notification-details.component';
import { ToastrService } from 'ngx-toastr';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, ButtonModule, RouterModule, ConfirmDialogModule, SharedModule],
  providers: [ConfirmationService, DialogService],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.scss'
})
export class NotificationsListComponent {
  @ViewChild('dt') dt: Table;
  notifications: INotification[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private notificationsService: NotificationsService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private toastService: ToastrService
  ) {}

  loadNotifications(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.notificationsService.getAllNotifications(payload).subscribe({
      next: (res: any) => {
        if (res.data && Array.isArray(res.data)) {
          // Structure: { data: [], itemsCount: number }
          this.notifications = res.data;
          this.totalRecords = res.itemsCount;
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          // Structure: { data: { data: [], itemsCount: number }, ... }
          this.notifications = res.data.data;
          this.totalRecords = res.data.itemsCount;
        } else {
          this.notifications = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  refresh() {
    this.dt.reset();
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  navigateToCustomer(userId: number) {
    if (userId) {
      this.router.navigate(['/customer-details', userId]);
    }
  }

  deleteConfirm(notification: INotification) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this notification?',
      header: 'Delete Notification',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger m-2',
      rejectButtonStyleClass: 'p-button-secondary m-2',
      accept: () => {
        this.deleteNotification(notification.id);
      }
    });
  }

  deleteNotification(id: number) {
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => {
        this.toastService.success('Notification deleted successfully');
        this.refresh();
      },
      error: () => {
        this.toastService.error('Notification deleted failed');
      }
    });
  }

  edit(notification: INotification) {
    const ref = this.dialogService.open(NotificationsFormComponent, {
      header: 'Edit Notification',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: notification
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.refresh();
      }
    });
  }

  view(notification: INotification) {
    this.dialogService.open(NotificationDetailsComponent, {
      header: 'Notification Details',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: notification
    });
  }
}
