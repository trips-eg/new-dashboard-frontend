import { Component, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { HajjCategoryListComponent } from './hajj-category-list/hajj-category-list.component';
import { HajjCategoryFormComponent } from './hajj-category-form/hajj-category-form.component';

@Component({
  selector: 'app-hajj-category',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, HajjCategoryListComponent],
  providers: [ConfirmationService, DialogService],
  templateUrl: './hajj-category.component.html',
  styleUrl: './hajj-category.component.scss'
})
export class HajjCategoryComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(HajjCategoryListComponent) hajjCategoryListComponent: HajjCategoryListComponent | undefined;

  constructor(
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}

  handleAction(event: { action: string }) {
    if (event.action === 'add') {
      this.openForm();
    }
  }

  openForm() {
    this.ref = this.dialogService.open(HajjCategoryFormComponent, {
      header: this.translate.instant('add hajj category'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.hajjCategoryListComponent?.refresh();
      }
    });
  }
}
