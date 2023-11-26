import { TestBed } from '@angular/core/testing';

import { MonitorDataService } from './monitor-data.service';

describe('MonitorDataService', () => {
  let service: MonitorDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitorDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
