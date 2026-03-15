import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmmrahListComponent } from './ummrah-list.component';

describe('UmmrahListComponent', () => {
  let component: UmmrahListComponent;
  let fixture: ComponentFixture<UmmrahListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UmmrahListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UmmrahListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
