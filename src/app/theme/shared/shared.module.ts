// Angular Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// project import
import { CardComponent } from './components/card/card.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { NgScrollbarModule } from 'ngx-scrollbar';

// bootstrap import
import { NgbDropdownModule, NgbNavModule, NgbModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { PrimengModule } from 'src/app/shared/Modules/primeng/primeng.module';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { MessagesModule } from 'primeng/messages';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ColorPickerModule } from 'primeng/colorpicker';



@NgModule({
  declarations: [
    SpinnerComponent,
    TableComponent
  ],
  imports: [
  CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    BreadcrumbsComponent,
    NgbDropdownModule,
    NgbNavModule,
    NgbModule,
    NgbCollapseModule,
    NgScrollbarModule,
    PrimengModule,
    TranslateModule,
    NgxIntlTelInputModule ,
    MultiSelectModule,
    SplitButtonModule,
    TooltipModule ,
    InputNumberModule ,
    ContextMenuModule ,
    ColorPickerModule
    



  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    BreadcrumbsComponent,
    SpinnerComponent,
    NgbModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbCollapseModule,
    NgScrollbarModule,
    TableComponent,
    TranslateModule,
    PrimengModule,
    NgxIntlTelInputModule ,
    MultiSelectModule,
    SplitButtonModule,
    TooltipModule,
    InputNumberModule ,
    ContextMenuModule,
    ColorPickerModule



  ]
})
export class SharedModule {}
