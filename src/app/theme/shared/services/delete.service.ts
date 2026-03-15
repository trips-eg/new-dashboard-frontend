import { Injectable } from '@angular/core';
import { DeleteMsgComponent } from '../components/delete-msg/delete-msg.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DeleteService {
    headerTopic="Delete"

  constructor(private dialogService: DialogService , private _translate:TranslateService) { }

  openConfirmDialog(){
   return this.dialogService.open(DeleteMsgComponent,{
      header: this._translate.instant(this.headerTopic),
      width: '40%',
     height:'50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,


  })

  }
}
