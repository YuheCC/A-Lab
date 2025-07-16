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
        { label: 'Combustion Enthalpy', value: moleculeData.COMBUSTION_ENTHALPY_EV?.toFixed(2) || '0.00', suffix: ' eV' }
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
  const { processedContent, moleculeMap, referencesIndex } = useMemo(() => {
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
        let dataArray = outerData.data ?? [];
        if (dataArray && !Array.isArray(dataArray)) {
          dataArray = [dataArray];        // normalise to array
        }
        
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

    // Find the "References" section with multiple patterns
    let referencesMatch = null;
    let refIndex = -1;
    
    // Try different patterns for References section
    const referencesPatterns = [
      /\n\s*#{1,6}\s*References\s*\n/i,           // Markdown heading: # References, ## References, etc.
      /\n\s*References\s*\n[-=]{3,}\s*\n/i,      // Underlined heading: References followed by --- or ===
      /\n\s*References\s*\n/i,                   // Simple: References on its own line
      /\*\*References\*\*/i,                     // Bold: **References**
      /References:/i,                            // With colon: References:
      /References\s*$/im,                        // At end of line
      /\bReferences\b/i                          // Word boundary match (most permissive)
    ];
    
    for (let i = 0; i < referencesPatterns.length; i++) {
      const pattern = referencesPatterns[i];
      referencesMatch = processedText.match(pattern);
      if (referencesMatch) {
        // For most patterns, start after the match
        // For the word boundary pattern (last one), start at the beginning of "References"
        if (i === referencesPatterns.length - 1) {
          refIndex = referencesMatch.index;
        } else {
          refIndex = referencesMatch.index + referencesMatch[0].length;
        }
        console.log('Found References section with pattern:', pattern, 'at index:', refIndex);
        console.log('Match:', referencesMatch[0]);
        break;
      }
    }
    
    // Debug logging
    if (refIndex === -1) {
      console.log('No References section found. Content preview:', processedText.substring(0, 500));
      console.log('Content includes "References"?', processedText.toLowerCase().includes('references'));
      // Show where "references" appears in the content
      const referencesIndex = processedText.toLowerCase().indexOf('references');
      if (referencesIndex !== -1) {
        console.log('Found "references" at index:', referencesIndex);
        console.log('Context around references:', processedText.substring(Math.max(0, referencesIndex - 50), referencesIndex + 100));
      }
    }

    return {
      processedContent: processedText,
      moleculeMap: molecules,
      referencesIndex: refIndex
    };
  }, [content]);

  // Helper function to create molecule processing function
  const createProcessString = (isAfterReferences) => {
    return (str, keyPrefix = '') => {
      if (!str.includes('{{MOLECULE_')) {
        return str;
      }
      
      const parts = str.split(/({{MOLECULE_\d+}})/);
      return parts.map((part, index) => {
        if (part.match(/^{{MOLECULE_\d+}}$/)) {
          const moleculeInfo = moleculeMap.get(part);
          if (moleculeInfo) {
            if (isAfterReferences) {
              // Render as plain text after References
              return (
                <span key={`${keyPrefix}mol-${index}`} style={{ fontWeight: 'normal' }}>
                  {moleculeInfo.text}
                </span>
              );
            } else {
              // Render as interactive button before References
              return (
                <MoleculeLink
                  key={`${keyPrefix}mol-${index}`}
                  text={moleculeInfo.text}
                  data={moleculeInfo.data}
                  onMoleculeClick={onMoleculeClick}
                />
              );
            }
          }
          return <span key={`${keyPrefix}missing-${index}`} style={{backgroundColor: 'yellow'}}>{part}</span>;
        }
        return part;
      });
    };
  };

  // Split content at References if found
  const contentParts = useMemo(() => {
    if (referencesIndex === -1) {
      return [{ content: processedContent, isAfterReferences: false }];
    }
    
    const beforeReferences = processedContent.slice(0, referencesIndex);
    const afterReferences = processedContent.slice(referencesIndex);
    
    console.log('Content split at References:');
    console.log('Before:', beforeReferences.substring(beforeReferences.length - 100));
    console.log('After:', afterReferences.substring(0, 100));
    
    return [
      { content: beforeReferences, isAfterReferences: false },
      { content: afterReferences, isAfterReferences: true }
    ];
  }, [processedContent, referencesIndex]);

  // Create components for each part
  const createComponents = (isAfterReferences) => {
    const processString = createProcessString(isAfterReferences);
    
    return {
      // Handle all text rendering to find and replace molecule placeholders
      text: ({ node, children, ...props }) => {
        const text = children;
        if (typeof text !== 'string') {
          return text;
        }

        // Check for new placeholder format: {{MOLECULE_X}}
        if (!text.includes('{{MOLECULE_')) {
          return text;
        }

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
                  if (isAfterReferences) {
                    // Render as plain text after References
                    return (
                      <span key={`mol-${index}`} style={{ fontWeight: 'normal' }}>
                        {moleculeInfo.text}
                      </span>
                    );
                  } else {
                    // Render as interactive button before References
                    return (
                      <MoleculeLink
                        key={`mol-${index}`}
                        text={moleculeInfo.text}
                        data={moleculeInfo.data}
                        onMoleculeClick={onMoleculeClick}
                      />
                    );
                  }
                }
                // If molecule not found, return the placeholder for debugging
                return <span key={`missing-${index}`} style={{backgroundColor: 'yellow'}}>{part}</span>;
              }
              return part;
            })}
          </>
        );
      },
      
      // Process paragraph content which might be mixed arrays
      p: ({ node, children, ...props }) => {
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
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `th${childIndex}-`);
          }
          return child;
        });
        
        return <th {...props}>{processedChildren}</th>;
      },
      
      // Process heading content which might contain molecule placeholders
      h1: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `h1${childIndex}-`);
          }
          return child;
        });
        
        return <h1 {...props}>{processedChildren}</h1>;
      },
      
      h2: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `h2${childIndex}-`);
          }
          return child;
        });
        
        return <h2 {...props}>{processedChildren}</h2>;
      },
      
      h3: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `h3${childIndex}-`);
          }
          return child;
        });
        
        return <h3 {...props}>{processedChildren}</h3>;
      },
      
      h4: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `h4${childIndex}-`);
          }
          return child;
        });
        
        return <h4 {...props}>{processedChildren}</h4>;
      },
      
      h5: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `h5${childIndex}-`);
          }
          return child;
        });
        
        return <h5 {...props}>{processedChildren}</h5>;
      },
      
      h6: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `h6${childIndex}-`);
          }
          return child;
        });
        
        return <h6 {...props}>{processedChildren}</h6>;
      },
      
      // Process strong (bold) text content which might contain molecule placeholders
      strong: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `strong${childIndex}-`);
          }
          return child;
        });
        
        return <strong {...props}>{processedChildren}</strong>;
      },
      
      // Process inline code content (backticks) which might contain molecule placeholders
      code: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `code${childIndex}-`);
          }
          return child;
        });
        
        return <code {...props}>{processedChildren}</code>;
      },
      
      // Process emphasis (italic) content which might contain molecule placeholders
      em: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `em${childIndex}-`);
          }
          return child;
        });
        
        return <em {...props}>{processedChildren}</em>;
      },
      
      // Process preformatted code blocks which might contain molecule placeholders
      pre: ({ node, children, ...props }) => {
        // Process children based on their type
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `pre${childIndex}-`);
          }
          return child;
        });
        
        return <pre {...props}>{processedChildren}</pre>;
      }
    };
  };

  return (
    <div>
      {contentParts.map((part, index) => (
        <ReactMarkdown 
          key={index}
          remarkPlugins={[remarkGfm]}
          components={createComponents(part.isAfterReferences)}
        >
          {part.content}
        </ReactMarkdown>
      ))}
    </div>
  );
};

export default InlineMoleculeRenderer; 