// Select.tsx
import React from 'react';
import { Stage, Layer, Rect, Transformer, Circle } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import RightMenu from './RightContext';
import RightBar from './RightBar';


type ShapeType = 'rectangle' | 'circle' | 'star' | 'SVG';

interface ShapeProps {
    id: string;
    type: ShapeType;
    x: number;
    y: number;
    fill?: string;
    // Rectangle properties
    width?: number;
    height?: number;
    // Circle properties
    radius?: number;
    // Star properties
    innerRadius?: number;
    outerRadius?: number;
  }

interface RectangleProps {
  shapeProps: ShapeProps;
  onChange: (newAttrs: ShapeProps) => void;
}

const Rectangle: React.FC<RectangleProps> = ({ shapeProps, onChange }) => {
  const shapeRef = React.useRef<Konva.Rect>(null);

  return (
    <Rect
      ref={shapeRef}
      {...shapeProps}
      name="rectangle"
      draggable
      onDragEnd={(e) => {
        onChange({
          ...shapeProps,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (node) {
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }
      }}
    />
  );
};

const initialRectangles: ShapeProps[] = [
  {
    type:'rectangle',
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: '#FF6B60',
    id: 'rect1',
  },
  {
    type:'rectangle',
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: '#FF626B',
    id: 'rect2',
  },  
  {
    id:'circle1',
    type:'circle',
    x: 200,
    y: 200,
    fill: '#FF626B',
    radius:100

  }
];

const Select: React.FC = () => {
  const [rectangles, setRectangles] = React.useState<ShapeProps[]>(initialRectangles);
  const [selectedIds, selectShapes] = React.useState<string[]>([]);
  const trRef = React.useRef<Konva.Transformer>(null);
  const layerRef = React.useRef<Konva.Layer>(null);
  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number } | null>(null);

  const [editShapes, setEditShapes] = React.useState<ShapeProps[]>([]);

    // State for group position
  const [groupPosition, setGroupPosition] = React.useState<{ x: number; y: number } | null>(null);

  // Update editShapes whenever selectedIds changes
  React.useEffect(() => {
    updateEditShapes(selectedIds);
  
    if (selectedIds.length > 1) {
      // Multiple shapes selected, calculate group position
      const layer = layerRef.current;
      if (layer) {
        const selectedShapes = selectedIds
          .map((id) => layer.findOne<Konva.Rect>('#' + id))
          .filter((node): node is Konva.Rect => node !== null);
  
        if (selectedShapes.length > 0) {
          const boundingBox = getBoundingBox(selectedShapes);
          setGroupPosition({ x: boundingBox.x, y: boundingBox.y });
        }
      }
    } else {
      setGroupPosition(null);
    }
  }, [selectedIds, rectangles]);

  const handleGroupPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value);
    if (isNaN(newValue) || !groupPosition) return;
  
    const delta = {
      x: name === 'groupX' ? newValue - groupPosition.x : 0,
      y: name === 'groupY' ? newValue - groupPosition.y : 0,
    };
  
    // Update positions of selected shapes
    setRectangles((prevRectangles) =>
      prevRectangles.map((shape) => {
        if (selectedIds.includes(shape.id)) {
          return {
            ...shape,
            x: shape.x + delta.x,
            y: shape.y + delta.y,
          };
        } else {
          return shape;
        }
      })
    );
  
    // Update group position
    setGroupPosition((prevGroupPosition) => ({
      x: name === 'groupX' ? newValue : prevGroupPosition!.x,
      y: name === 'groupY' ? newValue : prevGroupPosition!.y,
    }));
  };

  const getBoundingBox = (shapes: Konva.Shape[]) => {
    const clientRects = shapes.map((shape) => shape.getClientRect());
    const minX = Math.min(...clientRects.map((rect) => rect.x));
    const minY = Math.min(...clientRects.map((rect) => rect.y));
    const maxX = Math.max(...clientRects.map((rect) => rect.x + rect.width));
    const maxY = Math.max(...clientRects.map((rect) => rect.y + rect.height));
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  React.useEffect(() => {
    if (layerRef.current && trRef.current) {
      const nodes = selectedIds
        .map((id) => layerRef.current!.findOne<Konva.Node>('#' + id))
        .filter((node): node is Konva.Node => node !== null);
      trRef.current.nodes(nodes);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  const selectionRectRef = React.useRef<Konva.Rect>(null);
  const selection = React.useRef<{
    visible: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  const updateSelectionRect = () => {
    const node = selectionRectRef.current;
    if (node) {
      node.setAttrs({
        visible: selection.current.visible,
        x: Math.min(selection.current.x1, selection.current.x2),
        y: Math.min(selection.current.y1, selection.current.y2),
        width: Math.abs(selection.current.x1 - selection.current.x2),
        height: Math.abs(selection.current.y1 - selection.current.y2),
        fill: 'rgba(0, 161, 255, 0.3)',
      });
      node.getLayer()?.batchDraw();
    }
  };

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    

    const isElement = e.target.findAncestor('.elements-container', true);
    const isTransformer = e.target.findAncestor('Transformer');
    if (isElement || isTransformer) {
      return;
    }

    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      selection.current.visible = true;
      selection.current.x1 = pos.x;
      selection.current.y1 = pos.y;
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    }
    if (e.target === e.target.getStage()) {
      selectShapes([]);
      setEditShapes([]);
      setGroupPosition(null);
      return;
    }
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selection.current.visible) {
      return;
    }
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    }
  };

  const onMouseUp = () => {
    if (selection.current.visible) {
      selection.current.visible = false;
      updateSelectionRect();

      const { x1, y1, x2, y2 } = selection.current;
      const selBox = selectionRectRef.current?.getClientRect();

      if (!selBox || !layerRef.current) {
        return;
      }

      const shapes = layerRef.current.find<Konva.Rect>('.rectangle');
      const selected: string[] = [];
      shapes.forEach((shape) => {
        if (Konva.Util.haveIntersection(selBox, shape.getClientRect())) {
          selected.push(shape.id());
        }
      });
      selectShapes(selected);
    }
  };

  const onClickTap = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Clicking on stage
    if (e.target === e.target.getStage()) {
      selectShapes([]);
      setEditShapes([]);
      return;
    }

    // Clicking on a rectangle
    if (!e.target.hasName('rectangle')) {
      return;
    }

    const id = e.target.id();
    const isSelected = selectedIds.includes(id);
    const isCtrlPressed = e.evt.ctrlKey || e.evt.metaKey;

    if (!isCtrlPressed && !isSelected) {
      // Single select (without modifier key)
      selectShapes([id]);
    } else if (isCtrlPressed && isSelected) {
      // Deselect shape
      selectShapes((prevSelectedIds) => prevSelectedIds.filter((sid) => sid !== id));
    } else if (isCtrlPressed && !isSelected) {
      // Add to selection
      selectShapes((prevSelectedIds) => [...prevSelectedIds, id]);
    }
  };

  const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault(); // Prevent the default context menu

    // Check if the right-clicked target is a rectangle
    if (!e.target.hasName('rectangle')) {
      // Right-clicked on a free area or non-rectangle shape
      // setMenuPos(null);
      return;
    }

    const id = e.target.id();
    // Check if the rectangle is among the selected rectangles
    if (!selectedIds.includes(id)) {
      selectShapes([id]);
    }
    const x = e.evt.clientX;
    const y = e.evt.clientY;
    setMenuPos({ x, y });
  };

  const handleCloseMenu = () => {
    setMenuPos(null);
  };

  const handleAlign = (alignment:  'left' | 'right' | 'top' | 'bottom') => {
    const layer = layerRef.current;
    if (!layer) return;
  
    const selectedShapes = selectedIds
      .map((id) => layer.findOne<Konva.Rect>('#' + id))
      .filter((node): node is Konva.Rect => node !== null);
  
    if (selectedShapes.length === 0) return;
  
    const clientRects = selectedShapes.map((shape) =>
      shape.getClientRect({ relativeTo: layer })
    );
  

    const minX = Math.min(...clientRects.map((rect) => rect.x));
    const minY = Math.min(...clientRects.map((rect) => rect.y));
    const maxX = Math.max(...clientRects.map((rect) => rect.x));
    const maxY = Math.max(...clientRects.map((rect) => rect.y));
  
    setRectangles((prevRectangles) => {
      return prevRectangles.map((rect) => {
        if (selectedIds.includes(rect.id)) {
          const shape = layer.findOne<Konva.Rect>('#' + rect.id);
          if (shape) {
            let clientRect = shape.getClientRect({ relativeTo: layer });
            const newMinX = minX - (clientRect.x - rect.x);
            const newMinY = minY - (clientRect.y - rect.y);
            const newMaxX = maxX - (clientRect.x - rect.x);
            const newMaxY = maxY - (clientRect.y - rect.y);
            switch(alignment) {
              case "left":
                return { ...rect, x: newMinX };
              case "right":
                return { ...rect, x: newMaxX };
              case "top":
                return { ...rect, y: newMinY };
              default:
                return { ...rect, y: newMaxY };
             
            }
          }
        }
        return rect;
      });
    });
  
    setMenuPos(null); // Close the menu after action
  };

  const deleteSelectedShapes = () => {
    if (selectedIds.length > 0) {
      // Filter out the selected shapes
      const newShapes = rectangles.filter((shape) => !selectedIds.includes(shape.id));

      // Update the shapes state
      setRectangles(newShapes);

      // Clear the selectedIds and editShapes
      selectShapes([]);
      setEditShapes([]);
    }
    setMenuPos(null); // Close the menu after action
  };

  const updateEditShapes = (ids: string[]) => {
    const selectedShapes = rectangles.filter((shape) => ids.includes(shape.id));
    setEditShapes(selectedShapes);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericProps = [
      'x',
      'y',
      'width',
      'height',
      'radius',
      'innerRadius',
      'outerRadius',
    ];
    setEditShapes((prevEditShapes) =>
      prevEditShapes.map((shape) => ({
        ...shape,
        [name]:
          numericProps.includes(name)
            ? parseFloat(value)
            : value,
      }))
    );
  };

  const handleSave = () => {
    setRectangles((prevShapes) =>
      prevShapes.map((shape) => {
        const editedShape = editShapes.find((s) => s.id === shape.id);
        return editedShape ? editedShape : shape;
      })  
    );
  };

  const getCommonProperty = (propName: keyof ShapeProps) => {
    if (editShapes.length === 0) {
      return '';
    }
    const firstValue = editShapes[0][propName];
    if (editShapes.every((shape) => shape[propName] === firstValue)) {
      return firstValue;
    } else {
      return '';
    }
  };
  const selectedShapeTypes = Array.from(new Set(editShapes.map((s) => s.type)));
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Stage
          width={window.innerWidth - 300} // Leave space for the sidebar
          height={window.innerHeight}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onClick={onClickTap}
          onTap={onClickTap}
          onContextMenu={handleContextMenu}
        >
          <Layer ref={layerRef}>
            {rectangles.map((shape, i) => (

                <Rectangle
                  key={shape.id}
                  shapeProps={shape}
                  onChange={(newAttrs) => {
                    const rects = rectangles.slice();
                    rects[i] = newAttrs;
                    setRectangles(rects);
                  }}
                />
            
              
            ))}
            <Transformer ref={trRef} />
            <Rect ref={selectionRectRef} />
          </Layer>
        </Stage>
        {/* {selectedIds.length > 0 && (
          <RightBar 
            handleSave={handleSave}
            handleInputChange={handleInputChange}
            handleGroupPositionChange={handleGroupPositionChange}
            selectedIds={selectedIds}
            groupPosition={groupPosition}
            getCommonProperty={getCommonProperty}
            selectedShapeTypes={selectedShapeTypes}

          />          
        )} */}
      </div>
      {/* {menuPos && (
        <RightMenu
          menuPosition={menuPos}
          onClose={handleCloseMenu}
          alignShapes={(alignment) => handleAlign(alignment)}
          handleDelete={deleteSelectedShapes}
        />
      )} */}
    </>
  );
};

export default Select;



// // Select.tsx
// import React from 'react';
// import { Stage, Layer, Rect, Transformer } from 'react-konva';
// import Konva from 'konva';
// import { KonvaEventObject } from 'konva/lib/Node';
// import RightMenu from './RightMenu';

// interface ShapeProps {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   fill: string;
//   id: string;
// }

// interface RectangleProps {
//   shapeProps: ShapeProps;
//   onChange: (newAttrs: ShapeProps) => void;
// }

// const Rectangle: React.FC<RectangleProps> = ({ shapeProps, onChange }) => {
//   const shapeRef = React.useRef<Konva.Rect>(null);

//   return (
//     <Rect
//       ref={shapeRef}
//       {...shapeProps}
//       name="rectangle"
//       draggable
//       onDragEnd={(e) => {
//         onChange({
//           ...shapeProps,
//           x: e.target.x(),
//           y: e.target.y(),
//         });
//       }}
//       onTransformEnd={() => {
//         const node = shapeRef.current;
//         if (node) {
//           const scaleX = node.scaleX();
//           const scaleY = node.scaleY();

//           node.scaleX(1);
//           node.scaleY(1);
//           onChange({
//             ...shapeProps,
//             x: node.x(),
//             y: node.y(),
//             width: Math.max(5, node.width() * scaleX),
//             height: Math.max(5, node.height() * scaleY),
//           });
//         }
//       }}
//     />
//   );
// };

// const initialRectangles: ShapeProps[] = [
//   {
//     x: 10,
//     y: 10,
//     width: 100,
//     height: 100,
//     fill: 'blue',
//     id: 'rect1',
//   },
//   {
//     x: 150,
//     y: 150,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 'rect2',
//   },
//   {
//     x: 100,
//     y: 190,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 'rect3',
//   },
//   {
//     x: 120,
//     y: 150,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 'rect4',
//   },
//   {
//     x: 200,
//     y: 190,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 'rect5',
//   },
//   {
//     x: 150,
//     y: 160,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 'rect6',
//   },
//   {
//     x: 200,
//     y: 100,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 'rect7',
//   },
// ];

// const Select: React.FC = () => {
//   const [rectangles, setRectangles] = React.useState<ShapeProps[]>(initialRectangles);
//   const [selectedIds, selectShapes] = React.useState<string[]>([]);
//   const trRef = React.useRef<Konva.Transformer>(null);
//   const layerRef = React.useRef<Konva.Layer>(null);
//   const [menuPos, setMenuPos] = React.useState<{ x: number; y: number } | null>(null);

//   React.useEffect(() => {
//     if (layerRef.current && trRef.current) {
//       const nodes = selectedIds
//         .map((id) => layerRef.current!.findOne<Konva.Node>('#' + id))
//         .filter((node): node is Konva.Node => node !== null);
//       trRef.current.nodes(nodes);
//       trRef.current.getLayer()?.batchDraw();
//     }
//   }, [selectedIds]);

//   const selectionRectRef = React.useRef<Konva.Rect>(null);
//   const selection = React.useRef<{
//     visible: boolean;
//     x1: number;
//     y1: number;
//     x2: number;
//     y2: number;
//   }>({
//     visible: false,
//     x1: 0,
//     y1: 0,
//     x2: 0,
//     y2: 0,
//   });

//   const updateSelectionRect = () => {
//     const node = selectionRectRef.current;
//     if (node) {
//       node.setAttrs({
//         visible: selection.current.visible,
//         x: Math.min(selection.current.x1, selection.current.x2),
//         y: Math.min(selection.current.y1, selection.current.y2),
//         width: Math.abs(selection.current.x1 - selection.current.x2),
//         height: Math.abs(selection.current.y1 - selection.current.y2),
//         fill: 'rgba(0, 161, 255, 0.3)',
//       });
//       node.getLayer()?.batchDraw();
//     }
//   };

//   const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
//     const isElement = e.target.findAncestor('.elements-container', true);
//     const isTransformer = e.target.findAncestor('Transformer');
//     if (isElement || isTransformer) {
//       return;
//     }

//     const pos = e.target.getStage()?.getPointerPosition();
//     if (pos) {
//       selection.current.visible = true;
//       selection.current.x1 = pos.x;
//       selection.current.y1 = pos.y;
//       selection.current.x2 = pos.x;
//       selection.current.y2 = pos.y;
//       updateSelectionRect();
//     }
//   };

//   const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
//     if (!selection.current.visible) {
//       return;
//     }
//     const pos = e.target.getStage()?.getPointerPosition();
//     if (pos) {
//       selection.current.x2 = pos.x;
//       selection.current.y2 = pos.y;
//       updateSelectionRect();
//     }
//   };

//   const onMouseUp = () => {
//     selection.current.visible = false;
//     updateSelectionRect();

//     const { x1, y1, x2, y2 } = selection.current;
//     const moved = x1 !== x2 || y1 !== y2;
//     if (!moved) {
//       return;
//     }
//     const selBox = selectionRectRef.current?.getClientRect();

//     if (!selBox || !layerRef.current) {
//       return;
//     }

//     const shapes = layerRef.current.find<Konva.Rect>('.rectangle');
//     const selected: string[] = [];
//     shapes.forEach((shape) => {
//       if (Konva.Util.haveIntersection(selBox, shape.getClientRect())) {
//         selected.push(shape.id());
//       }
//     });
//     selectShapes(selected);
//   };

//   const onClickTap = (e: Konva.KonvaEventObject<MouseEvent>) => {
//     const { x1, y1, x2, y2 } = selection.current;
//     const moved = x1 !== x2 || y1 !== y2;
//     if (moved) {
//       return;
//     }
//     const stage = e.target.getStage();
//     const layer = layerRef.current;
//     const tr = trRef.current;

//     if (e.target === stage) {
//       selectShapes([]);
//       return;
//     }

//     if (!e.target.hasName('rectangle')) {
//       return;
//     }

//     const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
//     const isSelected = tr && tr.nodes().indexOf(e.target) >= 0;

//     if (!metaPressed && !isSelected) {
//       selectShapes([e.target.id()]);
//     } else if (metaPressed && isSelected) {
//       selectShapes((oldSelected) => oldSelected.filter((id) => id !== e.target.id()));
//     } else if (metaPressed && !isSelected) {
//       selectShapes((oldSelected) => [...oldSelected, e.target.id()]);
//     }
//     layer?.batchDraw();
//   };

//   const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
//     e.evt.preventDefault(); // Prevent the default context menu

//     // Check if the right-clicked target is a rectangle
//     if (!e.target.hasName('rectangle')) {
//       // Right-clicked on a free area or non-rectangle shape
//       return;
//     }

//     // Check if the rectangle is among the selected rectangles
//     if (selectedIds.includes(e.target.id())) {
//       const x = e.evt.clientX;
//       const y = e.evt.clientY;
//       setMenuPos({ x, y });
//     } else {
//       // Optionally select the rectangle on right-click
//       selectShapes([e.target.id()]);
//       const x = e.evt.clientX;
//       const y = e.evt.clientY;
//       setMenuPos({ x, y });
//     }
//   };

//   const handleCloseMenu = () => {
//     setMenuPos(null);
//   };

//   const handleAlign = (alignment:  'left' | 'right' | 'top' | 'bottom') => {
//     const layer = layerRef.current;
//     if (!layer) return;
  
//     const selectedShapes = selectedIds
//       .map((id) => layer.findOne<Konva.Rect>('#' + id))
//       .filter((node): node is Konva.Rect => node !== null);
  
//     if (selectedShapes.length === 0) return;
  
//     const clientRects = selectedShapes.map((shape) =>
//       shape.getClientRect({ relativeTo: layer })
//     );
  

//     const minX = Math.min(...clientRects.map((rect) => rect.x));
//     const minY = Math.min(...clientRects.map((rect) => rect.y));
//     const maxX = Math.max(...clientRects.map((rect) => rect.x));
//     const maxY = Math.max(...clientRects.map((rect) => rect.y));
  
//     setRectangles((prevRectangles) => {
//       return prevRectangles.map((rect) => {
//         if (selectedIds.includes(rect.id)) {
//           const shape = layer.findOne<Konva.Rect>('#' + rect.id);
//           if (shape) {
//             let clientRect = shape.getClientRect({ relativeTo: layer });
//             const newMinX = minX - (clientRect.x - rect.x);
//             const newMinY = minY - (clientRect.y - rect.y);
//             const newMaxX = maxX - (clientRect.x - rect.x);
//             const newMaxY = maxY - (clientRect.y - rect.y);
//             switch(alignment) {
//               case "left":
//                 return { ...rect, x: newMinX };
//               case "right":
//                 return { ...rect, x: newMaxX };
//               case "top":
//                 return { ...rect, y: newMinY };
//               default:
//                 return { ...rect, y: newMaxY };
             
//             }
//           }
//         }
//         return rect;
//       });
//     });
  
//     setMenuPos(null); // Close the menu after action
//   };
//   const deleteSelectedShapes = () => {
//     if (selectedIds.length > 0) {
//       // Filter out the selected shapes
//       const newShapes = rectangles.filter(
//         (shape) => !selectedIds.includes(shape.id)
//       );

//       // Update the shapes state
//       setRectangles(newShapes);

//       // Clear the selectedIds
//       selectShapes([]);
//     }
//   };
  
//   return (
//     <>
//       <Stage
//         width={window.innerWidth}
//         height={window.innerHeight}
//         onMouseDown={onMouseDown}
//         onMouseMove={onMouseMove}
//         onMouseUp={onMouseUp}
//         onClick={onClickTap}
//         onTap={onClickTap}
//         onContextMenu={handleContextMenu}
//       >
//         <Layer ref={layerRef}>
//           {rectangles.map((rect, i) => (
//             <Rectangle
//               key={rect.id}
//               shapeProps={rect}
//               onChange={(newAttrs) => {
//                 const rects = rectangles.slice();
//                 rects[i] = newAttrs;
//                 setRectangles(rects);
//               }}
//             />
//           ))}
//           <Transformer ref={trRef} />
//           <Rect ref={selectionRectRef} />
//         </Layer>
//       </Stage>
//       {menuPos && (
//         <RightMenu
//           menuPosition={menuPos}
//           onClose={handleCloseMenu}
//           alignShapes={(alignment) => handleAlign(alignment)}
//           handleDelete={deleteSelectedShapes}
//         />
//       )}
//     </>
//   );
// };

// export default Select;
