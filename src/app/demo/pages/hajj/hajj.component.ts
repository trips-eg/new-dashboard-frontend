import { Component } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OutingListComponent } from '../outing/outing-list/outing-list.component';
import { Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { HajjListComponent } from './hajj-list/hajj-list.component';
import { ManasikComponent } from 'src/app/shared/manasik/manasik.component';
import { ManasikType } from 'src/app/shared/Enums/manasikType';

@Component({
  selector: 'app-hajj',
  standalone: true,
  imports: [ManasikComponent],
  templateUrl: './hajj.component.html',
  styleUrl: './hajj.component.scss'
})
export class HajjComponent {
  type: ManasikType = ManasikType.Hajj;
}
