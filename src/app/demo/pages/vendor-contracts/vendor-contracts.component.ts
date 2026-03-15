import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { VendorContractsListComponent } from "./vendor-contracts-list/vendor-contracts-list.component";

@Component({
  selector: 'app-vendor-contracts',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, VendorContractsListComponent],
  templateUrl: './vendor-contracts.component.html',
  styleUrl: './vendor-contracts.component.scss'
})
export class VendorContractsComponent {

}
