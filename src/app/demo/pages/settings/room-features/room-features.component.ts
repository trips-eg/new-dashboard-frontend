import { Component, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { RoomFeaturesListComponent } from './room-features-list/room-features-list.component';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { RoomFeaturesFormComponent } from './room-features-form/room-features-form.component';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-room-features',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, RoomFeaturesListComponent],
  providers: [DialogService, MessageService],
  templateUrl: './room-features.component.html',
  styleUrl: './room-features.component.scss'
})
export class RoomFeaturesComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(RoomFeaturesListComponent) roomFeaturesListComponent!: RoomFeaturesListComponent;
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {}
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToRoomFeatureForm();
        break;
    }
  }
  goToRoomFeatureForm() {
    console.log('goToroomFeatureForm');
    this.ref = this.dialogService.open(RoomFeaturesFormComponent, {
      header: this.translate.instant('Room Feature'),
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
        this.roomFeaturesListComponent.ngOnInit();
        this.ToastrService.success('Room Feature Added Successfully', 'Success');
      }
    });
  }
}
