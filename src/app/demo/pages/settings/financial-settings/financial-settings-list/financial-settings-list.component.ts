import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FinancialService } from 'src/app/shared/services/financial.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-financial-settings-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './financial-settings-list.component.html',
  styleUrl: './financial-settings-list.component.scss'
})
export class FinancialSettingsListComponent implements OnInit {
  financialSettingsList: any[] = [];
  clonedRows: { [s: string]: any } = {};

  constructor(
    private financialService: FinancialService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.financialService.getAllFinancialSettings().subscribe({
      next: (res) => {
        this.financialSettingsList = res.data;
      }
    });
  }

  onRowEditInit(product: any) {
    this.clonedRows[product.id] = { ...product };
  }

  onRowEditSave(product: any) {
    const payload = {
      id: product.id,
      value: product.value
    };

    this.financialService.updateFinancialSetting([payload]).subscribe({
      next: (res) => {
        delete this.clonedRows[product.id];
        console.log('Value updated successfully');
        this.ToastrService.success(res.message, 'success');
      },
      error: (err) => {
        this.ToastrService.error('Update failed', 'faild');

        this.onRowEditCancel(product, this.financialSettingsList.indexOf(product));
      }
    });
  }

  onRowEditCancel(product: any, index: number) {
    this.financialSettingsList[index] = this.clonedRows[product.id];
    delete this.clonedRows[product.id];
  }
}
