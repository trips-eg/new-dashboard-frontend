  import { Component, EventEmitter, Input, Output } from '@angular/core';
  import { environment } from 'src/environments/environment';
  import { TranslateService } from '@ngx-translate/core';


  @Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss'
  })
  export class TableComponent {

    currentLang:string
  @Input()lazy;
    selectedRow: any;
    @Input() data: any[] = [];
    @Input() columns: any[] = [];
    @Input() dialogTitle: string = '';
    @Input() entityName: string = '';
    @Input() buttons: any[] = [];
    @Input() btnAction: any[] = [];
    @Input() currentPageReportTemplate: string;

    @Output() eventEmitters = new EventEmitter<{ action: string; payload: any }>();
    selectedItems: any[] = [];
    dialogVisible: boolean = false;
    currentItem: any = {};
    @Output() onPageChange = new EventEmitter<any>(); // New event to emit page change
    @Input() totalRecords :number; // Total records for pagination
    @Input() rows :any ; // Number of rows per page
    @Input() loading = false; // Loading state
    // StatusClassMapping=StatusClassMapping;
    imgUrl:string
    x = 2.3
    constructor(private translate: TranslateService) {

    }
    ngOnInit(): void {
          this.imgUrl = environment.imgUrl;


      this.currentLang = this.translate.currentLang || this.translate.defaultLang;

      // Subscribe to language changes (optional, if language can change dynamically)
      this.translate.onLangChange.subscribe((event) => {
        this.currentLang = event.lang;
      });
    }


    emitEvent(action: string, payload: any) {
      this.eventEmitters.emit({ action, payload });
    }
    isActionDisabled(item: any): boolean {
      const viewDetailsAction = this.btnAction.find(action => action.name === 'View Details');
      return viewDetailsAction?.disabled?.(item) || false;
    }


  // onpage method  for pagination or sorting
  onPage(event: any) {

    this.onPageChange.emit({
      pageIndex:  event.first / event.rows,
      pageSize: event.rows,
    });
  }


  updateSortIndex(item: any, newSortIndex: number) {
    this.emitEvent('updateSortIndex', { data: item, newSortIndex });
  }

  toggle(item: any) {
    this.emitEvent('toggle', item);
  }
  activate(id:any){
    this.emitEvent('activate', id);
  }

  canEditStatus(row: any, field: string): boolean {
    // Example condition: Check if the row's status is 'Pending' and allow editing
    if (field === 'subOrderStatus' && row.subOrderStatus === 'Pending') {
      return true;
    }
    return false;
  }

getNestedValue(item: any, field: string): any {
    return field?.split('.').reduce((acc, key) => acc && acc[key], item);
}
  /*****************************************Handel menue Action *************************** */

  getMenuItems(actions: any[], item: any): any[] {
    return actions
      .filter(button => !button.show || button.show(item))
      .map(button => ({
        label: this.translate.instant(button.name),
        icon: button.icon, // Ensure button has an icon
        styleClass: button.styleClass, // Apply CSS class from config
        command: () => this.handleButtonClick(button.name, item),
        // disabled: button.disabled?.(item) || false ,// Check if button should be disabled
        // hidden: button.hidden?.(item) || false // Check if button should be disabled
      }));
  }
    handleButtonClick(actionName: string, item: any): void {

      this.emitEvent(actionName, item); // Use the emitEvent method to emit the action and payload
  }


  onRowSelected(selectedRow){
    this.emitEvent('View Details',selectedRow)
    this.emitEvent('Download', selectedRow);
  }


    onDownload(item: any, field: string): void {
      const payload = item?.[field];
      if (payload) {
          this.emitEvent('Download', payload);
      } else {
          console.warn('Invalid download payload:', { item, field });
      }
  }


  getScaledRating(value: number): number {
    if (value === null || value === undefined) return 0; // Handle null/undefined cases
    return Math.round(value * 10); // Scale 0-1 range to 0-10 and round to the nearest integer
  }

  }
