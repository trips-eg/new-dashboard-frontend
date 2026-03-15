import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { Router } from '@angular/router';
import { RoomListComponent } from './room-list/room-list.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [SubHeaderComponent, RoomListComponent, SharedModule],
  providers: [ConfirmationService],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private ToastrService: ToastrService , 
    private ConfigureService:ConfigureService
  ) {}
  ngOnInit(): void {}
  handleAction(event) {
    switch (event.action) {
      case 'add':
        this.confirm1(event);
        break;
    }
  }

  addRoom() {
    this.router.navigate(['/room-form']);
  }
  addGroupOfRoom() {
    this.router.navigate(['/room-groups-form']);
  }

  confirm1(event: Event) {
    console.log(event);
    this.confirmationService.confirm({
      target: event.target as EventTarget,

      message: 'you want to add group or individual room ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'add individual room',
      acceptLabel: 'add group of rooms',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      closeOnEscape: true,
      dismissableMask: true,
      accept: () => {
        this.ToastrService.info('you can add group of rooms now');
        this.addGroupOfRoom();
      },
      reject: (type?: any) => {
        console.log('Reject type:', type); // هتشوف القيمة هنا

        if (type === 1) {
          this.addRoom();
          this.ToastrService.info('you can add individual room now');
        }
      }
    });
  }
  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
}
