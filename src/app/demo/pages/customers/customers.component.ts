import { Component } from '@angular/core';
import { SubHeaderComponent } from "../../../shared/components/sub-header/sub-header.component";
import { CustomersListComponent } from "./customers-list/customers-list.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [SubHeaderComponent, CustomersListComponent , SharedModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {

}
