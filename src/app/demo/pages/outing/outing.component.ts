import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { OutingListComponent } from "./outing-list/outing-list.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-outing',
  standalone: true,
  imports: [SubHeaderComponent, OutingListComponent , SharedModule],
  providers: [ConfirmationService],
  templateUrl: './outing.component.html',
  styleUrl: './outing.component.scss'
})
export class OutingComponent {
  constructor(
    private router: Router,
    private ConfigureService: ConfigureService
  ) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToTravelForm();
        break;
    }
  }
  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
  goToTravelForm() {
    console.log('work form ....');
    this.router.navigate(['/outing-form']);
  }
}
