// src/components/Rectangle.tsx

import React, { useRef, useEffect } from "react";
import { Rect, Transformer } from "react-konva";
import Konva from "konva";
import { RectangleProps } from "../../types/types";

const Rectangle: React.FC<RectangleProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDragMove,
}) => {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Attach the transformer to the selected shape
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Exclude `id` from being passed to <Rect />
  const { id, ...rectProps } = shapeProps;

  return (
    <>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...rectProps} // Spread the remaining props without `id`
        draggable
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragMove={onDragMove}
        onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const rotation = node.rotation();
          // Reset scale to 1 to maintain consistent sizing
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: rotation,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true} // Rectangles might not need rotation
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to minimum size
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default Rectangle;
