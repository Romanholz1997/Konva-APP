import React from 'react';
import {
    ShapePropertyKey
} from "../../types/types";

type ShapeType = 'rectangle' | 'circle' | 'star' | 'SVG';

interface CustomRightMenu {
    handleSave: () => void;
    getCommonProperty: (propName: ShapePropertyKey) => string | number;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGroupPositionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    groupPosition: {x: number, y: number} | null;
    selectedIds: string[];
    selectedShapeTypes: ShapeType[];
}

const RightBar: React.FC<CustomRightMenu> = ({
    handleSave,
    getCommonProperty,
    handleInputChange,
    handleGroupPositionChange,
    groupPosition,
    selectedIds,
    selectedShapeTypes
}) => {
  return (
    <div
      style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: '300px',
          height: '100vh',
          background: '#f8f9fa',
          padding: 20,
          boxSizing: 'border-box',
          borderLeft: '1px solid #dee2e6',
          overflowY: 'auto',
          fontFamily: 'Arial, sans-serif',
          zIndex: 5000
      }}
    >
      <h2 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
        Shape Properties
      </h2>
      <div style={{ marginBottom: '15px' }}>
        <strong>Selected Shapes:</strong> {selectedIds.join(', ')}
      </div>            
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Common properties */}
        {selectedIds.length > 1 && groupPosition && (
          <>
              <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                  Group X Position:
              </label>
              <input
                  type="number"
                  name="groupX"
                  min={50} // Set your desired minimum value here
                  max={3950} // Set your desired maximum value here
                  value={Math.round(groupPosition.x)}
                  onChange={handleGroupPositionChange}                  
                  style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  }}
              />
              </div>
              <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                  Group Y Position:
              </label>
              <input
                  type="number"
                  name="groupY"
                  min={50} // Set your desired minimum value here
                  max={3950} // Set your desired maximum value here
                  value={Math.round(groupPosition.y)}
                  onChange={handleGroupPositionChange}
                  style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  }}
              />
              </div>
          </>
          )}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>X Position:</label>
          <input
            type="number"
            name="x"
            min={50} // Set your desired minimum value here
            max={3950} // Set your desired maximum value here
            value={getCommonProperty('x') as number || ''}
            onChange={handleInputChange}           
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Y Position:</label>
          <input
            type="number"
            name="y"
            min={50} // Set your desired minimum value here
            max={3950} // Set your desired maximum value here
            value={getCommonProperty('y') as number || ''}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
          />
        </div>
        {/* Type-specific properties */}
        {selectedShapeTypes.length === 1 && selectedShapeTypes[0] === 'rectangle' && (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Width:</label>
              <input
                type="number"
                name="width"
                value={getCommonProperty('width') as number || ''}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Height:</label>
              <input
                type="number"
                name="height"
                value={getCommonProperty('height') as number || ''}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                }}
              />
            </div>
          </>
        )}
        {selectedShapeTypes.length === 1 && selectedShapeTypes[0] === 'circle' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Radius:</label>
            <input
              type="number"
              name="radius"
              value={getCommonProperty('radius') as number || ''}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
              }}
            />
          </div>
        )}
        {selectedShapeTypes.length === 1 && selectedShapeTypes[0] === 'star' && (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Inner Radius:
              </label>
              <input
                type="number"
                name="innerRadius"
                value={getCommonProperty('innerRadius') as number || ''}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Outer Radius:
              </label>
              <input
                type="number"
                name="outerRadius"
                value={getCommonProperty('radius') as number || ''}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                }}
              />
            </div>
          </>
        )}
        {/* Rotation */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Rotation:
          </label>
          <input
            type="number"
            name="rotation"
            value={getCommonProperty('rotation') as number || 0}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
          />
        </div>
        {/* Fill Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Fill Color:</label>
          <input
            type="color"
            name="fill"
            value={getCommonProperty('fill') as string || '#000000'}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              height: '40px',
            }}
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        style={{
          marginTop: '20px',
          padding: '12px',
          width: '100%',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Save Changes
      </button>
    </div>
  );
};

export default RightBar;
