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
  scaleX:number;
  scaleY:number;
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  onDblClick:(e: any) => void;
  onShapeMouseLeave: ( e: Konva.KonvaEventObject<MouseEvent>) => void;
  onShapeMouseEnter: ( e: Konva.KonvaEventObject<MouseEvent>, shape: Konva.Rect) => void;
  onDragMove: (e: any) => void;
  draggable: boolean;
}

const Rectangle: React.FC<CustomRectProps> = ({
  id,
  x,
  y,
  width,
  height,
  fill,
  rotation,
  scaleX,
  scaleY,
  onDragMove,
  onShapeClick,
  onDragEnd,
  dragBoundFunc,
  onDblClick,
  onShapeMouseLeave,
  onShapeMouseEnter,
  draggable

}) => {
  const shapeRef = React.useRef<Konva.Rect>(null);
  return (
    <Rect
      id={id}
      name="object"
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rotation={rotation}
      scaleX = {scaleX}
      scaleY={scaleY}
      offsetX ={width/2}
      offsetY={height/2}
      draggable ={draggable}
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

export default Rectangle;
