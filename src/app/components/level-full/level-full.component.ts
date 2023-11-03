import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-level-full',
  templateUrl: './level-full.component.html',
  styleUrls: ['./level-full.component.scss'],
})
export class LevelFullComponent  implements OnInit {

  @Input() allLevels: any[] = [];
  @Input() dataLevels: any[] = [];
  @Input() selectLevel: number = 0;
  @Input() size: number;

  constructor() { }

  ngOnInit() {}

  get viewBox(): string {
    return `-${this.size * 0.5625} -${this.size * 0.5625} ${this.size * 1.125} ${this.size * 1.125}`;
  }

  get strokeWidth(): number {
    return this.size * 0.03125; // 2.5/80
  }

  get markerRadius(): number {
    return this.size * 0.05; // 4/80
  }

  get infoSize(): number {
    return this.size * 0.975; // 78/80
  }

  get infoPaddingV(): number {
    return this.size * 0.1625; // 13/80
  }

  get infoPaddingH(): number {
    return this.size * 0.125; // 10/80
  }

  getCirclePath(index: number): string {
    const circleRadius = this.size / 2;
    const circleAngleSize = 360 / 9;

    const gapAngleSize = ((this.size / 80) / circleRadius) * (180 / Math.PI);
    const levelAngleSize = circleAngleSize - gapAngleSize;

    const startingOffset = circleRadius / 80;
    // Marker to the right of level
    const startAngle = (index * circleAngleSize) + startingOffset;
    const endAngle = startAngle + levelAngleSize;

    // Start/end position
    const startX = circleRadius * Math.cos(this.degToRad(startAngle - 90));
    const startY = circleRadius * Math.sin(this.degToRad(startAngle - 90));
    
    const endX = circleRadius * Math.cos(this.degToRad(endAngle - 90));
    const endY = circleRadius * Math.sin(this.degToRad(endAngle - 90));

    const largeArcFlag = (endAngle - startAngle) <= 180 ? 0 : 1;

    return `M ${startX} ${startY} A ${circleRadius} ${circleRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  }

  getMarkerPosition() {
    const circleRadius = this.size / 2;
    const circleAngleSize = 360 / 9;
    const sizeMarker = this.markerRadius * 2;
  
    const gapAngleSize = ( (this.size / 60) / circleRadius) * (180 / Math.PI);
    const levelAngleSize = circleAngleSize - gapAngleSize;
  
    // Start angle for the selected level
    const shiftAdjustment = circleAngleSize * 1.60; //manually to fit in gap
    const startAngle = (this.selectLevel * circleAngleSize) - shiftAdjustment;
    const markerAngle = startAngle + levelAngleSize + sizeMarker; // middle of the gap
  
    const x =   circleRadius * Math.cos(this.degToRad(markerAngle - 90));
    const y = circleRadius * Math.sin(this.degToRad(markerAngle - 90));
  
    return { x, y };
  }

  degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  getCircleColor(index: number, selectLevel: number): string {
    if (index < selectLevel) {
      return this.dataLevels[index].color;
    } else {
      return this.dataLevels[index].inactive_color;
    }
  }

}
