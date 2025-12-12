import React, { useState } from 'react';
import { Popover } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import ScoreBreakdownValue, { ScoreBreakdownItem } from './ScoreBreakdownValue';

export interface ScoreSummary {
  label: string;
  displayValue: string;
  color: string;
  subscores: ScoreBreakdownItem[];
}

export interface GradeSummary {
  label: string;
  displayValue: string;
  color?: string;
  action?: React.ReactNode;
}

interface OverallScoreValueProps {
  label: string;
  value: string;
  valueColor?: string;
  propertyScore?: ScoreSummary;
  structureScore?: ScoreSummary;
  llmGrade?: GradeSummary;
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  fontSize: '13px',
};

const OverallScoreValue: React.FC<OverallScoreValueProps> = ({
  label,
  value,
  valueColor,
  propertyScore,
  structureScore,
  llmGrade,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => setAnchorEl(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setAnchorEl(event.currentTarget as HTMLElement);
    }
    if (event.key === 'Escape') {
      closePopover();
    }
  };

  const open = Boolean(anchorEl);

  const hasProperty = Boolean(propertyScore);
  const hasStructure = Boolean(structureScore);
  const hasGrade = Boolean(llmGrade);

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={openPopover}
        onKeyDown={handleKeyDown}
        aria-haspopup="dialog"
        aria-expanded={open ? 'true' : 'false'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: 'inherit',
        }}
      >
        <span style={{ color: valueColor, fontWeight: 600 }}>{value}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </span>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            p: '12px 16px',
            maxWidth: 340,
            backgroundColor: '#fff',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
            {`${label} Breakdown`}
          </div>
          {hasProperty && propertyScore && (
            <div style={rowStyle}>
              <span style={{ flex: 1 }}>{propertyScore.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: propertyScore.color,
                  fontWeight: 600,
                }}
              >
                <ScoreBreakdownValue
                  label={propertyScore.label}
                  value={propertyScore.displayValue}
                  subscores={propertyScore.subscores}
                />
              </span>
            </div>
          )}
          {hasStructure && structureScore && (
            <div style={rowStyle}>
              <span style={{ flex: 1 }}>{structureScore.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: structureScore.color,
                  fontWeight: 600,
                }}
              >
                <ScoreBreakdownValue
                  label={structureScore.label}
                  value={structureScore.displayValue}
                  subscores={structureScore.subscores}
                />
              </span>
            </div>
          )}
          {hasGrade && llmGrade && (
            <div style={rowStyle}>
              <span style={{ flex: 1 }}>{llmGrade.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: llmGrade.color ?? '#1e293b',
                  fontWeight: 600,
                }}
              >
                {llmGrade.displayValue}
                {llmGrade.action}
              </span>
            </div>
          )}
        </div>
      </Popover>
    </>
  );
};

export default OverallScoreValue;
