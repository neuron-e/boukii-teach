import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonitorProfilePage } from './monitor-profile.page';

describe('MonitorProfilePage', () => {
  let component: MonitorProfilePage;
  let fixture: ComponentFixture<MonitorProfilePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MonitorProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
