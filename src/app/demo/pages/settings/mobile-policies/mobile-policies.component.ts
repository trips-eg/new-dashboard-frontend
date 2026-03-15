import { Component } from '@angular/core';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PolicyFormComponent } from "./policy-form/policy-form.component";

@Component({
  selector: 'app-mobile-policies',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, PolicyFormComponent],
  templateUrl: './mobile-policies.component.html',
  styleUrl: './mobile-policies.component.scss'
})
export class MobilePoliciesComponent {

}
