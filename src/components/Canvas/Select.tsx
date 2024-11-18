import React from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import Konva from "konva";

interface ShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  id: string;
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
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: "blue",
    id: "rect1",
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: "green",
    id: "rect2",
  },
];

const Select: React.FC = () => {
  const [rectangles, setRectangles] = React.useState<ShapeProps[]>(initialRectangles);
  const [selectedIds, selectShapes] = React.useState<string[]>([]);
  const trRef = React.useRef<Konva.Transformer>(null);
  const layerRef = React.useRef<Konva.Layer>(null);

  React.useEffect(() => {
    if (layerRef.current && trRef.current) {
      const nodes = selectedIds
        .map((id) => layerRef.current!.findOne<Konva.Node>("#" + id))
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
        fill: "rgba(0, 161, 255, 0.3)",
      });
      node.getLayer()?.batchDraw();
    }
  };

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isElement = e.target.findAncestor(".elements-container", true);
    const isTransformer = e.target.findAncestor("Transformer");
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
    selection.current.visible = false;
    updateSelectionRect();

    const { x1, y1, x2, y2 } = selection.current;
    const moved = x1 !== x2 || y1 !== y2;
    if (!moved) {
      return;
    }
    const selBox = selectionRectRef.current?.getClientRect();

    if (!selBox || !layerRef.current) {
      return;
    }

    const shapes = layerRef.current.find<Konva.Rect>(".rectangle");
    const selected: string[] = [];
    shapes.forEach((shape) => {
      if (Konva.Util.haveIntersection(selBox, shape.getClientRect())) {
        selected.push(shape.id());
      }
    });
    selectShapes(selected);
  };

  const onClickTap = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const { x1, y1, x2, y2 } = selection.current;
    const moved = x1 !== x2 || y1 !== y2;
    if (moved) {
      return;
    }
    const stage = e.target.getStage();
    const layer = layerRef.current;
    const tr = trRef.current;

    if (e.target === stage) {
      selectShapes([]);
      return;
    }

    if (!e.target.hasName("rectangle")) {
      return;
    }

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr && tr.nodes().indexOf(e.target) >= 0;

    if (!metaPressed && !isSelected) {
      selectShapes([e.target.id()]);
    } else if (metaPressed && isSelected) {
      selectShapes((oldSelected) => oldSelected.filter((id) => id !== e.target.id()));
    } else if (metaPressed && !isSelected) {
      selectShapes((oldSelected) => [...oldSelected, e.target.id()]);
    }
    layer?.batchDraw();
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={onClickTap}
      onTap={onClickTap}
    >
      <Layer ref={layerRef}>
        {rectangles.map((rect, i) => (
          <Rectangle
            key={rect.id}
            shapeProps={rect}
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
  );
};

export default Select;