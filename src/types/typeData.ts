// src/types/types.ts
// src/types/types.ts

export interface ShapeData {
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    numPoints?: number;
    innerRadius?: number;
    fill?: string;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    image?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    mydata?: {
      tooltip: string;
      details: {
        myline1: string;
        myline2: string;
        myline3: string;
      };
    };
  }
  
  // Define ShapePropertyKey if necessary
  export type ShapePropertyKey = keyof ShapeData;
  
  // Define Attributes Interfaces for Specific Shapes
  export interface RectangleAttrs {
    width: number;
    height: number;
  }
  
  export interface StarAttrs {
    numPoints: number;
    innerRadius: number;
    outerRadius: number;
  }
  
  export interface CircleAttrs {
    radius: number;
  }
  
  export interface SVGAttrs {
    src: string;
  }
  
  // Export other necessary interfaces if needed
  
  
  export interface LayerData {
    x: number;
    y: number;
    width: number;
    height: number;
    shapes: ShapeData[];
  }
  
  export interface CanvasProfile {
    name: string;
    lastupdated: string;
  }
  
  export interface CanvasStage {
    w: number;
    h: number;
    layers: {
      [layerName: string]: LayerData;
    };
  }
  
  export interface CanvasObjects {
    shapes: ShapeData[];
  }
  
  export interface CanvasJSON {
    canvasprofile: CanvasProfile;
    canvasstage: CanvasStage;
    canvasobjects: CanvasObjects;
  }
  