import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../shared/components/sub-header/sub-header.component';
import { TravelsListComponent } from './travels-list/travels-list.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, TravelsListComponent],
  templateUrl: './travels.component.html',
  styleUrl: './travels.component.scss'
})
export class TravelsComponent {
  constructor(private router: Router , private ConfigureService:ConfigureService) {}

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
    console.log('work travels form ....');
    this.router.navigate(['/travel-form']);
  }
}
