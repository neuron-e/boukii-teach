import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonitorDetailPage } from './monitor-detail.page';

describe('MonitorDetailPage', () => {
  let component: MonitorDetailPage;
  let fixture: ComponentFixture<MonitorDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MonitorDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
