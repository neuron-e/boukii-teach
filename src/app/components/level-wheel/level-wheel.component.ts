import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-level-wheel',
  templateUrl: './level-wheel.component.html',
  styleUrls: ['./level-wheel.component.scss'],
})
export class LevelWheelComponent  implements OnInit, OnChanges {

  @ViewChild('circleSVG', { static: false }) circleSVG: ElementRef;

  @Input() allLevels: any[] = [];
  @Input() currentLevel: any = 0;
  @Output() currentLevelChange: EventEmitter<number> = new EventEmitter<number>();

  startX: number = 0;
  endX: number = 0;
  touchStartTime: number = 0;
  moved: boolean = false;
  objectiveValue:any[] = [];

  constructor() { }

  ngOnInit() {
    if(this.currentLevel){
      let index = this.allLevels.findIndex(obj => obj.id === this.currentLevel);
      if (index === -1) {
        this.currentLevel = 0;
      }
      else{
        this.currentLevel = index;
      }
    }
    else{
      this.currentLevel = 0;
    }
  }

  ngAfterViewInit() {
    this.initializeCircleRotation();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentLevel'] && !changes['currentLevel'].firstChange) {
        this.initializeCircleRotation();
    }
  }

  initializeCircleRotation() {
    this.setCircleRotation();
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
    const circleAngleSize = 360 / this.allLevels.length;

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
    if (index <= currentLevel) {
      return this.allLevels[index].color;
    } else {
      return this.allLevels[index].inactive_color;
    }
  }

  rotate(direction: 'left' | 'right') {
    if (direction === 'left' && this.currentLevel !== 0) {
      this.currentLevel--;
    } else if (direction === 'right' && this.currentLevel !== (this.allLevels.length - 1) ) {
      this.currentLevel++;
    }
    this.setCircleRotation();
    //Update outside component
    this.currentLevelChange.emit(this.currentLevel);
  }

  setCircleRotation() {
    // X levels
    const rotationAmount = 360 / this.allLevels.length;
    const rotation = (this.currentLevel) * rotationAmount;
    this.circleSVG.nativeElement.style.transform = `rotate(${-rotation}deg)`;
  }

}
