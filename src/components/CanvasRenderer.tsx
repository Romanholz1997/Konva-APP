// src/components/CanvasRenderer.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Star,
  Image as KonvaImage,
  Text,
  Transformer,
} from 'react-konva';
import { CanvasJSON, ShapeData, LayerData } from '../types/typeData';
import useImage from 'use-image';
import { KonvaEventObject } from "konva/lib/Node";

interface CanvasRendererProps {
  canvasData: CanvasJSON | null;
}

interface SelectedShape {
  layerName: string;
  shapeId: string;
}

const URLImage: React.FC<ShapeData> = ({
  image,
  x,
  y,
  width,
  height,
  rotation,
  scaleX,
  scaleY,
}) => {
  const [img] = useImage(image || '');
  return img ? (
    <KonvaImage
      image={img}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      draggable
    />
  ) : null;
};

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ canvasData }) => {
  const [layers, setLayers] = useState<{ name: string; data: LayerData }[]>([]);
  const [selectedShape, setSelectedShape] = useState<SelectedShape | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const transformerRef = useRef<any>(null);
  const layerRefs = useRef<{ [key: string]: any }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Define handleWheel before using it
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const scaleBy = 1.05;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  useEffect(() => {
    if (canvasData) {
      const formattedLayers = Object.entries(canvasData.canvasstage.layers).map(
        ([name, data]) => ({ name, data })
      );
      setLayers(formattedLayers);
    }
  }, [canvasData]);

  useEffect(() => {
    if (selectedShape && layerRefs.current[selectedShape.layerName]) {
      const layer = layerRefs.current[selectedShape.layerName];
      const selectedNode = layer.findOne(`#${selectedShape.shapeId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedShape, layers]);

  const renderShape = (shape: ShapeData, layerName: string): React.ReactNode => {
    const isSelected =
      selectedShape?.layerName === layerName &&
      selectedShape.shapeId === shape.id;

    const handleMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (pointer && shape.mydata?.tooltip) {
        setTooltip({
          text: shape.mydata.tooltip,
          x: pointer.x,
          y: pointer.y,
        });
      }
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (pointer && shape.mydata?.tooltip) {
        setTooltip({
          text: shape.mydata.tooltip,
          x: pointer.x,
          y: pointer.y,
        });
      }
    };

    const handleMouseLeave = () => {
      setTooltip(null);
    };

    const commonProps = {
      id: shape.id, // Ensure each shape has a unique id
      x: shape.x,
      y: shape.y,
      rotation: shape.rotation,
      scaleX: shape.scaleX,
      scaleY: shape.scaleY,
      fill: shape.fill,
      draggable: true,
      onClick: () => {
        setSelectedShape({ layerName, shapeId: shape.id });
      },
      onTap: () => {
        setSelectedShape({ layerName, shapeId: shape.id });
      },
      onDragEnd: (e: KonvaEventObject<MouseEvent>) => {
        // Update shape position
        const newX = e.target.x();
        const newY = e.target.y();
        updateShapePosition(layerName, shape.id, newX, newY);
      },
      onTransformEnd: (e: KonvaEventObject<MouseEvent>) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale to 1 after transformation
        node.scaleX(1);
        node.scaleY(1);

        // Update shape properties
        updateShapeTransform(
          layerName,
          shape.id,
          node.x(),
          node.y(),
          node.rotation(),
          scaleX,
          scaleY,
          node.width() * scaleX,
          node.height() * scaleY
        );
      },
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    };

    return (
      <React.Fragment key={shape.id}>
        {/* Render the shape */}
        {(() => {
          switch (shape.type.toLowerCase()) {
            case 'rectangle':
              if (shape.width === undefined || shape.height === undefined) {
                console.warn(`Rectangle shape with id ${shape.id} is missing width or height.`);
                return null;
              }
              return <Rect {...commonProps} width={shape.width} height={shape.height} />;
            case 'circle':
              if (shape.radius === undefined) {
                console.warn(`Circle shape with id ${shape.id} is missing radius.`);
                return null;
              }
              return <Circle {...commonProps} radius={shape.radius} />;
            case 'star':
              if (
                shape.numPoints === undefined ||
                shape.innerRadius === undefined ||
                shape.radius === undefined
              ) {
                console.warn(`Star shape with id ${shape.id} is missing numPoints, innerRadius, or radius.`);
                return null;
              }
              return (
                <Star
                  {...commonProps}
                  numPoints={shape.numPoints}
                  innerRadius={shape.innerRadius}
                  outerRadius={shape.radius}
                />
              );
            case 'image':
              if (!shape.image) {
                console.warn(`Image shape with id ${shape.id} is missing image source.`);
                return null;
              }
              return <URLImage {...shape} />;
            case 'text':
              if (!shape.text) {
                console.warn(`Text shape with id ${shape.id} is missing text content.`);
                return null;
              }
              return (
                <Text
                  {...commonProps}
                  text={shape.text}
                  fontSize={shape.fontSize || 20}
                  fontFamily={shape.fontFamily || 'Arial'}
                  width={shape.width || 100}
                  height={shape.height || 50}
                />
              );
            default:
              console.warn(`Unsupported shape type: ${shape.type}`);
              return null;
          }
        })()}
      </React.Fragment>
    );
  };

  const updateShapePosition = (
    layerName: string,
    shapeId: string,
    newX: number,
    newY: number
  ) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.name !== layerName) return layer;
        const updatedShapes = layer.data.shapes.map((shape) => {
          if (shape.id !== shapeId) return shape;
          return { ...shape, x: newX, y: newY };
        });
        return {
          ...layer,
          data: { ...layer.data, shapes: updatedShapes },
        };
      })
    );
  };

  const updateShapeTransform = (
    layerName: string,
    shapeId: string,
    newX: number,
    newY: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    width?: number,
    height?: number
  ) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.name !== layerName) return layer;
        const updatedShapes = layer.data.shapes.map((shape) => {
          if (shape.id !== shapeId) return shape;
          return {
            ...shape,
            x: newX,
            y: newY,
            rotation,
            scaleX,
            scaleY,
            width: width ?? shape.width,
            height: height ?? shape.height,
          };
        });
        return {
          ...layer,
          data: { ...layer.data, shapes: updatedShapes },
        };
      })
    );
  };

  if (!canvasData) {
    return null;
  }

  const { w, h } = canvasData.canvasstage;

  return (
    <div style={{ position: 'relative' }}>
      <Stage
        width={w}
        height={h}
        onMouseDown={(e) => {
          // Deselect when clicked on empty area
          if (e.target === e.target.getStage()) {
            setSelectedShape(null);
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedShape(null);
          }
        }}
        onWheel={handleWheel}
        draggable
      >
        {layers.map(({ name, data }) => (
          <Layer
            key={name}
            ref={(node) => {
              if (node) {
                layerRefs.current[name] = node;
              }
            }}
            x={data.x}
            y={data.y}
            width={data.width}
            height={data.height}
          >
            {data.shapes.map((shape: ShapeData) => renderShape(shape, name))}
          </Layer>
        ))}
        <Transformer ref={transformerRef} />
      </Stage>
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y,
            left: tooltip.x,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            pointerEvents: 'none',
            transform: 'translate(-50%, -100%)',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default CanvasRenderer;
