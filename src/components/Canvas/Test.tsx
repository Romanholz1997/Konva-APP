import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Transformer, Group } from 'react-konva';
import Konva from 'konva';

interface ShapeProps {
  id: string;
  x: number;
  y: number;
  type: 'rect' | 'circle';
  width?: number;
  height?: number;
  radius?: number;
  groupId?: string | null;
}

const CanvasComponent: React.FC = () => {
  // Initialize shapes
  const [shapes, setShapes] = useState<ShapeProps[]>([
    { id: 'rect1', x: 50, y: 50, width: 100, height: 100, type: 'rect', groupId: null },
    { id: 'rect2', x: 200, y: 200, width: 100, height: 100, type: 'rect', groupId: null },
    { id: 'rect3', x: 100, y: 50, width: 100, height: 100, type: 'rect', groupId: null },
    { id: 'rect4', x: 200, y: 300, width: 100, height: 100, type: 'rect', groupId: null },
    { id: 'circle1', x: 400, y: 300, radius: 50, type: 'circle', groupId: null },
    // Add more shapes as needed
  ]);

  // State to keep track of selected shapes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selection rectangle state
  const [selectionRect, setSelectionRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // For dragging multiple shapes
  const dragStartPositions = useRef<{ [key: string]: { x: number; y: number } }>({});

  // State to hold the group selection bounding box
  const [groupBoundingBox, setGroupBoundingBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Function to check if shape is selected
  const isSelected = (id: string) => selectedIds.includes(id);

  // Function to check if shapes are grouped
  const areShapesGrouped = () => {
    const groupIds = selectedIds.map((id) => {
      const shape = shapes.find((s) => s.id === id);
      return shape?.groupId;
    });
    return groupIds.every((gid) => gid && gid === groupIds[0]);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicked on empty area
    if (e.target === e.target.getStage()) {
      setSelectedIds([]);
      setIsSelecting(true);
      const pos = stageRef.current!.getPointerPosition()!;
      setSelectionRect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      });
    }
    // Hide context menu
    setContextMenuVisible(false);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isSelecting) return;
    const pos = stageRef.current!.getPointerPosition()!;
    const sx = selectionRect!.x;
    const sy = selectionRect!.y;
    setSelectionRect({
      x: sx,
      y: sy,
      width: pos.x - sx,
      height: pos.y - sy,
    });
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      const selBox = selectionRect!;
      const shapesToSelect: string[] = [];
      const box = {
        x: Math.min(selBox.x, selBox.x + selBox.width),
        y: Math.min(selBox.y, selBox.y + selBox.height),
        width: Math.abs(selBox.width),
        height: Math.abs(selBox.height),
      };

      const container = layerRef.current;
      if (!container) return;

      // Step 1: Handle grouped shapes
      const groupIds = Array.from(new Set(shapes.map(shape => shape.groupId).filter(gid => gid !== null))) as string[];

      groupIds.forEach(groupId => {
        const groupNode = container.findOne(`#${groupId}`) as Konva.Group | undefined;
        if (groupNode) {
          const groupBox = groupNode.getClientRect();
          if (Konva.Util.haveIntersection(box, groupBox)) {
            const groupShapes = shapes.filter(shape => shape.groupId === groupId);
            groupShapes.forEach(shape => {
              if (!shapesToSelect.includes(shape.id)) {
                shapesToSelect.push(shape.id);
              }
            });
          }
        }
      });

      // Step 2: Handle ungrouped shapes
      shapes.forEach((shape) => {
        if (shape.groupId) {
          // Skip shapes that are part of a group
          return;
        }
        const shapeNode = container.findOne('#' + shape.id) as Konva.Node;
        if (shapeNode) {
          const shapeBox = shapeNode.getClientRect();
          if (Konva.Util.haveIntersection(box, shapeBox)) {
            shapesToSelect.push(shape.id);
          }
        }
      });

      setSelectedIds(shapesToSelect);
      setIsSelecting(false);
      setSelectionRect(null);
    }
  };

  // Update Transformer and group bounding box
  useEffect(() => {
    const transformer = trRef.current;
    const layer = layerRef.current;
    if (transformer && layer) {
      const nodes = selectedIds
        .map((id) => layer.findOne('#' + id))
        .filter((node): node is Konva.Node => node !== null && node !== undefined);
      transformer.nodes(nodes);
      transformer.getLayer()?.batchDraw();

      if (selectedIds.length > 1) {
        // Calculate bounding box for group selection
        const boundingBox = transformer.getClientRect();
        setGroupBoundingBox({
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        });
      } else {
        setGroupBoundingBox(null);
      }
    }
  }, [selectedIds, shapes]);

  const handleShapeClick = (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    e.cancelBubble = true;
    const isShiftKey = e.evt.shiftKey;
    if (isShiftKey) {
      // Add or remove shape from selection
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      // Single selection
      setSelectedIds([id]);
    }
    // Hide context menu
    setContextMenuVisible(false);
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    if (selectedIds.length > 0) {
      // Show custom context menu
      const containerRect = stageRef.current!.container().getBoundingClientRect();
      setContextMenuPosition({
        x: e.evt.clientX,
        y: e.evt.clientY,
      });
      setContextMenuVisible(true);
    } else {
      // Hide context menu
      setContextMenuVisible(false);
    }
  };

  const handleGroup = () => {
    const newGroupId = 'group-' + Date.now();
    const updatedShapes = shapes.map((shape) => {
      if (selectedIds.includes(shape.id)) {
        return { ...shape, groupId: newGroupId };
      }
      return shape;
    });
    setShapes(updatedShapes);
    setSelectedIds([]);
    setContextMenuVisible(false);
  };

  const handleUngroup = () => {
    const updatedShapes = shapes.map((shape) => {
      if (selectedIds.includes(shape.id)) {
        return { ...shape, groupId: null };
      }
      return shape;
    });
    setShapes(updatedShapes);
    setSelectedIds([]);
    setContextMenuVisible(false);
  };

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (selectedIds.length > 0) {
      const pos: { [key: string]: { x: number; y: number } } = {};
      selectedIds.forEach((id) => {
        const node = layerRef.current!.findOne('#' + id) as Konva.Node | undefined;
        if (node) {
          pos[id] = { x: node.x(), y: node.y() };
        }
      });
      dragStartPositions.current = pos;
      dragStartPositions.current['group'] = { x: e.target.x(), y: e.target.y() };
    }
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (selectedIds.length > 0) {
      const deltaX = e.target.x() - dragStartPositions.current['group'].x;
      const deltaY = e.target.y() - dragStartPositions.current['group'].y;

      selectedIds.forEach((id) => {
        const node = layerRef.current!.findOne('#' + id) as Konva.Node | undefined;
        const startPos = dragStartPositions.current[id];
        if (node && startPos) {
          node.position({
            x: startPos.x + deltaX,
            y: startPos.y + deltaY,
          });
        }
      });
      layerRef.current!.batchDraw();
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Update shapes' positions
    const updatedShapes = shapes.map((shape) => {
      const node = layerRef.current!.findOne('#' + shape.id) as Konva.Node | undefined;
      if (node) {
        return { ...shape, x: node.x(), y: node.y() };
      }
      return shape;
    });
    setShapes(updatedShapes);
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{ position: 'relative', userSelect: 'none' }}
    >
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        ref={stageRef}
      >
        <Layer ref={layerRef}>
          {/* Draw groups and shapes */}
          {(() => {
            const groupedShapes = shapes.reduce((acc, shape) => {
              if (shape.groupId) {
                if (!acc[shape.groupId]) {
                  acc[shape.groupId] = [];
                }
                acc[shape.groupId].push(shape);
              }
              return acc;
            }, {} as { [key: string]: ShapeProps[] });

            const ungroupedShapes = shapes.filter((shape) => !shape.groupId);

            const elements: React.ReactNode[] = [];

            // Render grouped shapes
            Object.keys(groupedShapes).forEach((groupId) => {
              const groupShapes = groupedShapes[groupId];
              elements.push(
                <Group
                  key={groupId}
                  id={groupId}
                  draggable
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    const ids = groupShapes.map((shape) => shape.id);
                    setSelectedIds(ids);
                    setContextMenuVisible(false);
                  }}
                  onContextMenu={handleContextMenu}
                >
                  {groupShapes.map((shape) => {
                    const isSelectedShape = isSelected(shape.id);
                    const commonProps = {
                      key: shape.id,
                      id: shape.id,
                      x: shape.x,
                      y: shape.y,
                      draggable: false,
                      // **Removed onClick to prevent individual selection within group**
                      // onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleShapeClick(e, shape.id),
                    };

                    if (shape.type === 'rect') {
                      return (
                        <Rect
                          {...commonProps}
                          width={shape.width}
                          height={shape.height}
                          fill={isSelectedShape ? 'green' : 'red'}
                          // Removed onClick handler
                        />
                      );
                    } else if (shape.type === 'circle') {
                      return (
                        <Circle
                          {...commonProps}
                          radius={shape.radius}
                          fill={isSelectedShape ? 'green' : 'blue'}
                          // Removed onClick handler
                        />
                      );
                    }
                    return null;
                  })}
                </Group>
              );
            });

            // Render ungrouped shapes
            elements.push(
              ungroupedShapes.map((shape) => {
                const isSelectedShape = isSelected(shape.id);
                const commonProps = {
                  key: shape.id,
                  id: shape.id,
                  x: shape.x,
                  y: shape.y,
                  draggable: true,
                  onDragStart: handleDragStart,
                  onDragMove: handleDragMove,
                  onDragEnd: handleDragEnd,
                  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleShapeClick(e, shape.id),
                  onContextMenu: handleContextMenu,
                };

                if (shape.type === 'rect') {
                  return (
                    <Rect
                      {...commonProps}
                      width={shape.width}
                      height={shape.height}
                      fill={isSelectedShape ? 'green' : 'red'}
                    />
                  );
                } else if (shape.type === 'circle') {
                  return (
                    <Circle
                      {...commonProps}
                      radius={shape.radius}
                      fill={isSelectedShape ? 'green' : 'blue'}
                    />
                  );
                }
                return null;
              })
            );

            return elements;
          })()}

          {/* Invisible Rect to cover group selection */}
          {groupBoundingBox && (
            <Rect
              x={groupBoundingBox.x}
              y={groupBoundingBox.y}
              width={groupBoundingBox.width}
              height={groupBoundingBox.height}
              fill="rgba(0,0,0,0)" // Fully transparent
              draggable
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              // onClick={(e) => (e.cancelBubble = true)}
              onContextMenu={handleContextMenu}
            />
          )}

          {/* Selection Rectangle */}
          {isSelecting && selectionRect && (
            <Rect
              fill="rgba(0,161,255,0.5)"
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
            />
          )}

          {/* Transformer */}
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => newBox}
            ignoreStroke
            rotateEnabled={false}
            enabledAnchors={[
              'top-left',
              'top-center',
              'top-right',
              'middle-left',
              'middle-right',
              'bottom-left',
              'bottom-center',
              'bottom-right',
            ]}
          />
        </Layer>
      </Stage>

      {/* Custom Context Menu */}
      {contextMenuVisible && (
        <div
          style={{
            position: 'absolute',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            boxShadow: '0px 0px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          {!areShapesGrouped() ? (
            <div
              style={{ padding: '8px', cursor: 'pointer' }}
              onClick={handleGroup}
            >
              Group
            </div>
          ) : (
            <div
              style={{ padding: '8px', cursor: 'pointer' }}
              onClick={handleUngroup}
            >
              Ungroup
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;
