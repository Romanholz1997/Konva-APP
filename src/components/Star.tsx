// src/components/StarShape.tsx

import React, { useRef, useEffect } from "react";
import { Star as KonvaStar, Transformer } from "react-konva";
import Konva from "konva";
import { StarProps } from "../types";

const StarShape: React.FC<StarProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<Konva.Star>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Attach the transformer to the selected shape
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Exclude `id` from being passed to <KonvaStar />
  const { id, ...starProps } = shapeProps;

  return (
    <>
      <KonvaStar
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...starProps} // Spread the remaining props without `id`
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
          const rotation = node.rotation();

          // For stars, allow non-uniform scaling if desired
          // Or enforce uniform scaling by taking the maximum or average of scaleX and scaleY
          const newScale = Math.max(scaleX, scaleY);

          // Reset scale to 1 to maintain consistent sizing
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            innerRadius: Math.max(5, node.innerRadius() * newScale),
            outerRadius: Math.max(5, node.outerRadius() * newScale),
            rotation: rotation, // Update rotation
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true} // Enable rotation for stars
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

export default StarShape;
