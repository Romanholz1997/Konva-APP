// src/Rectangle.tsx

import React, { useRef, useEffect } from "react";
import { Rect } from "react-konva";
import Konva from "konva";

interface RectangleType {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  id: string;
  rotation: number; // Added rotation
}

interface RectangleProps {
  shapeProps: RectangleType;
  isSelected: boolean;
  onSelect: (ids: string[]) => void;
  onChange: (newAttrs: RectangleType) => void;
  selectedIds: string[];
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void; // Optional prop
}

const Rectangle: React.FC<RectangleProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  selectedIds,
  onDragMove,
}) => {
  const shapeRef = useRef<Konva.Rect>(null);

  const shapeId = shapeProps.id;

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // Add visual cue for selection
      shapeRef.current.to({
        duration: 0.1,
        stroke: "blue",
        strokeWidth: 2,
        onFinish: () => {
          shapeRef.current?.getLayer()?.batchDraw();
        },
      });
    } else if (shapeRef.current) {
      // Remove visual cue when not selected
      shapeRef.current.to({
        duration: 0.1,
        strokeWidth: 0,
        onFinish: () => {
          shapeRef.current?.getLayer()?.batchDraw();
        },
      });
    }
  }, [isSelected]);

  const onClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;

    let newIds: string[] = [];

    if (!metaPressed && isSelected) {
      // Do nothing if node is selected and no key pressed
      return;
    }

    if (!metaPressed && !isSelected) {
      // If no key pressed and the node is not selected
      newIds = [shapeId];
    } else if (metaPressed && isSelected) {
      // If keys pressed and node was selected
      newIds = selectedIds.filter((id) => id !== shapeId);
    } else if (metaPressed && !isSelected) {
      // Add the node into selection
      newIds = [...selectedIds, shapeId];
    }

    onSelect(newIds);
  };

  return (
    <Rect
      ref={shapeRef}
      {...shapeProps}
      rotation={shapeProps.rotation} // Set rotation
      draggable
      onClick={onClick}
      onTap={onClick}
      onDragMove={onDragMove} // Attach the move handler if provided
      onDragEnd={(e) => {
        onChange({
          ...shapeProps,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current;
        if (node) {
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const rotation = node.rotation(); // Get rotation

          // Reset scale to 1
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation, // Update rotation
            // Set minimal value
            width: Math.max(25, node.width() * scaleX),
            height: Math.max(25, node.height() * scaleY),
          });
        }
      }}
      className={isSelected ? "selected" : ""}
    />
  );
};

export default Rectangle;
