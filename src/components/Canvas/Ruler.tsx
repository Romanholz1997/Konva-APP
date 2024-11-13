import React from "react";
import { Stage, Layer, Text, Line } from "react-konva";
import "./custom.css";

const RULER_SIZE = 30;
const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 4000;

// Helper function to get a "nice" number for tick spacing
const niceNumber = (range: number) => {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);

  let niceFraction;

  if (fraction <= 1) {
    niceFraction = 1;
  } else if (fraction <= 2) {
    niceFraction = 2;
  } else if (fraction <= 5) {
    niceFraction = 5;
  } else {
    niceFraction = 10;
  }

  return niceFraction * Math.pow(10, exponent);
};

interface RulerProps {
  handleTopRulerWheel: React.WheelEventHandler<HTMLDivElement>;
  handleLeftRulerWheel: React.WheelEventHandler<HTMLDivElement>;
  scrollOffsetX: number;
  scrollOffsetY: number;
  stagePos: { x: number; y: number };
  stageScale: number;
}

const Ruler: React.FC<RulerProps> = ({
  handleTopRulerWheel,
  handleLeftRulerWheel,
  scrollOffsetX,
  scrollOffsetY,
  stagePos,
  stageScale,
}) => {
  const renderRulerMarks = (isHorizontal: boolean) => {
    const length = isHorizontal ? CANVAS_WIDTH : CANVAS_HEIGHT;
    const offset = isHorizontal ? stagePos.x : stagePos.y ;
    const offsetScroll = isHorizontal ? scrollOffsetX : scrollOffsetY ;

    // Minimum pixel spacing between ticks
    const minPixelSpacing = 100;

    // Pixels per unit at the current scale
    const pixelsPerUnit = stageScale * 10;

    // Units per tick, adjusted to a "nice" number
    const unitsPerTick = niceNumber(minPixelSpacing / pixelsPerUnit);

    // Start and end units for the loop
    // const startUnit =
    //   Math.floor(offset / (pixelsPerUnit * unitsPerTick)) * unitsPerTick;
    const endUnit =
      Math.ceil((offset + length) / (pixelsPerUnit * unitsPerTick)) *
      unitsPerTick;


    const marks = [];
    let startValue = 0;
    if(offset > 0)
    {
      startValue = -Math.round(offset);
    }    
    for (let unit = startValue; unit <= endUnit; unit += 1) {
      
      const position = unit * pixelsPerUnit + offset - offsetScroll;
      // Determine if it's a major tick (you can add logic for minor ticks if needed)
      let isMajorTick = false;
      if (unit % 10 === 0) {
        isMajorTick = true;
      }

      marks.push(
        <React.Fragment key={unit}>
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
              text={(unit).toString()}
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
      {/* Top Ruler */}
      <div className="ruler top-ruler" onWheel={handleTopRulerWheel}>
        <Stage
          width={CANVAS_WIDTH}
          height={RULER_SIZE}
          draggable={false}
          listening={false}
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
          listening={false}
        >
          <Layer>{renderRulerMarks(false)}</Layer>
        </Stage>
      </div>
    </>
  );
};

export default Ruler;
