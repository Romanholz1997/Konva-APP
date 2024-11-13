import React from "react";
import { Star as KonvaStar } from "react-konva";
import Konva from "konva";
interface CustomStarProps {
  id: string;
  x: number;
  y: number;
  numPoints: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
  rotation: number;
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
}
const Star: React.FC<CustomStarProps> = ({
  id,
  x,
  y,
  numPoints,
  innerRadius,
  outerRadius,
  fill,
  rotation,
  onShapeClick,
  onDragEnd,
  dragBoundFunc,
}) => {
  return (
    <>
      <KonvaStar
        id={id}
        x={x}
        y={y}
        numPoints={numPoints}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        fill={fill}
        rotation={rotation}
        draggable
        onClick={(e) => onShapeClick(e, id)}
        onDragEnd={(e) => onDragEnd(e, id)}
        dragBoundFunc={dragBoundFunc}
      />
    </>
  );
};

export default Star;
