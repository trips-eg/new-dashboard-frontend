import { Component } from '@angular/core';
import { ManasikType } from 'src/app/shared/Enums/manasikType';
import { ManasikComponent } from "src/app/shared/manasik/manasik.component";

@Component({
  selector: 'app-ummrah',
  standalone: true,
  imports: [ManasikComponent],
  templateUrl: './ummrah.component.html',
  styleUrl: './ummrah.component.scss'
})
export class UmmrahComponent {
    type: ManasikType = ManasikType.Umrah;


}
