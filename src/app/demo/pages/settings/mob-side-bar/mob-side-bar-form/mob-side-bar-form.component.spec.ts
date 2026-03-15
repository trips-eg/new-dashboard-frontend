import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobSideBarFormComponent } from './mob-side-bar-form.component';

describe('MobSideBarFormComponent', () => {
  let component: MobSideBarFormComponent;
  let fixture: ComponentFixture<MobSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSideBarFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
