import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Text, Line } from "react-konva";
import Konva from "konva";
import "./custom.css";

const RULER_SIZE = 30;
const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 4000;
const RULER_TICK_SPACING = 10;
const RULER_NUMBER_SPACING = 100;
interface RulerProps {
  scrollOffsetX: number;
  scrollOffsetY: number;
  handleTopRulerWheel: React.WheelEventHandler<HTMLDivElement>;
  handleLeftRulerWheel: React.WheelEventHandler<HTMLDivElement>;
}
const Ruler: React.FC<RulerProps> = ({
  scrollOffsetX,
  scrollOffsetY,
  handleTopRulerWheel,
  handleLeftRulerWheel,
}) => {
  const renderRulerMarks = (isHorizontal: boolean) => {
    const length = isHorizontal ? CANVAS_WIDTH : CANVAS_HEIGHT;
    const marks = [];
    const offset = isHorizontal ? scrollOffsetX : scrollOffsetY;

    for (let i = 0; i <= length; i += RULER_TICK_SPACING) {
      const position = i - offset;
      const isMajorTick = i % RULER_NUMBER_SPACING === 0;

      marks.push(
        <React.Fragment key={i}>
          {/* Tick marks */}
          <Line
            points={
              isHorizontal
                ? [
                    position,
                    RULER_SIZE,
                    position,
                    isMajorTick ? 0 : RULER_SIZE / 2,
                  ]
                : [
                    RULER_SIZE,
                    position,
                    isMajorTick ? 0 : RULER_SIZE / 2,
                    position,
                  ]
            }
            stroke="gray"
            strokeWidth={1}
          />
          {/* Numbers */}
          {isMajorTick && (
            <Text
              x={isHorizontal ? position + 4 : 4}
              y={isHorizontal ? 4 : position + 4}
              text={(i / RULER_TICK_SPACING).toString()}
              fontSize={10}
              fill="black"
            />
          )}
        </React.Fragment>
      );
    }
    return marks;
  };
  return (
    <>
      <div className="ruler top-ruler" onWheel={handleTopRulerWheel}>
        <Stage
          width={CANVAS_WIDTH}
          height={RULER_SIZE}
          draggable={false}
          listening={false} // Prevent Konva from handling pointer events
        >
          <Layer>{renderRulerMarks(true)}</Layer>
        </Stage>
      </div>

      {/* Left Ruler */}
      <div className="ruler left-ruler" onWheel={handleLeftRulerWheel}>
        <Stage
          width={RULER_SIZE}
          height={CANVAS_HEIGHT}
          draggable={false}
          listening={false} // Prevent Konva from handling pointer events
        >
          <Layer>{renderRulerMarks(false)}</Layer>
        </Stage>
      </div>
    </>
  );
};

export default Ruler;
