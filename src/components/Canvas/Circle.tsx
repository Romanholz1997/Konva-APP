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
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
}
const Circle: React.FC<CustomCircleProps> = ({
  id,
  x,
  y,
  radius,
  fill,
  rotation,
  onShapeClick,
  onDragEnd,
}) => {
  return (
    <>
      <KonvaCircle
        id={id}
        x={x}
        y={y}
        radius={radius}
        fill={fill}
        rotation={rotation}
        draggable
        onClick={(e) => onShapeClick(e, id)}
        onDragEnd={(e) => onDragEnd(e, id)}
      />
    </>
  );
};

export default Circle;
