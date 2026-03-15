import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMsgComponent } from './delete-msg.component';

describe('DeleteMsgComponent', () => {
  let component: DeleteMsgComponent;
  let fixture: ComponentFixture<DeleteMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteMsgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
