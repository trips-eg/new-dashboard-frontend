import { Component } from '@angular/core';
import { SubHeaderComponent } from "../../../../shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  imports: [SubHeaderComponent,SharedModule],
  templateUrl: './customers-form.component.html',
  styleUrl: './customers-form.component.scss'
})
export class CustomersFormComponent {
  customerId:number | null = 5;

  constructor(private route :ActivatedRoute, private router: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {

      this.customerId = params['id'];


    });
  }
}
