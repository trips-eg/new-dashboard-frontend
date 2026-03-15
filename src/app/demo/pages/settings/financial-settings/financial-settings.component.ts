import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { FinancialSettingsListComponent } from "./financial-settings-list/financial-settings-list.component";

@Component({
  selector: 'app-financial-settings',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, FinancialSettingsListComponent],
  templateUrl: './financial-settings.component.html',
  styleUrl: './financial-settings.component.scss'
})
export class FinancialSettingsComponent {

}
