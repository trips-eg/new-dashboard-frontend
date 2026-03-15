import { Component, EventEmitter, inject } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Router } from '@angular/router';
import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [SubHeaderComponent, VendorsListComponent, SharedModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent {
  router = inject(Router);

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToVendorForm();
        break;
    }
  }

  goToVendorForm() {
    console.log('goToVendorForm');
    this.router.navigate(['vendors-add-edit']);
  }
}
