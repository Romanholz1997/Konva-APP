import React from "react";
import { Rect } from "react-konva";
import Konva from "konva";

interface CustomRectProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
}

const Rectangle: React.FC<CustomRectProps> = ({
  id,
  x,
  y,
  width,
  height,
  fill,
  rotation,
  onShapeClick,
  onDragEnd,
  dragBoundFunc,
}) => {
  return (
    <Rect
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rotation={rotation}
      draggable
      onClick={(e) => onShapeClick(e, id)}
      onDragEnd={(e) => onDragEnd(e, id)}
      dragBoundFunc={dragBoundFunc}
    />
  );
};

export default Rectangle;
