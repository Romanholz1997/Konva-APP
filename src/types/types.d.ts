export interface RectangleAttrs {
  id: string;
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation?: number;
  scaleY?:number;
  scaleX?:number;
  radius?: number;
  innerRadius?: number;
  groupId?: string | null;
}

export interface CircleAttrs {
  id: string;
  type: 'circle';
  x: number;
  y: number;
  radius: number;
  fill: string;
  rotation?: number;
  scaleY?:number;
  scaleX?:number;
  width?:number;
  height?:number;
  innerRadius?: number;
  groupId?: string | null;
}

export interface locationAttrs {
  id: string;
  type: 'location';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleY?:number;
  scaleX?:number;
  fill: string;
  strokeWidth?: number;
  radius?: number;
  innerRadius?: number;
  groupId?: string | null;
}

export interface StarAttrs {
  id: string;
  type: 'star';
  x: number;
  y: number;
  width?:number;
  height?:number;
  numPoints: number;
  innerRadius: number;
  radius: number;
  fill: string;
  rotation?: number;
  scaleY?:number;
  scaleX?:number;
  radius?: number;
  innerRadius?: number;
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
  rotation?: number;
  scaleY?:number;
  scaleX?:number;
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
  rotation?: number;
  scaleY?:number;
  scaleX?:number;
  fill: string;
  groupId?: string | null;
}

export type Shape = RectangleAttrs | CircleAttrs | StarAttrs | SVGAttrs | TextAttrs | locationAttrs;

export type ShapePropertyKey =
  | keyof RectangleAttrs
  | keyof CircleAttrs
  | keyof StarAttrs
  | keyof SVGAttrs
  | keyof TextAttrs
  | keyof locationAttrs

export interface HistoryState {
  shapes: Shape[];
}