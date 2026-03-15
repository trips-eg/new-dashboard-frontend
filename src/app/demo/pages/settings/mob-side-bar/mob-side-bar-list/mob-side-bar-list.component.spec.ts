import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobSideBarListComponent } from './mob-side-bar-list.component';

describe('MobSideBarListComponent', () => {
  let component: MobSideBarListComponent;
  let fixture: ComponentFixture<MobSideBarListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSideBarListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobSideBarListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
