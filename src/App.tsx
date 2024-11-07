// src/App.tsx
// import React, { useState } from "react";
// import DraggableList from "./components/DraggableList";
// import Canvas from "./components/Canvas";

// const App: React.FC = () => {
//   const [selectedItem, setSelectedItem] = useState<string | null>(null);

//   const handleItemSelect = (item: string) => {
//     setSelectedItem(item);
//   };

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       <div
//         style={{
//           width: "500px",
//           borderRight: "1px solid #ccc",
//           padding: "10px",
//         }}
//       >
//         <h3>Items</h3>
//         <DraggableList onItemSelect={handleItemSelect} />
//       </div>
//       <div style={{ flex: 1, position: "relative" }}>
//         <Canvas selectedItem={selectedItem} />
//       </div>
//     </div>
//   );
// };

// export default App;

// // src/App.tsx
// import React from "react";
// import { Stage, Layer, Line, Text } from "react-konva";
// import Ruler from "./components/Ruler";
// const App: React.FC = () => {
//   const rulerLength = 600; // Length of the rulers
//   const tickSpacing = 20; // Spacing between ticks

//   return (
//     <div>
//       <Stage width={window.innerWidth} height={window.innerHeight}>
//         <Layer>
//           {/* Horizontal Ruler */}
//           <Ruler
//             orientation="horizontal"
//             length={rulerLength}
//             tickSpacing={tickSpacing}
//           />
//           {/* Vertical Ruler */}
//           <Ruler
//             orientation="vertical"
//             length={rulerLength}
//             tickSpacing={tickSpacing}
//           />
//         </Layer>
//       </Stage>
//     </div>
//   );
// };
// src/App.tsx
// src/App.tsx
// src/App.tsx
// src/App.tsx
// src/App.tsx
// src/App.tsx
import React from "react";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";

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
      <Main />
    </div>
  );
};

export default App;

// import React, { useState } from "react";
// import { Stage, Layer } from "react-konva";
// import Rectangle from "./components/Rectangle";
// import { RectangleAttrs } from "./types";
// import Konva from "konva";

// const initialRectangles: RectangleAttrs[] = [
//   {
//     x: 10,
//     y: 10,
//     width: 100,
//     height: 100,
//     fill: "red",
//     id: "rect1",
//   },
//   {
//     x: 150,
//     y: 150,
//     width: 100,
//     height: 100,
//     fill: "green",
//     id: "rect2",
//   },
//   {
//     x: 150,
//     y: 250,
//     width: 100,
//     height: 100,
//     fill: "green",
//     id: "rect3",
//   },
// ];

// const App: React.FC = () => {
//   const [rectangles, setRectangles] =
//     useState<RectangleAttrs[]>(initialRectangles);
//   const [selectedId, selectShape] = useState<string | null>(null);

//   const checkDeselect = (
//     e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
//   ) => {
//     // Deselect when clicked on empty area
//     const clickedOnEmpty = e.target === e.target.getStage();
//     if (clickedOnEmpty) {
//       selectShape(null);
//     }
//   };

//   return (
//     <Stage
//       width={window.innerWidth}
//       height={window.innerHeight}
//       onMouseDown={checkDeselect}
//       onTouchStart={checkDeselect}
//     >
//       <Layer>
//         {rectangles.map((rect, i) => (
//           <Rectangle
//             key={rect.id} // Use unique ID for keys
//             shapeProps={rect}
//             isSelected={rect.id === selectedId}
//             onSelect={() => {
//               selectShape(rect.id);
//             }}
//             onChange={(newAttrs: RectangleAttrs) => {
//               const rects = rectangles.slice();
//               rects[i] = newAttrs;
//               setRectangles(rects);
//             }}
//           />
//         ))}
//       </Layer>
//     </Stage>
//   );
// };

// export default App;
