import { Component } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { MobSideBarListComponent } from './mob-side-bar-list/mob-side-bar-list.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-mob-side-bar',
  standalone: true,
  imports: [SubHeaderComponent, MobSideBarListComponent],
  templateUrl: './mob-side-bar.component.html',
  styleUrl: './mob-side-bar.component.scss'
})
export class MobSideBarComponent {
  constructor(private router: Router) {}
  handleAction(actionevent: { action: string }) {
    if (actionevent.action === 'add') {
      this.router.navigate(['/mobile-sidebar-form']);
    }
  }
}
