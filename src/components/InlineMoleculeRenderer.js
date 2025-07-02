import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  const position = useMemo(() => {
    if (!hoveredObject) return {};

    const popupWidth = 300;
    const popupHeight = 400;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

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
  // Parse and prepare the content for rendering
  const { processedContent, moleculeMap } = useMemo(() => {
    const inlineMoleculeRegex = /<inline_molecule>(\{.*?\})<\/inline_molecule>/g;
    const molecules = new Map();
    let processedText = content;
    let index = 0;

    // Find all matches first to avoid replacement issues
    const matches = [];
    let match;
    while ((match = inlineMoleculeRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        dataString: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    // Process matches in reverse order to avoid index shifting
    for (let i = matches.length - 1; i >= 0; i--) {
      const currentMatch = matches[i];
      try {
        const outerData = JSON.parse(currentMatch.dataString);
        const moleculeText = outerData.text;
        const dataArray = outerData.data;
        
        if (dataArray && dataArray.length > 0) {
          const placeholderId = `{{MOLECULE_${index}}}`;
          molecules.set(placeholderId, {
            text: moleculeText,
            data: dataArray
          });
          
          // Replace by position to ensure correct replacement
          processedText = processedText.slice(0, currentMatch.startIndex) + 
                         placeholderId + 
                         processedText.slice(currentMatch.endIndex);
          index++;
        } else {
          // Remove the tag but keep the text
          processedText = processedText.slice(0, currentMatch.startIndex) + 
                         moleculeText + 
                         processedText.slice(currentMatch.endIndex);
        }
      } catch (error) {
        console.error('Error parsing inline molecule data:', error);
        // Try to extract just the text field as fallback
        try {
          const textMatch = currentMatch.dataString.match(/text:"([^"]+)"/);
          if (textMatch) {
            processedText = processedText.slice(0, currentMatch.startIndex) + 
                           textMatch[1] + 
                           processedText.slice(currentMatch.endIndex);
          } else {
            // Keep the original match as fallback
            processedText = processedText.slice(0, currentMatch.startIndex) + 
                           currentMatch.fullMatch + 
                           processedText.slice(currentMatch.endIndex);
          }
        } catch (fallbackError) {
          // Keep the original match as fallback - do nothing, leave as is
        }
      }
    }

    return {
      processedContent: processedText,
      moleculeMap: molecules
    };
  }, [content]);

  // Custom ReactMarkdown components
  const components = {
    // Handle all text rendering to find and replace molecule placeholders
    text: ({ node, children, ...props }) => {
      console.log('TEXT COMPONENT CALLED with:', children);
      const text = children;
      if (typeof text !== 'string') {
        return text;
      }

      // Check for new placeholder format: {{MOLECULE_X}}
      if (!text.includes('{{MOLECULE_')) {
        return text;
      }

      console.log('Found text with placeholders:', text);

      // Split text by molecule placeholders (new format)
      const parts = text.split(/({{MOLECULE_\d+}})/);
      if (parts.length === 1) {
        return text; // No placeholders found
      }

      return (
        <>
          {parts.map((part, index) => {
            // Handle new format: {{MOLECULE_X}}
            if (part.match(/^{{MOLECULE_\d+}}$/)) {
              const moleculeInfo = moleculeMap.get(part);
              
              if (moleculeInfo) {
                console.log(`Replacing ${part} with ${moleculeInfo.text}`);
                return (
                  <MoleculeLink
                    key={`mol-${index}`}
                    text={moleculeInfo.text}
                    data={moleculeInfo.data}
                    onMoleculeClick={onMoleculeClick}
                  />
                );
              }
              // If molecule not found, return the placeholder for debugging
              console.log(`Molecule not found for ${part}`);
              return <span key={`missing-${index}`} style={{backgroundColor: 'yellow'}}>{part}</span>;
            }
            return part;
          })}
        </>
      );
    },
    
    // Process paragraph content which might be mixed arrays
    p: ({ node, children, ...props }) => {
      console.log('P COMPONENT CALLED with:', children);
      
      // Helper function to process a single string for placeholders
      const processString = (str, keyPrefix = '') => {
        if (!str.includes('{{MOLECULE_')) {
          return str;
        }
        
        const parts = str.split(/({{MOLECULE_\d+}})/);
        return parts.map((part, index) => {
          if (part.match(/^{{MOLECULE_\d+}}$/)) {
            const moleculeInfo = moleculeMap.get(part);
            if (moleculeInfo) {
              console.log(`Replacing ${part} with ${moleculeInfo.text}`);
              return (
                <MoleculeLink
                  key={`${keyPrefix}mol-${index}`}
                  text={moleculeInfo.text}
                  data={moleculeInfo.data}
                  onMoleculeClick={onMoleculeClick}
                />
              );
            }
            return <span key={`${keyPrefix}missing-${index}`} style={{backgroundColor: 'yellow'}}>{part}</span>;
          }
          return part;
        });
      };
      
      // Process children based on their type
      const processedChildren = React.Children.map(children, (child, childIndex) => {
        if (typeof child === 'string') {
          return processString(child, `p${childIndex}-`);
        }
        return child;
      });
      
      return <p {...props}>{processedChildren}</p>;
    },
    
    // Process list item content which might be mixed arrays
    li: ({ node, children, ...props }) => {
      console.log('LI COMPONENT CALLED with:', children);
      
      // Helper function to process a single string for placeholders
      const processString = (str, keyPrefix = '') => {
        if (!str.includes('{{MOLECULE_')) {
          return str;
        }
        
        const parts = str.split(/({{MOLECULE_\d+}})/);
        return parts.map((part, index) => {
          if (part.match(/^{{MOLECULE_\d+}}$/)) {
            const moleculeInfo = moleculeMap.get(part);
            if (moleculeInfo) {
              console.log(`Replacing ${part} with ${moleculeInfo.text}`);
              return (
                <MoleculeLink
                  key={`${keyPrefix}mol-${index}`}
                  text={moleculeInfo.text}
                  data={moleculeInfo.data}
                  onMoleculeClick={onMoleculeClick}
                />
              );
            }
            return <span key={`${keyPrefix}missing-${index}`} style={{backgroundColor: 'yellow'}}>{part}</span>;
          }
          return part;
        });
      };
      
      // Process children based on their type
      const processedChildren = React.Children.map(children, (child, childIndex) => {
        if (typeof child === 'string') {
          return processString(child, `li${childIndex}-`);
        }
        return child;
      });
      
      return <li {...props}>{processedChildren}</li>;
    },
    
    // Process table cell content (td and th) which might contain molecule placeholders
    td: ({ node, children, ...props }) => {
      console.log('TD COMPONENT CALLED with:', children);
      
      // Helper function to process a single string for placeholders
      const processString = (str, keyPrefix = '') => {
        if (!str.includes('{{MOLECULE_')) {
          return str;
        }
        
        const parts = str.split(/({{MOLECULE_\d+}})/);
        return parts.map((part, index) => {
          if (part.match(/^{{MOLECULE_\d+}}$/)) {
            const moleculeInfo = moleculeMap.get(part);
            if (moleculeInfo) {
              console.log(`Replacing ${part} with ${moleculeInfo.text}`);
              return (
                <MoleculeLink
                  key={`${keyPrefix}mol-${index}`}
                  text={moleculeInfo.text}
                  data={moleculeInfo.data}
                  onMoleculeClick={onMoleculeClick}
                />
              );
            }
            return <span key={`${keyPrefix}missing-${index}`} style={{backgroundColor: 'yellow'}}>{part}</span>;
          }
          return part;
        });
      };
      
      // Process children based on their type
      const processedChildren = React.Children.map(children, (child, childIndex) => {
        if (typeof child === 'string') {
          return processString(child, `td${childIndex}-`);
        }
        return child;
      });
      
      return <td {...props}>{processedChildren}</td>;
    },
    
    // Process table header content which might contain molecule placeholders
    th: ({ node, children, ...props }) => {
      console.log('TH COMPONENT CALLED with:', children);
      
      // Helper function to process a single string for placeholders
      const processString = (str, keyPrefix = '') => {
        if (!str.includes('{{MOLECULE_')) {
          return str;
        }
        
        const parts = str.split(/({{MOLECULE_\d+}})/);
        return parts.map((part, index) => {
          if (part.match(/^{{MOLECULE_\d+}}$/)) {
            const moleculeInfo = moleculeMap.get(part);
            if (moleculeInfo) {
              console.log(`Replacing ${part} with ${moleculeInfo.text}`);
              return (
                <MoleculeLink
                  key={`${keyPrefix}mol-${index}`}
                  text={moleculeInfo.text}
                  data={moleculeInfo.data}
                  onMoleculeClick={onMoleculeClick}
                />
              );
            }
            return <span key={`${keyPrefix}missing-${index}`} style={{backgroundColor: 'yellow'}}>{part}</span>;
          }
          return part;
        });
      };
      
      // Process children based on their type
      const processedChildren = React.Children.map(children, (child, childIndex) => {
        if (typeof child === 'string') {
          return processString(child, `th${childIndex}-`);
        }
        return child;
      });
      
      return <th {...props}>{processedChildren}</th>;
    }
  };

  console.log('Rendering ReactMarkdown with components:', components);
  console.log('Content to render:', processedContent);

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default InlineMoleculeRenderer; 