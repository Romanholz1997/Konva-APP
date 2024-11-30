import React from "react";
import { Text as KonvaText } from "react-konva";
import Konva from "konva";

interface CustomTextProps {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  rotation: number;
  scaleX:number;
  scaleY:number;
  onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  onDblClick:(e: any) => void;
  onShapeMouseLeave: ( e: Konva.KonvaEventObject<MouseEvent>) => void;
  onShapeMouseEnter: ( e: Konva.KonvaEventObject<MouseEvent>, shape: Konva.Text) => void;
  onDragMove: (e: any) => void;
  draggable: boolean;
}

const Text: React.FC<CustomTextProps> = ({
  id,
  x,
  y,
  fill,
  text,
  fontFamily,
  fontSize,
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
  const shapeRef = React.useRef<Konva.Text>(null);
  return (
    <KonvaText
      id={id}
      name="object"
      x={x}
      y={y}
      text={text}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      rotation={rotation}
      scaleX = {scaleX}
      scaleY={scaleY}
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

export default Text;
