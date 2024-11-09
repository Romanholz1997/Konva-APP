import React from "react";
import Sidebar from "./components/Canvas/Sidebar";
// import Canvas from "./components/Canvas/Canvas";
import Canvas from "./components/Canvas/Canvas";
const App: React.FC = () => {
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    shapeType: string
  ) => {
    const dataTransfer = e.dataTransfer; // Use the event object to get dataTransfer
    if (dataTransfer) {
      dataTransfer.setData("text/plain", shapeType); // Set shape type
    }
  };
  return (
    <div style={{ display: "flex" }}>
      <Sidebar onDragStart={handleDragStart} />
      <Canvas />
    </div>
    // <CanvasPan />
  );
};

export default App;

// src/App.tsx
// src/App.tsx
// src/App.tsx
// src/App.tsx
// src/App.tsx
// src/App.tsx
// src/App.tsx

// import React, { useRef, useState, useEffect } from "react";
// import { Stage, Layer, Rect, Transformer } from "react-konva";
// import Konva from "konva";

// interface ShapeProps {
//   id: string;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   fill: string;
//   rotation: number;
// }

// const initialShapes: ShapeProps[] = [
//   {
//     id: "rect1",
//     x: 60,
//     y: 60,
//     width: 100,
//     height: 90,
//     fill: "red",
//     rotation: 0,
//   },
//   {
//     id: "rect2",
//     x: 250,
//     y: 100,
//     width: 150,
//     height: 90,
//     fill: "green",
//     rotation: 0,
//   },
// ];

// const App: React.FC = () => {
//   const [shapes, setShapes] = useState<ShapeProps[]>(initialShapes);
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [selectionRect, setSelectionRect] = useState({
//     visible: false,
//     x: 0,
//     y: 0,
//     width: 0,
//     height: 0,
//   });
//   const [isSelecting, setIsSelecting] = useState(false);
//   const transformerRef = useRef<Konva.Transformer>(null);
//   const stageRef = useRef<Konva.Stage>(null);
//   const layerRef = useRef<Konva.Layer>(null);

//   const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
//     // Deselect shapes if clicked on empty area
//     if (e.target === stageRef.current) {
//       setSelectedIds([]);
//       const pos = stageRef.current?.getPointerPosition();
//       if (pos) {
//         setSelectionRect({
//           visible: true,
//           x: pos.x,
//           y: pos.y,
//           width: 0,
//           height: 0,
//         });
//         setIsSelecting(true);
//       }
//     }
//   };

//   const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
//     if (!isSelecting) {
//       return;
//     }
//     e.evt.preventDefault();

//     const pos = stageRef.current?.getPointerPosition();
//     if (pos && selectionRect.visible) {
//       const x = Math.min(pos.x, selectionRect.x);
//       const y = Math.min(pos.y, selectionRect.y);
//       const width = Math.abs(pos.x - selectionRect.x);
//       const height = Math.abs(pos.y - selectionRect.y);
//       setSelectionRect({
//         ...selectionRect,
//         x,
//         y,
//         width,
//         height,
//       });
//     }
//   };

//   const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
//     if (isSelecting) {
//       setIsSelecting(false);
//       setSelectionRect({
//         ...selectionRect,
//         visible: false,
//       });

//       const selBox = selectionRect;
//       const selected = shapes.filter((shape) => {
//         const shapeNode = layerRef.current?.findOne<Konva.Rect>(`#${shape.id}`);
//         if (shapeNode) {
//           return Konva.Util.haveIntersection(selBox, shapeNode.getClientRect());
//         }
//         return false;
//       });

//       setSelectedIds(selected.map((shape) => shape.id));
//     }
//   };

//   useEffect(() => {
//     const transformer = transformerRef.current;
//     if (transformer) {
//       const nodes = selectedIds
//         .map((id) => layerRef.current?.findOne<Konva.Rect>(`#${id}`))
//         .filter(Boolean) as Konva.Node[];
//       transformer.nodes(nodes);
//       transformer.getLayer()?.batchDraw();
//     }
//   }, [selectedIds]);

//   const handleShapeClick = (
//     e: Konva.KonvaEventObject<MouseEvent>,
//     id: string
//   ) => {
//     e.cancelBubble = true;

//     const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
//     const isSelected = selectedIds.includes(id);

//     if (!metaPressed && !isSelected) {
//       setSelectedIds([id]);
//     } else if (metaPressed && isSelected) {
//       setSelectedIds(selectedIds.filter((_id) => _id !== id));
//     } else if (metaPressed && !isSelected) {
//       setSelectedIds([...selectedIds, id]);
//     }
//   };

//   const handleTransformEnd = () => {
//     const transformer = transformerRef.current;
//     if (!transformer) return;

//     const transformedNodes = transformer.nodes();

//     const newShapes = shapes.map((shape) => {
//       const node = transformedNodes.find((n) => n.id() === shape.id);
//       if (node) {
//         const scaleX = node.scaleX();
//         const scaleY = node.scaleY();
//         const rotation = node.rotation();

//         // Reset scale to 1
//         node.scaleX(1);
//         node.scaleY(1);

//         return {
//           ...shape,
//           x: node.x(),
//           y: node.y(),
//           rotation,
//           width: Math.max(5, node.width() * scaleX),
//           height: Math.max(5, node.height() * scaleY),
//         };
//       } else {
//         return shape;
//       }
//     });

//     setShapes(newShapes);
//   };

//   const handleDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
//     const newShapes = shapes.map((shape) => {
//       if (shape.id === id) {
//         return {
//           ...shape,
//           x: e.target.x(),
//           y: e.target.y(),
//         };
//       }
//       return shape;
//     });
//     setShapes(newShapes);
//   };

//   return (
//     <Stage
//       width={window.innerWidth}
//       height={window.innerHeight}
//       ref={stageRef}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//     >
//       <Layer ref={layerRef}>
//         {shapes.map((shape) => (
//           <Rect
//             key={shape.id}
//             id={shape.id}
//             x={shape.x}
//             y={shape.y}
//             width={shape.width}
//             height={shape.height}
//             fill={shape.fill}
//             rotation={shape.rotation}
//             draggable
//             name="rect"
//             onClick={(e) => handleShapeClick(e, shape.id)}
//             // Remove onTransformEnd from individual shapes
//             onDragEnd={(e) => handleDragEnd(shape.id, e)}
//           />
//         ))}

//         {/* Transformer */}
//         <Transformer
//           ref={transformerRef}
//           rotateEnabled={true}
//           enabledAnchors={[
//             "top-left",
//             "top-right",
//             "bottom-left",
//             "bottom-right",
//             "middle-left",
//             "middle-right",
//             "top-center",
//             "bottom-center",
//           ]}
//           onTransformEnd={handleTransformEnd} // Attach handler here
//         />

//         {/* Selection Rectangle */}
//         {selectionRect.visible && (
//           <Rect
//             x={selectionRect.x}
//             y={selectionRect.y}
//             width={selectionRect.width}
//             height={selectionRect.height}
//             fill="rgba(0, 0, 255, 0.2)"
//             listening={false}
//           />
//         )}
//       </Layer>
//     </Stage>
//   );
// };

// export default App;
