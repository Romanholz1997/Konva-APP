// src/types.ts

export type Shape = RectangleAttrs | CircleAttrs | StarAttrs | SVGAttrs;

export interface RectangleAttrs {
  id: string;
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
}

export interface SVGAttrs {
  id: string;
  type: "SVG";
  image: HTMLImageElement | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface CircleAttrs {
  id: string;
  type: "circle";
  x: number;
  y: number;
  radius: number;
  fill: string;
  rotation: number;
}

export interface StarAttrs {
  id: string;
  type: "star";
  x: number;
  y: number;
  numPoints: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
  rotation: number;
}

export interface SVGProps {
  shapeProps: SVGAttrs;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: SVGAttrs) => void;
  onDragMove: (handleDragMove) => void;
}

export interface RectangleProps {
  shapeProps: RectangleAttrs;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: RectangleAttrs) => void;
  onDragMove: (handleDragMove) => void;
}

export interface CircleProps {
  shapeProps: CircleAttrs;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: CircleAttrs) => void;
  onDragMove: (handleDragMove) => void;
}

export interface StarProps {
  shapeProps: StarAttrs;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: StarAttrs) => void;
  onDragMove: (handleDragMove) => void;
}
