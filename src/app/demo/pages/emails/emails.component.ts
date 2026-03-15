import { Component } from '@angular/core';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { EmailListComponent } from "./email-list/email-list.component";

@Component({
  selector: 'app-emails',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, EmailListComponent],
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss'
})
export class EmailsComponent {

}
