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
  scaleX:number;
  scaleY:number;
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  onDblClick:(e: any) => void;
  onShapeMouseLeave: ( e: Konva.KonvaEventObject<MouseEvent>) => void;
  onShapeMouseEnter: ( e: Konva.KonvaEventObject<MouseEvent>, shape: Konva.Star) => void;
  onDragMove: (e: any) => void;
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
  scaleX,
  scaleY,
  onShapeClick,
  onDragMove,
  onDragEnd,
  dragBoundFunc,
  onDblClick,
  onShapeMouseLeave,
  onShapeMouseEnter
}) => {
  const shapeRef = React.useRef<Konva.Star>(null);
  return (
    <KonvaStar
      id={id}
      name="object"
      x={x}
      y={y}
      numPoints={numPoints}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
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

export default Star;
