import { Component } from '@angular/core';
import { SubHeaderComponent } from '../../../shared/components/sub-header/sub-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelsListComponent } from './hotels-list/hotels-list.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [SubHeaderComponent, HotelsListComponent, SharedModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss'
})
export class HotelsComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToVendorForm();
        break;
    }
  }

  goToVendorForm() {
    console.log('goToVendorForm');
    this.router.navigate(['/hotels-form']);
  }
}
