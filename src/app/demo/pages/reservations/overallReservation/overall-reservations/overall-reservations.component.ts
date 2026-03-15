import { Component } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-overall-reservations',
  standalone: true,
  imports: [SharedModule,SubHeaderComponent],
  templateUrl: './overall-reservations.component.html',
  styleUrl: './overall-reservations.component.scss'
})
export class OverallReservationsComponent {
  lang:string
  searchedWord:string
  constructor(){

  }
  searchByName(key){

  }

}
