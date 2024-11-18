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
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
}

const SVGShape: React.FC<CustomSVGProps> = ({
  id,
  image,
  x,
  y,
  width,
  height,
  rotation,
  onShapeClick,
  onDragEnd,
  dragBoundFunc,
}) => {
  return (
    image && ( 
      <KonvaImage
        image={image}
        id={id}      
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable
        onClick={(e) => onShapeClick(e, id)}
        onDragEnd={(e) => onDragEnd(e, id)}
        dragBoundFunc={dragBoundFunc}
      />
    )
  )
};

export default SVGShape;
