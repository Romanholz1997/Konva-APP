import React from "react";
import {   Image as KonvaImage, } from "react-konva";
import Konva from "konva";

interface CustomSVGProps {
  id: string;
  image: HTMLImageElement | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX:number;
  scaleY:number;
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  onDblClick:(e: any) => void;
  onShapeMouseLeave: ( e: Konva.KonvaEventObject<MouseEvent>) => void;
  onShapeMouseEnter: ( e: Konva.KonvaEventObject<MouseEvent>, shape: Konva.Image) => void;
  onDragMove: (e: any) => void;
}

const SVGShape: React.FC<CustomSVGProps> = ({
  id,
  image,
  x,
  y,
  width,
  height,
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
  const shapeRef = React.useRef<Konva.Image>(null);
  return (
    image && ( 
      <KonvaImage
        image={image}
        name="object"
        id={id}      
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        scaleX = {scaleX}
        scaleY={scaleY}
        offsetX ={width/2}
        offsetY={height/2}
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
    )
  )
};

export default SVGShape;
