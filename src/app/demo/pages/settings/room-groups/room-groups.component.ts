import { Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { RoomGroupListComponent } from './room-group-list/room-group-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-groups',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, RoomGroupListComponent],
  templateUrl: './room-groups.component.html',
  styleUrl: './room-groups.component.scss'
})
export class RoomGroupsComponent {
  router = inject(Router);

  handleAction(event: { action: string }) {
    console.log('action.....', event);
    switch (event.action) {
      case 'add':
        this.goToroomGroupsForm();
        break;
    }
  }

  goToroomGroupsForm() {
    this.router.navigate(['/room-groups-form']);
  }
}
