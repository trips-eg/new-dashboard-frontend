import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { UseriesService } from 'src/app/shared/services/useries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit {
  userId: string = '';
  user: any = {};
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private UseriesService: UseriesService
  ) {}

  ngOnInit(): void {
    this.fetchParams();
  }
  fetchParams() {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId) {
        this.getUserById(this.userId);
      }
    });
  }
  getUserById(id: string) {
    this.UseriesService.getUserById(id).subscribe({
      next: (res) => {
        this.user = res.data;
        console.log('User fetched successfully:', this.user);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'edit':
        this.editUser(this.userId);
        break;
    }
  }
  editUser(id) {
    this.router.navigate(['/user-form', id]);
  }
}
