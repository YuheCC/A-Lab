import React, { useState, useRef, useMemo } from 'react';
import { MolCard } from './MolCard';
import { useAuthStore } from '../providers/auth';
import './InlineMoleculeRenderer.css';

// Component for individual clickable molecule links
const MoleculeLink = ({ text, data, style, onMoleculeClick }) => {
  const linkRef = useRef(null);
  const userPermissions = useAuthStore(state => state.userPermissions);

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

  return (
    <span
      ref={linkRef}
      className="inline-molecule-link"
      style={{ ...style, cursor: 'pointer' }}
      onClick={handleClick}
      title={`Click to view details for ${text}`}
    >
      {text}
    </span>
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