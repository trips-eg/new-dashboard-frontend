import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
// import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

import { Irooms } from 'src/app/shared/model/irooms';
import { RoomService } from 'src/app/shared/services/room.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [SharedModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  rooms: Irooms[] = [];
  searchTerm: string = '';
  // first = 0;
  // rows = 10;
  @Input() CompanyId: any;
  @Input() companyId: any;
  loading: boolean = false;

  // filter: FilterMap = {};

  totalRecords: number = 0;
  constructor(
    private RoomService: RoomService,
    private router: Router,
    private _MessageService: MessageService,
    private ConfirmationService: ConfirmationService,
    private translate: TranslateService,
    private ConfigureService: ConfigureService,
    private toaster: ToastrService
  ) {}
  ngOnInit(): void {
    // Initial load handled by p-table lazy load
  }

  goToCompany(companyId: number) {
    this.router.navigate(['/vendor-details', companyId]);
  }

  toggleBlockStatus(id) {
    this.RoomService.toggleBlock(id).subscribe({
      next: () => {
        this.toaster.success(this.translate.instant('room block status changed successfully'));
      },
      error: (err) => {
        this.toaster.error(this.translate.instant('error in update room block status'));
        this.dt?.reset(); // Refresh table
      }
    });
  }
  onSearch() {
    this.dt?.reset();
  }

  loadRooms(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload: any = TableRequestBuilder.build(event, this.searchTerm);

    if (this.CompanyId || this.companyId) {
      payload.companyId = this.companyId || this.CompanyId;
    }

    this.RoomService.getAllRooms(payload).subscribe({
      next: (res) => {
        if (res?.success && res.data?.data) {
          this.rooms = res.data.data.map((room: Irooms) => ({
            ...room,
            actions: this.getRoomActions(room)
          }));
          this.totalRecords = res.data.itemsCount;
        } else {
          this.rooms = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching rooms', err);
        this.rooms = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  // Deprecated usage kept for reference or removed?
  // gettingAllRooms removal

  //////////////////////////////////////////
  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  isAdmin(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Admin') || role.startsWith('SuperAdmin'));
  }
  getRoomActions(room: any): MenuItem[] {
    const allActions: (MenuItem & { roles: string[] })[] = [
      {
        label: this.translate.instant('Images'),
        icon: 'pi pi-plus',
        roles: ['Vendor', 'Admin'], // مين يقدر يشوفه
        command: () => {
          this.router.navigate(['/room-form-imgs', room.id]);
        }
      },
      {
        label: this.translate.instant('Edit Room'),
        icon: 'pi pi-pencil',
        roles: ['Vendor', 'Admin'],
        command: () => {
          this.router.navigate(['/room-form', room.id]);
        }
      },
      {
        label: this.translate.instant('roomDetails'),
        icon: 'pi pi-info-circle',
        roles: ['Vendor', 'Admin'],
        command: () => {
          this.router.navigate(['/room-details-last-step', room.id]);
        }
      },
      {
        label: this.translate.instant('delete'),
        icon: 'pi pi-trash',
        roles: ['Vendor', 'Admin'],
        command: () => {
          this.confirmDelete(room.id);
        }
      }
    ];

    // نجيب الـ roles بتاعة اليوزر
    const roles = this.ConfigureService.userRoles();
    const isVendor = roles.some((r) => r.startsWith('Vendor.'));
    const isAdmin = roles.some((r) => r.startsWith('Admin.'));

    // فلترة حسب الدور
    return allActions.filter((action) => {
      if (isVendor && action.roles.includes('Vendor')) return true;
      if (isAdmin && action.roles.includes('Admin')) return true;
      return false;
    });
  }

  confirmDelete(roomId: any) {
    this.ConfirmationService.confirm({
      message: this.translate.instant('confirmDeleteRoom'),
      header: this.translate.instant('confirmation'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: () => {
        this.deleteRoom(roomId);
      }
    });
  }

  deleteRoom(roomId: any) {
    this.RoomService.deleteRoom(roomId).subscribe({
      next: () => {
        this._MessageService.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant('deleteRoomSuccess')
        });
        this.dt?.reset();
      },
      error: (error) => {
        this._MessageService.add({
          severity: 'error',
          summary: this.translate.instant('error'),
          detail: this.translate.instant('deleteRoomError')
        });
      }
    });
  }
}
