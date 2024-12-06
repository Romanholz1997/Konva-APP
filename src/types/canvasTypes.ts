// src/types/canvasTypes.ts

import { Shape } from "./types";

  export interface LayerData {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    image?: string;
    shapes?: Shape[];
  }
  
  export interface Layers {
    [key: string]: LayerData;
  }
  
  export interface CanvasStage {
    w: number;
    h: number;
    layers: Layers;
  }
  
  export interface CanvasData {
    canvasprofile: {
      name: string;
      lastupdated: string;
    };
    canvasstage: CanvasStage;
  }
  