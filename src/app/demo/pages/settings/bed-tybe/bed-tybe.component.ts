import { Component, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BedTybeFormComponent } from './bed-tybe-form/bed-tybe-form.component';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { BedTybeListComponent } from './bed-tybe-list/bed-tybe-list.component';

@Component({
  selector: 'app-bed-tybe',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, BedTybeListComponent],
  providers: [DialogService, MessageService],
  templateUrl: './bed-tybe.component.html',
  styleUrl: './bed-tybe.component.scss'
})
export class BedTybeComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(BedTybeListComponent) bedTybeListComponent!: BedTybeListComponent;
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {}
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToBedTybeForm();
        break;
    }
  }

  goToBedTybeForm() {
    console.log('goToBedForm');
    this.ref = this.dialogService.open(BedTybeFormComponent, {
      header: this.translate.instant('bed tybe'),
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
        this.bedTybeListComponent.refresh();
        this.ToastrService.success('Bed Type Created Successfully', 'Success');
      }
    });
  }
}
