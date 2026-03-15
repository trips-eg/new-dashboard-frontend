import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';
import { BranchesListComponent } from './branches-list/branches-list.component';
import { BranchesFormComponent } from './branches-form/branches-form.component';

@Component({
  selector: 'app-outing-branches',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, BranchesListComponent],
  providers: [ConfirmationService, DialogService],
  templateUrl: './outing-branches.component.html',
  styleUrl: './outing-branches.component.scss'
})
export class OutingBranchesComponent {
  constructor(
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}

  ref: DynamicDialogRef | undefined;
  @ViewChild(BranchesListComponent) branchesListComponent: BranchesListComponent | undefined;

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToBranchesForm();
        break;
    }
  }

  goToBranchesForm() {
    this.ref = this.dialogService.open(BranchesFormComponent, {
      header: this.translate.instant('Add Branch'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.branchesListComponent?.refresh();
      }
    });
  }
}
