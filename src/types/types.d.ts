export interface RectangleAttrs {
  id: string;
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
  scaleY:number;
  scaleX:number;
  groupId?: string | null;
}

export interface CircleAttrs {
  id: string;
  type: 'circle';
  x: number;
  y: number;
  radius: number;
  fill: string;
  rotation: number;
  scaleY:number;
  scaleX:number;
  groupId?: string | null;
}

// export interface SelectAttrs {
//   id: string;
//   type: 'select';
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   groupId?: string | null;
//   rotation?: number;
//   scaleY?:number;
//   scaleX?:number;
//   fill?: string;
// }

export interface StarAttrs {
  id: string;
  type: 'star';
  x: number;
  y: number;
  numPoints: number;
  innerRadius: number;
  radius: number;
  fill: string;
  rotation: number;
  scaleY:number;
  scaleX:number;
  groupId?: string | null;
}

export interface SVGAttrs {
  id: string;
  type: 'SVG';
  image: HTMLImageElement | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleY:number;
  scaleX:number;
  groupId?: string | null;
}
export interface TextAttrs {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string,
  fontSize: number,
  fontFamily: string,
  rotation: number;
  scaleY:number;
  scaleX:number;
  fill: string;
  groupId?: string | null;
}

export type Shape = RectangleAttrs | CircleAttrs | StarAttrs | SVGAttrs | TextAttrs;

export type ShapePropertyKey =
  | keyof RectangleAttrs
  | keyof CircleAttrs
  | keyof StarAttrs
  | keyof SVGAttrs
  | keyof TextAttrs;

export interface HistoryState {
  shapes: Shape[];
}