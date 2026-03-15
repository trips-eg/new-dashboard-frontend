import { Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { Router } from '@angular/router';
import { AdvertisingsListComponent } from "./advertisings-list/advertisings-list.component";

@Component({
  selector: 'app-advertisings',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, AdvertisingsListComponent],
  templateUrl: './advertisings.component.html',
  styleUrl: './advertisings.component.scss'
})
export class AdvertisingsComponent {
   router= inject(Router)
 handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToVendorForm();
        break;
    }
  }

  goToVendorForm() {
    console.log('goToVendorForm');
    this.router.navigate(['/advertisings-form']);
  }
}
