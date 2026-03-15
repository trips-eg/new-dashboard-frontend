import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [RouterModule],
  styles: [
    `
      .btn-orange {
        background-color: #f79530;
        color: white;
        border: none;
        display: block;
        width: 200px;
        margin: 0 auto;
        transition: background-color 0.3s ease;
      }

      .btn-orange:hover {
        background-color: #e27a17;
        color: white;
      }
    `
  ],
  template: `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div class="p-4 rounded-4 bg-white shadow text-center" style="max-width: 700px; width: 90%;">
        <h1 class="fw-bold text-dark display-5 mb-2">Access Denied</h1>
        <p class="text-secondary mb-4">You do not have the necessary permissions. Please contact admins.</p>
        <img
          src="https://primefaces.org/cdn/templates/sakai/auth/asset-access.svg"
          alt="Access denied"
          class="img-fluid mb-4"
          style="max-width: 100%;"
        />

        <!-- الزرار البرتقالي مع هوفر -->
        <a routerLink="/default" class="btn btn-orange px-4 py-2">Go to Dashboard</a>
      </div>
    </div>
  `
})
export class Access {}
