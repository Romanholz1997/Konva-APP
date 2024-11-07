// src/components/CircleShape.tsx

import React, { useRef, useEffect } from "react";
import { Circle as KonvaCircle, Transformer } from "react-konva";
import Konva from "konva";
import { CircleProps } from "../types";

const CircleShape: React.FC<CircleProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<Konva.Circle>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Attach the transformer to the selected shape
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Exclude `id` from being passed to <KonvaCircle />
  const { id, ...circleProps } = shapeProps;

  return (
    <>
      <KonvaCircle
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...circleProps} // Spread the remaining props without `id`
        draggable
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // For circles, enforce uniform scaling
          const newScale = Math.max(scaleX, scaleY);

          // Reset scale to 1 to maintain consistent sizing
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            radius: Math.max(5, node.radius() * newScale),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false} // Circles don't need rotation
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CircleShape;
