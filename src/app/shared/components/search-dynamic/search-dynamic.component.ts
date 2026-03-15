import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';


@Component({
  selector: 'app-search-dynamic',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule,SharedModule],
  templateUrl: './search-dynamic.component.html',
  styleUrl: './search-dynamic.component.scss'
})
export class SearchDynamicComponent {
  @Input() fields: any[] = [];  // Fields configuration from the parent component
  @Input() gridConfig: { columns: number } = { columns: 1 };
  @Output() selectionChanged = new EventEmitter<{ fieldKey: string, selectedValue: any }>(); // Event emitter
  @Output() submitForm = new EventEmitter<any>(); // Emit form values on submit
  @Output() clear = new EventEmitter<void>(); //
  formGroup: FormGroup;         // Form group to manage dynamic form
  maxDateTo: Date | null = null; // To store max date for "To Date"
  minDateTo: Date | null = null; // Variable to hold min date for "To Date"



  searchControl = new FormControl(); // Control for ngx-mat-select-search
  // filteredStores: Observable<any[]>=[]; // Observable for filtered options
  searchList: any[] = []; // List of all options for the select field

  filterValue: { [key: string]: FormControl } = {}; // Separate form controls for each dropdown
  filteredOptions: { [key: string]: any[] } = {}; // Store filtered options for each dropdown

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
    this.getLists();
  }

  createForm() {
    this.formGroup = this.fb.group({});
    this.fields.forEach(field => {
      if (field.type === 'date') {
        this.formGroup.addControl(field.key, this.fb.control(''));
      } else {
        this.formGroup.addControl(field.key, this.fb.control('')); // Add form controls
      }
    });

    // Custom Validator to validate date range (From Date and To Date)
    this.formGroup.setValidators(this.dateRangeValidator());
  }


  getLists() {
    this.fields.forEach(field => {

      // Add valueChanges subscription for filterable dropdowns
      if (field.type === 'select') {
        this.filterValue[field.key] = new FormControl('');
        this.filteredOptions[field.key] = field.options ? [field.options] : [];
        this.filterValue[field.key].valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterOptions(value, field))
          )
          .subscribe(filtered => {
            this.filteredOptions[field.key] = filtered;
          });
      }
    });
  }

  filterOptions(value: string, field: any): any[] {
    const filterValue = value.toLowerCase();
    return field.options.filter(option =>
      option?.label?.toLowerCase().includes(filterValue)
    );
  }

  // Date range validator
  dateRangeValidator() {
    return (formGroup: FormGroup) => {
      const fromDate = formGroup.get('orderCreationDateFrom')?.value;
      const toDate = formGroup.get('orderCreationDateDateTo')?.value;

      if (fromDate && toDate && toDate < fromDate) {
        return { dateRangeInvalid: true };
      }
      return null;
    };
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.submitForm.emit(this.formGroup.value); // Emit form values on submit
    }
  }

  onClear() {
    this.formGroup.reset(); // Reset the form
    this.clear.emit(); // Emit clear event
  }


  //Handle date change for "From Date" to set "To Date" min value
  onFromDateChange(event: any) {
    const fromDate = event.value;
    if (fromDate) {
      this.minDateTo = new Date(fromDate);  // Update min date for "To Date"
    } else {
      this.minDateTo = null; // Reset if no date selected
    }
    // If "To Date" is before "From Date", reset it
    const toDateControl = this.formGroup.get('from');
    if (toDateControl && toDateControl.value) {
      const toDate = new Date(toDateControl.value);
      if (toDate < fromDate) {
        toDateControl.setValue(null); // Clear the "To Date" if it's invalid
      }
    }
  }

  // Method to filter "To Date" based on "From Date"
  dateFilter = (d: Date | null): boolean => {
    if (!d || !this.minDateTo) {
      return true; // Allow all dates if no min date set
    }
    return d >= this.minDateTo; // Return true only for dates greater than or equal to minDateTo
  };
}
