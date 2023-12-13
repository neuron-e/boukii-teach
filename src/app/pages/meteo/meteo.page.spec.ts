import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeteoPage } from './meteo.page';

describe('MeteoPage', () => {
  let component: MeteoPage;
  let fixture: ComponentFixture<MeteoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MeteoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
