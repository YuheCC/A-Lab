import React, { useState, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MolCard from '@/components/MolCard/index.js';
import { useAuthStore } from '@/models/useAuth';
import { COMMERCIAL_SCORE_MAP } from '@/utils';
import { isColumnVisibleForUser, isHighTierUser } from '@/constants/columnAccess';
import rehypeRaw from 'rehype-raw';
import { createLlmGradeProp, ReasoningModal } from '@/components/LlmGrade';
import './InlineMoleculeRenderer.css';

const renderAnionCommercialScore = (score) => {
  if (score === null || score === undefined) {
    return undefined;
  }

  const numericScore = typeof score === 'number' ? score : Number(score);
  const mapped = COMMERCIAL_SCORE_MAP?.[numericScore];

  if (mapped) {
    return mapped;
  }

  if (!Number.isNaN(numericScore)) {
    return numericScore.toString();
  }

  if (typeof score === 'string' && score.trim() !== '') {
    return score;
  }

  return undefined;
};

// Component for individual clickable citation numbers
const IndividualCitationLink = ({ number, style }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the target reference element
    const targetElement = document.getElementById(`ref-${number}`);
    
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // Add a temporary highlight effect
      targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
      setTimeout(() => {
        targetElement.style.backgroundColor = '';
      }, 2000);
    } else {
      // Fallback: try to find any reference section and scroll to it
      const referencesHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(heading => 
        heading.textContent?.toLowerCase().includes('references')
      );
      
      if (referencesHeadings.length > 0) {
        referencesHeadings[0].scrollIntoView({ behavior: 'smooth' });
      } else {
        // Last fallback: look for any element containing the reference number
        const allElements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent?.includes(`[${number}]`)
        );
        if (allElements.length > 0) {
          allElements[0].scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <span
      className="citation-link"
      style={{ 
        ...style, 
        cursor: 'pointer',
        color: '#0066cc',
        textDecoration: 'underline',
        fontSize: '0.9em'
      }}
      onClick={handleClick}
      title={`Click to go to reference ${number}`}
    >
      {number}
    </span>
  );
};

// Component for a group of citations like [1,2,3]
const CitationGroup = ({ citationNumbers, style }) => {
  // Parse citation numbers from the format "1,2,3"
  const numbers = citationNumbers.split(',').map(num => num.trim());
  
  return (
    <span style={style}>
      [
      {numbers.map((number, index) => (
        <React.Fragment key={number}>
          <IndividualCitationLink number={number} />
          {index < numbers.length - 1 && ','}
        </React.Fragment>
      ))}
      ]
    </span>
  );
};

// Component for individual clickable and hoverable molecule links
const MoleculeLink = ({ text, data, style, onMoleculeClick }) => {
  const [hoveredObject, setHoveredObject] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const linkRef = useRef(null);
  const hoverRef = useRef(null);
  const hideTimerRef = useRef(null);
  const userPermissions = useAuthStore(state => state.userPermissions);
  const [reasoningText, setReasoningText] = useState(null);

  const handleMouseEnter = (e) => {
    if (data && data.length > 0) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setHoveredObject({ data: data[0] });
    }
  };

  const handleMouseMove = (e) => {
    if (!hoveredObject) return;
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setHoveredObject(null);
    }, 150);
  }, [clearHideTimer]);

  const handleMouseLeave = () => {
    scheduleHide();
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (data && data.length > 0 && onMoleculeClick) {
      // Transform the molecule data to the format expected by the sidebar
      const moleculeData = data[0];
      const rawCation = moleculeData.cation ?? moleculeData.CATION;
      const normalizedCation = typeof rawCation === 'string' ? rawCation.trim() : rawCation;
      const hasCation = normalizedCation !== undefined && normalizedCation !== null && normalizedCation !== '';
      const isAnion = Boolean(hasCation || moleculeData.is_anion || moleculeData.IS_ANION);
      const transformedMolecule = {
        name: text,
        SMILES: moleculeData.SMILES,
        cation: normalizedCation,
        isAnion,
        molecular_weight: moleculeData.molecular_weight,
        HOMO_eV: moleculeData.HOMO_eV,
        LUMO_eV: moleculeData.LUMO_eV,
        ESP_min_eV: moleculeData.ESP_min_eV,
        ESP_max_eV: moleculeData.ESP_max_eV,
        predicted_MP_celsius: moleculeData.predicted_MP_celsius,
        predicted_BP_celsius: moleculeData.predicted_BP_celsius,
        predicted_FP_celsius: moleculeData.predicted_FP_celsius,
        COMBUSTION_ENTHALPY_EV: moleculeData.COMBUSTION_ENTHALPY_EV,
        vdw_volume_angstroms3: moleculeData.vdw_volume_angstroms3 ?? moleculeData.VDW_VOLUME_ANGSTROMS3,
        fluoride_bde_ev: moleculeData.fluoride_bde_ev ?? moleculeData.FLUORIDE_BDE_EV,
        COMMERCIAL_SCORE: moleculeData.COMMERCIAL_SCORE,
        COMMERCIAL_LINK: moleculeData.COMMERCIAL_LINK,
        functional_groups: moleculeData.functional_groups || "[]",
        UMAP_0: moleculeData.UMAP_0,
        UMAP_1: moleculeData.UMAP_1,
        grade: moleculeData.grade,
        reasoning: moleculeData.reasoning
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
      zIndex: 1001
    };
  }, [hoveredObject, mousePosition]);

  // 安全数字格式化
  const formatMaybeNumber = (value, decimals = 2) => {
    const num = typeof value === 'string' ? Number(value) : value;
    if (typeof num === 'number' && Number.isFinite(num)) {
      return num.toFixed(decimals);
    }
    return num ?? undefined;
  };

  // Transform the inline molecule data to MolCard format for hover popup
  const transformToMolCardProps = (moleculeData) => {
    if (!moleculeData) return [];

    const rawCation = moleculeData.cation ?? moleculeData.CATION;
    const normalizedCation = typeof rawCation === 'string' ? rawCation.trim() : rawCation;
    const isAnion = Boolean(moleculeData.is_anion ?? moleculeData.IS_ANION ?? normalizedCation);

    const propGroups = [
      { label: 'SMILES', value: moleculeData.SMILES, span: 2 },
      { label: 'Mol Weight', value: moleculeData.molecular_weight, suffix: ' g/mol' },
      { label: 'UMAP X', value: moleculeData.UMAP_0?.toFixed(4) },
      { label: 'UMAP Y', value: moleculeData.UMAP_1?.toFixed(4) },
      { label: 'HOMO', value: moleculeData.HOMO_eV?.toFixed(4), suffix: ' eV' },
      { label: 'LUMO', value: moleculeData.LUMO_eV?.toFixed(4), suffix: ' eV' },
      { label: 'ESP Max', value: moleculeData.ESP_max_eV?.toFixed(4), suffix: ' eV' },
      { label: 'ESP Min', value: moleculeData.ESP_min_eV?.toFixed(4), suffix: ' eV' },
    ];

    if (isAnion) {
      const volumeRaw = moleculeData.vdw_volume_angstroms3 ?? moleculeData.VDW_VOLUME_ANGSTROMS3;
      const fluorideBdeRaw = moleculeData.fluoride_bde_ev ?? moleculeData.FLUORIDE_BDE_EV;
      propGroups.push(
        {
          label: 'Molecular Volume',
          value: volumeRaw !== undefined && volumeRaw !== null ? formatMaybeNumber(volumeRaw) : 'N/A',
          suffix: volumeRaw !== undefined && volumeRaw !== null ? ' Å³' : undefined,
        },
        {
          label: 'F Dissociation Energy',
          value: fluorideBdeRaw !== undefined && fluorideBdeRaw !== null ? formatMaybeNumber(fluorideBdeRaw) : 'N/A',
          suffix: fluorideBdeRaw !== undefined && fluorideBdeRaw !== null ? ' eV' : undefined,
        }
      );
    } else {
      if (isColumnVisibleForUser('predicted_MP_celsius', userPermissions)) {
        propGroups.push({ label: 'Predicted MP', value: moleculeData.predicted_MP_celsius != null ? formatMaybeNumber(moleculeData.predicted_MP_celsius) : undefined, suffix: ' °C' });
      }
      if (isColumnVisibleForUser('predicted_BP_celsius', userPermissions)) {
        propGroups.push({ label: 'Predicted BP', value: moleculeData.predicted_BP_celsius != null ? formatMaybeNumber(moleculeData.predicted_BP_celsius) : undefined, suffix: ' °C' });
      }
      if (isColumnVisibleForUser('predicted_FP_celsius', userPermissions)) {
        propGroups.push({ label: 'Predicted FP', value: moleculeData.predicted_FP_celsius != null ? formatMaybeNumber(moleculeData.predicted_FP_celsius) : undefined, suffix: ' °C' });
      }
      if (isHighTierUser(userPermissions)) {
        propGroups.push({ label: 'Combustion Enthalpy', value: moleculeData.COMBUSTION_ENTHALPY_EV != null ? formatMaybeNumber(moleculeData.COMBUSTION_ENTHALPY_EV) : undefined, suffix: ' eV' });
      }
    }

    // Add commercial score if available
    if (moleculeData.COMMERCIAL_SCORE !== undefined) {
      propGroups.push({
        label: 'Commercial Viability',
        value: renderAnionCommercialScore(moleculeData.COMMERCIAL_SCORE),
        span: 2,
        wrap: true
      });
    }

    if (moleculeData.grade !== undefined && moleculeData.grade !== null) {
      propGroups.unshift(createLlmGradeProp(moleculeData.grade, moleculeData.reasoning, setReasoningText));
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        title={`Hover to preview • Click to view full details for ${text}`}
      >
        {text}
      </span>
      {hoveredObject && propGroups.length > 0 &&
        createPortal(
          <div style={position}>
            <MolCard
              ref={hoverRef}
              showMoreDetails={true}
              propGroups={propGroups}
              cation={hoveredObject.data?.cation ?? hoveredObject.data?.CATION}
              onMouseEnter={() => {
                // Keep popup open when hovering over it
              }}
              onMouseLeave={handleMouseLeave}
            />
          </div>,
          document.body
        )}
      <ReasoningModal text={reasoningText} onClose={() => setReasoningText(null)} />
    </>
  );
};

// Main component for parsing and rendering inline molecules
export const InlineMoleculeRenderer = ({ content, onMoleculeClick }) => {
  // Trim leading and trailing whitespace to prevent formatting issues
  const trimmedContent = content?.trim() || '';
  
  // Parse and prepare the content for rendering
  const { processedContent, moleculeMap, referencesIndex } = useMemo(() => {
    const inlineMoleculeRegex = /<inline_molecule>(\{[\s\S]*?\})<\/inline_molecule>/g;
    const molecules = new Map();
    let processedText = trimmedContent;
    let index = 0;

    // Find all matches first to avoid replacement issues
    const matches = [];
    let match;
    while ((match = inlineMoleculeRegex.exec(processedText)) !== null) {
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
        break;
      }
    }
    
    return {
      processedContent: processedText,
      moleculeMap: molecules,
      referencesIndex: refIndex
    };
  }, [trimmedContent]);

  // Helper function to create molecule and citation processing function
  const createProcessString = (isAfterReferences) => {
    return (str, keyPrefix = '') => {
      if (typeof str !== 'string') {
        return str;
      }
      
      // Check if we need to process anything
      const hasMolecules = str.includes('{{MOLECULE_');
      const hasCitations = /\[\d+(?:,\s*\d+)*\]/.test(str);
      
      if (!hasMolecules && !hasCitations) {
        return str;
      }
      
      // Split text by both molecule placeholders and citations
      let parts = [str];
      
      // Process molecule placeholders
      if (hasMolecules) {
        const newParts = [];
        parts.forEach(part => {
          if (typeof part === 'string') {
            const moleculeParts = part.split(/({{MOLECULE_\d+}})/);
            newParts.push(...moleculeParts);
          } else {
            newParts.push(part);
          }
        });
        parts = newParts;
      }
      
      // Process citations (only in text parts, not in already processed components)
      if (hasCitations && !isAfterReferences) {
        const newParts = [];
        parts.forEach(part => {
          if (typeof part === 'string') {
            // Split by citation pattern: [1], [1,2], [1,2,3], etc.
            const citationParts = part.split(/(\[\d+(?:,\s*\d+)*\])/);
            newParts.push(...citationParts);
          } else {
            newParts.push(part);
          }
        });
        parts = newParts;
      }
      
      return parts.map((part, index) => {
        if (typeof part !== 'string') {
          return part; // Already processed component
        }
        
        // Handle molecule placeholders
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
        
        // Handle citations (only before References section)
        const citationMatch = part.match(/^\[(\d+(?:,\s*\d+)*)\]$/);
        if (citationMatch && !isAfterReferences) {
          const citationNumbers = citationMatch[1];
          return (
            <CitationGroup
              key={`${keyPrefix}cite-${index}`}
              citationNumbers={citationNumbers}
            />
          );
        }
        
        return part; // Regular text
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
    
    return [
      { content: beforeReferences, isAfterReferences: false },
      { content: afterReferences, isAfterReferences: true }
    ];
  }, [processedContent, referencesIndex]);

  // Create components for each part
  const createComponents = (isAfterReferences) => {
    const processString = createProcessString(isAfterReferences);
    
    return {
      // Handle all text rendering to find and replace molecule placeholders and citations
      text: ({ node, children, ...props }) => {
        const text = children;
        if (typeof text !== 'string') {
          return text;
        }

        // Check if we need to process anything
        const hasMolecules = text.includes('{{MOLECULE_');
        const hasCitations = /\[\d+(?:,\s*\d+)*\]/.test(text);
        
        if (!hasMolecules && !hasCitations) {
          return text;
        }

        // Split text by both molecule placeholders and citations
        // First handle molecules, then citations
        let parts = [text];
        
        // Process molecule placeholders
        if (hasMolecules) {
          const newParts = [];
          parts.forEach(part => {
            if (typeof part === 'string') {
              const moleculeParts = part.split(/({{MOLECULE_\d+}})/);
              newParts.push(...moleculeParts);
            } else {
              newParts.push(part);
            }
          });
          parts = newParts;
        }
        
        // Process citations (only in text parts, not in already processed components)
        if (hasCitations && !isAfterReferences) {
          const newParts = [];
          parts.forEach(part => {
            if (typeof part === 'string') {
              // Split by citation pattern: [1], [1,2], [1,2,3], etc.
              const citationParts = part.split(/(\[\d+(?:,\s*\d+)*\])/);
              newParts.push(...citationParts);
            } else {
              newParts.push(part);
            }
          });
          parts = newParts;
        }

        if (parts.length === 1 && typeof parts[0] === 'string') {
          return text; // No special content found
        }

        return (
          <>
            {parts.map((part, index) => {
              if (typeof part !== 'string') {
                return part; // Already processed component
              }
              
              // Handle molecule placeholders
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
              
              // Handle citations (only before References section)
              const citationMatch = part.match(/^\[(\d+(?:,\s*\d+)*)\]$/);
              if (citationMatch && !isAfterReferences) {
                const citationNumbers = citationMatch[1];
                return (
                  <CitationGroup
                    key={`cite-${index}`}
                    citationNumbers={citationNumbers}
                  />
                );
              }
              
              return part; // Regular text
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
        
        return <code 
        {...props}
        style={{ 
          whiteSpace: 'pre-wrap', 
          wordWrap: 'break-word', 
          overflowWrap: 'break-word',
          backgroundColor: '#f1f5f9',
          padding: '2px 4px',
          borderRadius: '3px',
          fontSize: '0.9em',
          fontFamily: 'monospace'
        }}
        >{processedChildren}</code>;
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
        
        return <pre 
        {...props}
        style={{ 
          whiteSpace: 'pre-wrap', 
          wordWrap: 'break-word', 
          overflowWrap: 'break-word',
          backgroundColor: '#f1f5f9',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '0.9em',
          fontFamily: 'monospace',
          margin: '0.5em 0'
        }}
        >{processedChildren}</pre>;
      },
      
      // Process ordered lists and add anchor IDs for references
      ol: ({ node, children, ...props }) => {
        console.log('Processing ordered list, isAfterReferences:', isAfterReferences);
        
        // Check if this is in the References section by looking for reference pattern
        const childrenArray = React.Children.toArray(children);
        const isReferencesList = isAfterReferences && childrenArray.some(child => {
          if (child && child.props && child.props.children) {
            const childrenText = React.Children.toArray(child.props.children);
            const text = childrenText.map(c => typeof c === 'string' ? c : '').join('');
            const hasRefPattern = /^\[\d+\]/.test(text.trim());
            console.log('Checking child text:', text.trim(), 'has ref pattern:', hasRefPattern);
            return hasRefPattern;
          }
          return false;
        });
        
        console.log('Is references list:', isReferencesList);
        
        // If this is a references list, add special handling to list items
        if (isReferencesList) {
          const processedChildren = React.Children.map(children, (child, childIndex) => {
            if (child && child.type === 'li') {
              // Extract reference number from the first text content
              const childrenText = React.Children.toArray(child.props.children);
              const textContent = childrenText.map(c => typeof c === 'string' ? c : '').join('');
              const refMatch = textContent.match(/^\[(\d+)\]/);
              
              console.log('Processing li child, text:', textContent.trim(), 'refMatch:', refMatch);
              
              if (refMatch) {
                const refNumber = refMatch[1];
                console.log(`Creating anchor for reference ${refNumber}`);
                return React.cloneElement(child, {
                  ...child.props,
                  id: `ref-${refNumber}`,
                  key: `ref-${refNumber}`,
                  style: { 
                    ...child.props.style, 
                    scrollMarginTop: '80px',
                    position: 'relative'
                  }
                });
              }
            }
            return child;
          });
          
          return <ol {...props}>{processedChildren}</ol>;
        }
        
        // For non-reference lists, process normally
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `ol${childIndex}-`);
          }
          return child;
        });
        
        return <ol {...props}>{processedChildren}</ol>;
      },
      
      // Also handle unordered lists in case references are in ul format
      ul: ({ node, children, ...props }) => {
        console.log('Processing unordered list, isAfterReferences:', isAfterReferences);
        
        // Check if this is in the References section by looking for reference pattern
        const childrenArray = React.Children.toArray(children);
        const isReferencesList = isAfterReferences && childrenArray.some(child => {
          if (child && child.props && child.props.children) {
            const childrenText = React.Children.toArray(child.props.children);
            const text = childrenText.map(c => typeof c === 'string' ? c : '').join('');
            const hasRefPattern = /^\[\d+\]/.test(text.trim());
            console.log('Checking ul child text:', text.trim(), 'has ref pattern:', hasRefPattern);
            return hasRefPattern;
          }
          return false;
        });
        
        console.log('Is ul references list:', isReferencesList);
        
        // If this is a references list, add special handling to list items
        if (isReferencesList) {
          const processedChildren = React.Children.map(children, (child, childIndex) => {
            if (child && child.type === 'li') {
              // Extract reference number from the first text content
              const childrenText = React.Children.toArray(child.props.children);
              const textContent = childrenText.map(c => typeof c === 'string' ? c : '').join('');
              const refMatch = textContent.match(/^\[(\d+)\]/);
              
              console.log('Processing ul li child, text:', textContent.trim(), 'refMatch:', refMatch);
              
              if (refMatch) {
                const refNumber = refMatch[1];
                console.log(`Creating anchor for ul reference ${refNumber}`);
                return React.cloneElement(child, {
                  ...child.props,
                  id: `ref-${refNumber}`,
                  key: `ref-${refNumber}`,
                  style: { 
                    ...child.props.style, 
                    scrollMarginTop: '80px',
                    position: 'relative'
                  }
                });
              }
            }
            return child;
          });
          
          return <ul {...props}>{processedChildren}</ul>;
        }
        
        // For non-reference lists, process normally
        const processedChildren = React.Children.map(children, (child, childIndex) => {
          if (typeof child === 'string') {
            return processString(child, `ul${childIndex}-`);
          }
          return child;
        });
        
        return <ul {...props}>{processedChildren}</ul>;
      },
      
      // Add proper spacing for horizontal rules
      hr: ({ node, ...props }) => (
        <hr {...props} style={{ margin: '1.5em 0', border: 'none', borderTop: '1px solid #ccc' }} />
      ),
      
      a: ({ node, children, ...props }) => (
        <a {...props} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    };
  };

  const componentsBeforeRefs = useMemo(() => createComponents(false), [moleculeMap, processedContent]);
  const componentsAfterRefs = useMemo(() => createComponents(true), [moleculeMap, processedContent]);

  return (
    <div className="inline-molecule-renderer">
      {contentParts.map((part, index) => (
        <ReactMarkdown 
          key={index}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={part.isAfterReferences ? componentsAfterRefs : componentsBeforeRefs}
        >
          {part.content}
        </ReactMarkdown>
      ))}
    </div>
  );
};

export default InlineMoleculeRenderer; 
