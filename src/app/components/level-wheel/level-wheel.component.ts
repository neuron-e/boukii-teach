import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-level-wheel',
  templateUrl: './level-wheel.component.html',
  styleUrls: ['./level-wheel.component.scss'],
})
export class LevelWheelComponent  implements OnInit, OnChanges {

  @ViewChild('circleSVG', { static: false }) circleSVG: ElementRef;

  @Input() dataLevels: any[] = [];
  @Input() allLevels: any[] = [];
  @Input() currentLevel: number = 0;
  @Output() currentLevelChange: EventEmitter<number> = new EventEmitter<number>();

  startX: number = 0;
  endX: number = 0;
  touchStartTime: number = 0;
  moved: boolean = false;
  objectiveValue:any[] = [];

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.initializeCircleRotation();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentLevel'] && !changes['currentLevel'].firstChange) {
        this.initializeCircleRotation();
    }
  }

  initializeCircleRotation() {
    if (this.currentLevel === 0) {
        const rotationAmount = 360 / 9;
        this.circleSVG.nativeElement.style.transform = `rotate(${rotationAmount}deg)`;
    } else {
        this.setCircleRotation();
    }
  }

  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.touchStartTime = Date.now();
    this.moved = false;
  }

  onTouchMove(event: TouchEvent) {
    this.endX = event.touches[0].clientX;
    this.moved = true;
  }

  onTouchEnd(event: TouchEvent) {
    const touchDuration = Date.now() - this.touchStartTime;

    //Check move and touch
    if (this.moved && touchDuration > 200) {
        if (this.startX - this.endX > 50) {  
            this.rotate('right');
        } else if (this.endX - this.startX > 50) {
            this.rotate('left');
        }
    }
  }

  onCircleClick(event: MouseEvent) {
  if (!this.moved) { // No swipe
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      if (event.clientX > centerX) {
          this.rotate('right');
      } else {
          this.rotate('left');
      }
  }
  }

  getCirclePath(index: number): string {
    const markerSize = 16; //White circle marking level (outer circle shadow)
    const circleRadius = this.screenWidth - (markerSize);
    const circleAngleSize = 360 / 9;

    const gapAngleSize = (8 / circleRadius) * (180 / Math.PI);
    const levelAngleSize = circleAngleSize - gapAngleSize;

    // Marker to the right of level
    const shiftAdjustment = circleAngleSize;
    const startAngle = (index * circleAngleSize) - shiftAdjustment;
    const endAngle = startAngle + levelAngleSize;

    // Start/end position
    const startX = this.screenWidth + circleRadius * Math.cos(this.degToRad(startAngle - 90));
    const startY = this.screenWidth + circleRadius * Math.sin(this.degToRad(startAngle - 90));
    
    const endX = this.screenWidth + circleRadius * Math.cos(this.degToRad(endAngle - 90));
    const endY = this.screenWidth + circleRadius * Math.sin(this.degToRad(endAngle - 90));

    const largeArcFlag = (endAngle - startAngle) <= 180 ? 0 : 1;

    return `M ${startX} ${startY} A ${circleRadius} ${circleRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  }

  degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  get screenWidth(): number {
    return 0.75 * window.innerWidth;
  }

  get circleWidth(): number {
    return 2 * this.screenWidth;
  }

  getCircleColor(index: number, currentLevel: number): string {
    if (index < currentLevel) {
      return this.dataLevels[index].color;
    } else {
      return this.dataLevels[index].inactive_color;
    }
  }

  rotate(direction: 'left' | 'right') {
    if (direction === 'left' && this.currentLevel !== 0) {
      this.currentLevel--;
    } else if (direction === 'right' && this.currentLevel !== 9) {
      this.currentLevel++;
    }
    this.setCircleRotation();
    //Update outside component
    this.currentLevelChange.emit(this.currentLevel);
  }

  setCircleRotation() {
    // 9 levels
    const rotationAmount = 360 / 9;
    const rotation = (this.currentLevel - 1) * rotationAmount;
    this.circleSVG.nativeElement.style.transform = `rotate(${-rotation}deg)`;
  }

}
