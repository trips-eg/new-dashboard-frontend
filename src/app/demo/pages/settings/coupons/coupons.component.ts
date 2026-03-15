import { Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CouponsListComponent } from './coupons-list/coupons-list.component';
import { Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, CouponsListComponent],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss'
})
export class CouponsComponent {
  Router = inject(Router);

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToCouponsForm();
        break;
    }
  }

  goToCouponsForm() {
    this.Router.navigate(['/add-coupon']);
  }
}
