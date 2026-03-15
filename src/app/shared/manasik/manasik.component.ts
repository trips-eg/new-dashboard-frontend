import { Component, Input } from '@angular/core';
import { ManasikType } from '../Enums/manasikType';
import { Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SubHeaderComponent } from '../components/sub-header/sub-header.component';
import { ManasikListComponent } from './manasik-list/manasik-list.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-manasik',
  standalone: true,
  imports: [SubHeaderComponent, ManasikListComponent, SharedModule],
  templateUrl: './manasik.component.html',
  styleUrl: './manasik.component.scss'
})
export class ManasikComponent {
  ManasikType = ManasikType;
  @Input() type!: ManasikType;

  actionButtons: any[] = [];

  constructor(
    private router: Router,
    private configureService: ConfigureService
  ) {}

  ngOnInit(): void {
    this.initActions();
  }

  // تعيين الأزرار بناءً على الـ type وroles
  initActions() {
    if (this.isVendor() || this.isAdmin()) {
      this.actionButtons = [{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }];
    }
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToForm();
        break;
      // ممكن تضيف هنا أي أكشنات ثانية لكل type
    }
  }

  goToForm() {
    this.router.navigate(['/manasik-form'], {
      queryParams: { type: this.type }
    });
  }

  isVendor(): boolean {
    const roles = this.configureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  isAdmin(): boolean {
    const roles = this.configureService.userRoles();
    return roles.some((role) => role.startsWith('Admin') || role.startsWith('SuperAdmin'));
  }
}
