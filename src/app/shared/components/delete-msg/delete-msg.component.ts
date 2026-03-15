import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-delete-msg',
  standalone: true,
  imports: [SharedModule,TranslateModule],
  templateUrl: './delete-msg.component.html',
  styleUrl: './delete-msg.component.scss'
})
export class DeleteMsgComponent {
  constructor(public ref: DynamicDialogRef) {}

  ngOnInit() {

  }

  save() {
    this.ref.close('Yes');
  }

  cancel() {
    this.ref.close('No');
  }
}
