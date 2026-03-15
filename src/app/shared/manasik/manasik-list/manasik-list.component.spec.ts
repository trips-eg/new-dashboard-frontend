import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManasikListComponent } from './manasik-list.component';

describe('ManasikListComponent', () => {
  let component: ManasikListComponent;
  let fixture: ComponentFixture<ManasikListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManasikListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManasikListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
