// src/components/CircleShape.tsx

import React from "react";
import { Circle as KonvaCircle } from "react-konva";
import Konva from "konva";

interface CustomCircleProps {
  id: string;
  x: number;
  y: number;
  radius: number;
  fill: string;
  rotation: number;
  scaleX:number;
  scaleY:number;
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  onDblClick:(e: any) => void;
  onShapeMouseLeave: ( e: Konva.KonvaEventObject<MouseEvent>) => void;
  onShapeMouseEnter: ( e: Konva.KonvaEventObject<MouseEvent>, shape: Konva.Circle) => void;
  onDragMove: (e: any) => void;
}
const Circle: React.FC<CustomCircleProps> = ({
  id,
  x,
  y,
  radius,
  fill,
  rotation,
  scaleX,
  scaleY,
  onShapeClick,
  onDragEnd,
  onDragMove,
  dragBoundFunc,
  onDblClick,
  onShapeMouseLeave,
  onShapeMouseEnter
}) => {
  const shapeRef = React.useRef<Konva.Circle>(null);
  
  return (
    <KonvaCircle
      id={id}
      name="object"
      x={x}
      y={y}
      radius={radius}
      fill={fill}
      rotation={rotation}
      scaleX = {scaleX}
      scaleY={scaleY}
      draggable
      onClick={(e) => onShapeClick(e, id)}
      onDragMove={(e) => onDragMove(e)}
      onDragEnd={(e) => onDragEnd(e, id)}
      dragBoundFunc={dragBoundFunc}
      onDblClick={onDblClick}
      ref={shapeRef}
      onMouseEnter={(e) => onShapeMouseEnter(e, shapeRef.current!)}
      onMouseLeave={onShapeMouseLeave}
    />
  );
};

export default Circle;
