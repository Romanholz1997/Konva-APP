import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Transformer,
  Text,
  Line,
} from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Ruler from "./Ruler";
import {
  Shape,
  RectangleAttrs,
  StarAttrs,
  CircleAttrs,
} from "../../types/types";
import Rectangle from "./Rectangle";
import Circle from "./Circle";
import Star from "./Star";

const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 4000;
const Canvas: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const stageRef = useRef<Konva.Stage>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const [isSelecting, setIsSelecting] = useState(false);

  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  const [showMouseInfo, setShowMouseInfo] = useState(false);

  const [isPanning, setIsPanning] = useState(false);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState<number>(1);
  const [lastPos, setLastPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // Load the background image
  useEffect(() => {
    const imagePath = "./background.svg"; // Replace with your SVG path
    loadBackgroundImage(imagePath);
  }, []);

  const loadBackgroundImage = (src: string) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setBackgroundImage(img);
    };
    img.onerror = (err) => {
      console.error("Failed to load background image:", err);
    };
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>): void => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.5;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    if(newScale > 0.18 && newScale < 5){
      setStageScale(newScale);
      setStagePos(newPos);
    }   
    
  };
  const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
  };

  const handleScroll = () => {
    if (canvasRef.current) {
      setScrollOffsetX(canvasRef.current.scrollLeft);
      setScrollOffsetY(canvasRef.current.scrollTop);
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("scroll", handleScroll);
      return () => {
        canvas.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect shapes if clicked on empty area
    if (e.target === stageRef.current) {
      if(e.evt.button === 0)
        {
          toast("You clicked", {
            position: "top-right",
            autoClose: 1000, // Change this value to adjust the display duration
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        }
      if (e.evt.button === 2) {
        e.evt.preventDefault(); // Prevent the context menu from appearing
        setIsPanning(true);
        const pointerPos = stageRef.current?.getPointerPosition();
        if (pointerPos) {
          setLastPos({
            x: (pointerPos.x - stagePos.x) / stageScale,
            y: (pointerPos.y - stagePos.y) / stageScale,
          });
        }
      } else {
        setSelectedIds([]);
        const pos = stageRef.current?.getPointerPosition();
        if (pos) {
          setSelectionRect({
            visible: true,
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
          });
          setIsSelecting(true);
        }
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    if (isPanning) {
      const pointerPos = stageRef.current?.getPointerPosition();
      if (pointerPos) {
        const newPos = {
          x: pointerPos.x - lastPos.x * stageScale,
          y: pointerPos.y - lastPos.y * stageScale,
        };
        if(newPos.x > -4000 && newPos.y > -4000 && newPos.x < 4000 && newPos.y < 4000)
        {
          setStagePos(newPos);
        }
        
      }
    }
    const pos = stageRef.current?.getPointerPosition();
    if (pos) {
      setMouseCoords({ x: pos.x, y: pos.y });
      if (e.target === stageRef.current) {
        setShowMouseInfo(true);
      } else {
        setShowMouseInfo(false);
      }
      if (!isSelecting) {
        return;
      }
      if (!isSelecting) {
        return;
      }
    }

    if (pos && selectionRect.visible) {
      const x = Math.min(pos.x, selectionRect.x);
      const y = Math.min(pos.y, selectionRect.y);
      const width = Math.abs(pos.x - selectionRect.x);
      const height = Math.abs(pos.y - selectionRect.y);
      setSelectionRect({
        ...selectionRect,
        x,
        y,
        width,
        height,
      });
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionRect({
        ...selectionRect,
        visible: false,
      });

      const selBox = selectionRect;
      const selected = shapes.filter((shape) => {
        const shapeNode = layerRef.current?.findOne<Konva.Rect>(`#${shape.id}`);
        if (shapeNode) {
          return Konva.Util.haveIntersection(selBox, shapeNode.getClientRect());
        }
        return false;
      });

      setSelectedIds(selected.map((shape) => shape.id));
    }
  };

  useEffect(() => {
    const transformer = transformerRef.current;
    if (transformer) {
      const nodes = selectedIds
        .map((id) => layerRef.current?.findOne<Konva.Rect>(`#${id}`))
        .filter(Boolean) as Konva.Node[];
      transformer.nodes(nodes);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  const handleShapeClick = (
    e: Konva.KonvaEventObject<MouseEvent>,
    id: string
  ) => {
    e.cancelBubble = true;

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = selectedIds.includes(id);

    if (!metaPressed && !isSelected) {
      setSelectedIds([id]);
    } else if (metaPressed && isSelected) {
      setSelectedIds(selectedIds.filter((_id) => _id !== id));
      toast("Ctrl clicked", {
        position: "top-right",
        autoClose: 1000, // Change this value to adjust the display duration
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } else if (metaPressed && !isSelected) {
      setSelectedIds([...selectedIds, id]);
      toast("Ctrl clicked", {
        position: "top-right",
        autoClose: 1000, // Change this value to adjust the display duration
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  const handleTransformEnd = () => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const transformedNodes = transformer.nodes();

    const newShapes = shapes.map((shape) => {
      const node = transformedNodes.find((n) => n.id() === String(shape.id));
      if (node) {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();

        // Reset scale to 1
        node.scaleX(1);
        node.scaleY(1);

        if (shape.type === "rectangle") {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          };
        } else if (shape.type === "circle") {
          const avgScale = (scaleX + scaleY) / 2;
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            radius: Math.max(5, shape.radius * avgScale),
          };
        } else if (shape.type === "star") {
          const avgScale = (scaleX + scaleY) / 2;
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            innerRadius: Math.max(5, shape.innerRadius * avgScale),
            outerRadius: Math.max(5, shape.outerRadius * avgScale),
          };
        } else {
          return shape;
        }
      } else {
        return shape;
      }
    });

    setShapes(newShapes);
  };
  const isPointInRotatedRect = (
    px: number,
    py: number,
    rect: RectangleAttrs
  ): boolean => {
    const { x, y, width, height, rotation } = rect;

    // Translate point to rectangle's local coordinate system
    const translatedX = px - x;
    const translatedY = py - y;

    // Convert rotation to radians and negate for inverse rotation
    const theta = -rotation * (Math.PI / 180);

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    // Rotate the point
    const localX = translatedX * cos - translatedY * sin;
    const localY = translatedX * sin + translatedY * cos;

    // Check if the point is within the unrotated rectangle
    return localX >= 0 && localX <= width && localY >= 0 && localY <= height;
  };
  const isOverlapping = (x: number, y: number): boolean => {
    return shapes.some((shape) => {
      if (shape.type === "rectangle") {
        const rect = shape as RectangleAttrs;
        return isPointInRotatedRect(x, y, rect);
      } else if (shape.type === "circle") {
        const circle = shape as CircleAttrs;
        const dx = x - circle.x;
        const dy = y - circle.y;
        return Math.sqrt(dx * dx + dy * dy) <= circle.radius;
      } else if (shape.type === "star") {
        const star = shape as StarAttrs;
        return (
          x >= star.x - star.outerRadius &&
          x <= star.x + star.outerRadius &&
          y >= star.y - star.outerRadius &&
          y <= star.y + star.outerRadius
        );
      }
      // Add checks for other shape types if necessary
      return false;
    });
  };
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const target = e.target as HTMLElement;
      const stageElement = target.closest(
        ".konvajs-content"
      ) as HTMLElement | null;

      if (!stageElement || !stageRef.current) return;

      const stageRect = stageElement.getBoundingClientRect();

      const pointer = {
        x: (e.clientX - stageRect.left - stagePos.x) / stageScale,
        y: (e.clientY - stageRect.top - stagePos.y) / stageScale,
      };

      const overlapping = isOverlapping(pointer.x, pointer.y);

      if (overlapping) {
        // Optionally, provide feedback to the user
        alert("Cannot place the shape over an existing one.");
        return;
      }

      const shapeType = e.dataTransfer.getData("text/plain") as
        | "rectangle"
        | "circle"
        | "star";

      let newShape: Shape;
      switch (shapeType) {
        case "rectangle":
          newShape = {
            id: "rectangle_" + nextId,
            type: "rectangle",
            x: pointer.x - 50,
            y: pointer.y - 50,
            width: 100,
            height: 100,
            fill: "blue",
            rotation: 0,
          };
          break;
        case "circle":
          newShape = {
            id: "circle_" + nextId,
            type: "circle",
            x: pointer.x,
            y: pointer.y,
            radius: 50,
            fill: "red",
            rotation: 0,
          };
          break;
        case "star":
          newShape = {
            id: "star_" + nextId,
            type: "star",
            x: pointer.x,
            y: pointer.y,
            numPoints: 5,
            innerRadius: 30,
            outerRadius: 50,
            fill: "green",
            rotation: 0, // Initialize rotation
          };
          break;
        default:
          return;
      }

      setShapes([...shapes, newShape]);
      setNextId(nextId + 1);
    },
    [shapes, nextId, stagePos, stageScale]
  );
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!stageRef.current) return;

    const stage = stageRef.current;
    const container = stage.container();
    const stageRect = container.getBoundingClientRect();

    const pointer = {
      x: (e.clientX - stageRect.left - stagePos.x) / stageScale,
      y: (e.clientY - stageRect.top - stagePos.y) / stageScale,
    };

    const overlapping = isOverlapping(pointer.x, pointer.y);

    // Set the dropEffect based on overlap
    e.dataTransfer.dropEffect = overlapping ? "none" : "copy";
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const newShapes = shapes.map((shape) => {
      if (shape.id === id) {
        return {
          ...shape,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return shape;
    });
    setShapes(newShapes);
  };

  ////
  //--------------scroll for ruler-------------------------
  const handleTopRulerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      // Scroll horizontally based on wheel delta
      canvasRef.current.scrollLeft -= e.deltaY;
    }
  };
  const handleLeftRulerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      // Scroll vertically based on wheel delta
      canvasRef.current.scrollTop -= e.deltaY;
    }
  };
  //--------------scroll for ruler-------------------------
  ////

  ////
  //--------------delete shape-------------------------
  const deleteSelectedShapes = () => {
    if (selectedIds.length > 0) {
      // Filter out the selected shapes
      const newShapes = shapes.filter(
        (shape) => !selectedIds.includes(shape.id)
      );

      // Update the shapes state
      setShapes(newShapes);

      // Clear the selectedIds
      setSelectedIds([]);
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Call the function to delete selected shapes
        deleteSelectedShapes();
      }
    };

    // Add event listener to the window object
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIds, shapes]);
  //--------------delete shape-------------------------
  ////

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Show toast when clicking on an empty area
    
   
  };
  return (
    <div className="container">
      <Ruler
        handleTopRulerWheel={handleTopRulerWheel}
        handleLeftRulerWheel={handleLeftRulerWheel}
        scrollOffsetX={scrollOffsetX}
        scrollOffsetY={scrollOffsetY}
        stagePos={stagePos}
        stageScale={stageScale}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="canvas-container"
        ref={canvasRef}
        style={{overflow:"hidden"}}
      >
        <ToastContainer />
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={handleWheel}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu} // Prevents default context menu
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Delete" || e.key === "Backspace") {
              deleteSelectedShapes();
            }
          }}
          onClick={handleStageClick}
          // style={{overflow:"hidden"}}
        >
          <Layer
            listening={false}
            x={(-stagePos.x)/ stageScale}
            y={(-stagePos.y)/ stageScale}
            scaleX={1 / stageScale}
            scaleY={1 / stageScale}
          >
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                x={0}
                y={0}
                listening={false}
              />
            )}
          </Layer>
          <Layer ref={layerRef}>
            {shapes.map((shape) => {
              if (shape.type === "rectangle") {
                const rect = shape as RectangleAttrs;
                const dragBoundFunc = (pos: { x: number; y: number }) => {
                  const stage = stageRef.current;
                  if (stage) {
                    // Get the size of the visible area
                    const stageWidth = stage.width();
                    const stageHeight = stage.height();
  
                    // Adjust for scaling and panning
                    const scale = stageScale;
                    const xOffset = stagePos.x;
                    const yOffset = stagePos.y;
  
                    // Calculate the visible area in stage coordinates
                    const minX = -xOffset / scale;
                    const minY = -yOffset / scale;
                    const maxX = minX + stageWidth / scale - rect.width;
                    const maxY = minY + stageHeight / scale - rect.height;
  
                    // Constrain the position
                    let x = pos.x;
                    let y = pos.y;
  
                    x = Math.max(minX, Math.min(x, maxX));
                    y = Math.max(minY, Math.min(y, maxY));
                    return { x, y };
                  }
                  return pos;
                };
                return (
                  <Rectangle
                    key={rect.id}
                    id={rect.id}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={rect.fill}
                    rotation={rect.rotation}
                    onShapeClick={(e) => handleShapeClick(e, rect.id)}
                    // Remove onTransformEnd from individual shapes
                    onDragEnd={(e) => handleDragEnd(e, rect.id)}
                    dragBoundFunc={dragBoundFunc}
                  />
                );
              } else if (shape.type === "circle") {
                const circle = shape as CircleAttrs;
                const dragBoundFunc = (pos: { x: number; y: number }) => {
                  const stage = stageRef.current;
                  if (stage) {
                    // Get the size of the visible area
                    const stageWidth = stage.width();
                    const stageHeight = stage.height();
  
                    // Adjust for scaling and panning
                    const scale = stageScale;
                    const xOffset = stagePos.x;
                    const yOffset = stagePos.y;
  
                    // Calculate the visible area in stage coordinates
                    const minX = -xOffset / scale;
                    const minY = -yOffset / scale;
                    const maxX = minX + stageWidth / scale - circle.radius;
                    const maxY = minY + stageHeight / scale - circle.radius;
  
                    // Constrain the position
                    let x = pos.x;
                    let y = pos.y;
  
                    x = Math.max(minX, Math.min(x, maxX));
                    y = Math.max(minY, Math.min(y, maxY));
                    return { x, y};
                  }
                  return pos;
                };
                return (
                  <Circle
                    key={circle.id}
                    id={circle.id}
                    x={circle.x}
                    y={circle.y}
                    radius={circle.radius}
                    fill={circle.fill}
                    rotation={circle.rotation}
                    onShapeClick={(e) => handleShapeClick(e, circle.id)}
                    // Remove onTransformEnd from individual shapes
                    onDragEnd={(e) => handleDragEnd(e, circle.id)}
                    dragBoundFunc={dragBoundFunc}
                  />
                );
              } else if (shape.type === "star") {
                const star = shape as StarAttrs;
                const dragBoundFunc = (pos: { x: number; y: number }) => {
                  const stage = stageRef.current;
                  if (stage) {
                    // Get the size of the visible area
                    const stageWidth = stage.width();
                    const stageHeight = stage.height();
  
                    // Adjust for scaling and panning
                    const scale = stageScale;
                    const xOffset = stagePos.x;
                    const yOffset = stagePos.y;
  
                    // Calculate the visible area in stage coordinates
                    const minX = -xOffset / scale;
                    const minY = -yOffset / scale;
                    const maxX = minX + stageWidth / scale - star.outerRadius;
                    const maxY = minY + stageHeight / scale - star.outerRadius;
  
                    // Constrain the position
                    let x = pos.x;
                    let y = pos.y;
  
                    x = Math.max(minX, Math.min(x, maxX));
                    y = Math.max(minY, Math.min(y, maxY));
                    return { x, y};
                  }
                  return pos;
                };
                return (
                  <Star
                    key={star.id}
                    id={star.id}
                    x={star.x}
                    y={star.y}
                    numPoints={star.numPoints}
                    innerRadius={star.innerRadius}
                    outerRadius={star.outerRadius}
                    fill={star.fill}
                    rotation={star.rotation}
                    onShapeClick={(e) => handleShapeClick(e, star.id)}
                    // Remove onTransformEnd from individual shapes
                    onDragEnd={(e) => handleDragEnd(e, star.id)}
                    dragBoundFunc={dragBoundFunc}
                  />
                );
              }
              return null;
            })}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-left",
                "middle-right",
                "top-center",
                "bottom-center",
              ]}
              onTransformEnd={handleTransformEnd} // Attach handler here
            />

            {/* Selection Rectangle */}
            {selectionRect.visible && (
              <Rect
                x={(selectionRect.x - stagePos.x) / stageScale}
                y={(selectionRect.y - stagePos.y) / stageScale}
                width={selectionRect.width / stageScale}
                height={selectionRect.height / stageScale}
                fill="rgba(0, 0, 255, 0.2)"
                listening={false}
              />
            )}
            {showMouseInfo && (
              <>
                {/* Display Mouse Coordinates */}
                <Text
                  x={(mouseCoords.x - stagePos.x) / stageScale + 5 / stageScale}
                  y={
                    (mouseCoords.y - stagePos.y) / stageScale - 15 / stageScale
                  } // 10px above the cursor
                  text={`(${Math.round(
                    (mouseCoords.x - stagePos.x) / (stageScale * 10)
                  )}, ${Math.round(
                    (mouseCoords.y - stagePos.y) / (stageScale * 10)
                  )})`}
                  fontSize={12 / stageScale}
                  fill="black"
                />
                {/* Crosshair Lines */}
                <Line
                  points={[
                    (0 - stagePos.x) / stageScale,
                    (mouseCoords.y - stagePos.y) / stageScale,
                    CANVAS_WIDTH / stageScale,
                    (mouseCoords.y - stagePos.y) / stageScale,
                  ]} // Horizontal line
                  stroke="black"
                  strokeWidth={1 / stageScale}
                />
                <Line
                  points={[
                    (mouseCoords.x - stagePos.x) / stageScale,
                    (0 - stagePos.y) / stageScale,
                    (mouseCoords.x - stagePos.x) / stageScale,
                    CANVAS_HEIGHT / stageScale,
                  ]} // Vertical line
                  stroke="black"
                  strokeWidth={1 / stageScale}
                />
              </>
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;
