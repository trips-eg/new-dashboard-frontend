import { Component } from '@angular/core';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SalesAgenciesListComponent } from "./sales-agencies-list/sales-agencies-list.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-agencies',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, SalesAgenciesListComponent],
  templateUrl: './sales-agencies.component.html',
  styleUrl: './sales-agencies.component.scss'
})
export class SalesAgenciesComponent {
  constructor(private Router:Router){}
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToSalesAganciesForm();
        break;
    }
  }
  goToSalesAganciesForm(){
    this.Router.navigate(['/Sales-Agencies-form'])
  }
}
