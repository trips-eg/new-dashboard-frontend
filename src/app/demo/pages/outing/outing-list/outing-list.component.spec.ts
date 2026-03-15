import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingListComponent } from './outing-list.component';

describe('OutingListComponent', () => {
  let component: OutingListComponent;
  let fixture: ComponentFixture<OutingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
