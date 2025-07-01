import React, { useState, useRef, useMemo } from 'react';
import { MolCard } from './MolCard';
import { useAuthStore } from '../providers/auth';
import { COMMERCIAL_SCORE_MAP } from '../utils';
import './InlineMoleculeRenderer.css';

// Component for individual clickable and hoverable molecule links
const MoleculeLink = ({ text, data, style, onMoleculeClick }) => {
  const [hoveredObject, setHoveredObject] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const linkRef = useRef(null);
  const hoverRef = useRef(null);
  const userPermissions = useAuthStore(state => state.userPermissions);

  const handleMouseEnter = (e) => {
    if (data && data.length > 0) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setHoveredObject({ data: data[0] });
    }
  };

  const handleMouseLeave = () => {
    setHoveredObject(null);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (data && data.length > 0 && onMoleculeClick) {
      // Transform the molecule data to the format expected by the sidebar
      const moleculeData = data[0];
      const transformedMolecule = {
        name: text,
        SMILES: moleculeData.SMILES,
        molecular_weight: moleculeData.molecular_weight,
        HOMO_eV: moleculeData.HOMO_eV,
        LUMO_eV: moleculeData.LUMO_eV,
        ESP_min_eV: moleculeData.ESP_min_eV,
        ESP_max_eV: moleculeData.ESP_max_eV,
        predicted_MP_celsius: moleculeData.predicted_MP_celsius,
        predicted_BP_celsius: moleculeData.predicted_BP_celsius,
        predicted_FP_celsius: moleculeData.predicted_FP_celsius,
        COMBUSTION_ENTHALPY_EV: moleculeData.COMBUSTION_ENTHALPY_EV,
        COMMERCIAL_SCORE: moleculeData.COMMERCIAL_SCORE,
        COMMERCIAL_LINK: moleculeData.COMMERCIAL_LINK,
        functional_groups: moleculeData.functional_groups || "[]",
        UMAP_0: moleculeData.UMAP_0,
        UMAP_1: moleculeData.UMAP_1
      };
      onMoleculeClick(transformedMolecule);
    }
  };

  // Calculate popup position based on mouse position
  const position = useMemo(() => {
    if (!hoveredObject || !linkRef.current) return {};

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 450; // Estimated popup width
    const popupHeight = 300; // Estimated popup height

    let left = mousePosition.x + 10;
    let top = mousePosition.y + 10;

    // Adjust if popup would go off right edge
    if (left + popupWidth > viewportWidth) {
      left = mousePosition.x - popupWidth - 10;
    }

    // Adjust if popup would go off bottom edge
    if (top + popupHeight > viewportHeight) {
      top = mousePosition.y - popupHeight - 10;
    }

    // Ensure popup doesn't go off left or top edges
    left = Math.max(10, left);
    top = Math.max(10, top);

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 1000
    };
  }, [hoveredObject, mousePosition]);

  // Transform the inline molecule data to MolCard format for hover popup
  const transformToMolCardProps = (moleculeData) => {
    if (!moleculeData) return [];

    const propGroups = [
      { label: 'SMILES', value: moleculeData.SMILES, span: 2 },
      { label: 'Mol Weight', value: moleculeData.molecular_weight, suffix: ' g/mol' },
      { label: 'UMAP X', value: moleculeData.UMAP_0?.toFixed(2) },
      { label: 'UMAP Y', value: moleculeData.UMAP_1?.toFixed(2) },
      { label: 'HOMO', value: moleculeData.HOMO_eV?.toFixed(2), suffix: ' eV' },
      { label: 'LUMO', value: moleculeData.LUMO_eV?.toFixed(2), suffix: ' eV' },
      { label: 'ESP Max', value: moleculeData.ESP_max_eV?.toFixed(2), suffix: ' eV' },
      { label: 'ESP Min', value: moleculeData.ESP_min_eV?.toFixed(2), suffix: ' eV' },
    ];

    // Add permission-restricted properties
    if (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') {
      propGroups.push(
        { label: 'Predicted MP', value: moleculeData.predicted_MP_celsius?.toFixed(1), suffix: ' °C' },
        { label: 'Predicted BP', value: moleculeData.predicted_BP_celsius?.toFixed(1), suffix: ' °C' },
        { label: 'Predicted FP', value: moleculeData.predicted_FP_celsius?.toFixed(1), suffix: ' °C' },
        { label: 'Combustion Enthalpy', value: moleculeData.COMBUSTION_ENTHALPY_EV?.toFixed(2), suffix: ' eV' }
      );
    }

    // Add commercial score if available
    if (moleculeData.COMMERCIAL_SCORE !== undefined) {
      propGroups.push({
        label: 'Commercial Viability',
        value: COMMERCIAL_SCORE_MAP[moleculeData.COMMERCIAL_SCORE],
        span: 2,
        wrap: true
      });
    }

    return propGroups.filter(prop => prop.value !== undefined && prop.value !== null);
  };

  const propGroups = hoveredObject ? transformToMolCardProps(hoveredObject.data) : [];

  return (
    <>
      <span
        ref={linkRef}
        className="inline-molecule-link"
        style={{ ...style, cursor: 'pointer' }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={`Hover to preview • Click to view full details for ${text}`}
      >
        {text}
      </span>
      {hoveredObject && propGroups.length > 0 && (
        <div style={position}>
          <MolCard
            ref={hoverRef}
            showMoreDetails={true}
            propGroups={propGroups}
            onMouseEnter={() => {
              // Keep popup open when hovering over it
            }}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      )}
    </>
  );
};

// Main component for parsing and rendering inline molecules
export const InlineMoleculeRenderer = ({ content, onMoleculeClick }) => {
  // Parse inline molecules from content
  const parseInlineMolecules = (text) => {
    // More flexible regex that captures the full inline_molecule structure
    const inlineMoleculeRegex = /<inline_molecule>(\{.*?\})<\/inline_molecule>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = inlineMoleculeRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Parse the molecule data
      try {
        const fullDataString = match[1];
        
        // Parse the outer JSON structure
        const outerData = JSON.parse(fullDataString);
        const moleculeText = outerData.text;
        const dataArray = outerData.data;
        
        if (dataArray && dataArray.length > 0) {
          parts.push({
            type: 'molecule',
            text: moleculeText,
            data: dataArray
          });
        } else {
          // Fall back to plain text if no data
          parts.push({
            type: 'text',
            content: moleculeText
          });
        }
      } catch (error) {
        console.error('Error parsing inline molecule data:', error);
        console.error('Failed to parse:', match[1]);
        
        // Try to extract just the text field as fallback
        try {
          const textMatch = match[1].match(/text:"([^"]+)"/);
          if (textMatch) {
            parts.push({
              type: 'text',
              content: textMatch[1]
            });
          } else {
            parts.push({
              type: 'text',
              content: match[0] // Show the whole tag as fallback
            });
          }
        } catch (fallbackError) {
          parts.push({
            type: 'text',
            content: match[0]
          });
        }
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts;
  };

  const parts = parseInlineMolecules(content);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.type === 'molecule') {
          return (
            <MoleculeLink
              key={index}
              text={part.text}
              data={part.data}
              onMoleculeClick={onMoleculeClick}
            />
          );
        } else {
          return <span key={index}>{part.content}</span>;
        }
      })}
    </span>
  );
};

export default InlineMoleculeRenderer; 