import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BedTybeFormComponent } from '../bed-tybe/bed-tybe-form/bed-tybe-form.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoomTybiesFormComponent } from './room-tybies-form/room-tybies-form.component';
import { RoomTybiesListComponent } from './room-tybies-list/room-tybies-list.component';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-room-tybe',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, RoomTybiesListComponent],
  providers: [DialogService, MessageService],
  templateUrl: './room-tybe.component.html',
  styleUrl: './room-tybe.component.scss'
})
export class RoomTybeComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(RoomTybiesListComponent) roomTybiesListComponent!: RoomTybiesListComponent;
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {}
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToRoomTybeForm();
        break;
    }
  }
  goToRoomTybeForm() {
    console.log('goToroomTybeForm');
    this.ref = this.dialogService.open(RoomTybiesFormComponent, {
      header: this.translate.instant('room tybe'),
      width: '50vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.roomTybiesListComponent.ngOnInit();
        this.ToastrService.success('Room Tybe Added Successfully', 'Success');
      }
    });
  }
}
