import React, { useMemo, useState } from 'react';
import { Popover } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  displayValue: string;
  color: string;
}

interface ScoreBreakdownValueProps {
  label: string;
  value: string;
  subscores: ScoreBreakdownItem[];
}

const toTitleCase = (text: string) =>
  text
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ScoreBreakdownValue: React.FC<ScoreBreakdownValueProps> = ({ label, value, subscores }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const hasSubscores = subscores && subscores.length > 0;

  const formattedItems = useMemo(
    () =>
      subscores.map((item) => ({
        ...item,
        formattedLabel: toTitleCase(item.label),
      })),
    [subscores],
  );

  if (!hasSubscores) {
    return <span>{value}</span>;
  }

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

  const title = t('search.scoreBreakdown.title', {
    defaultValue: '{{label}} Score Breakdown',
    label,
  });

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
        {value}
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
            maxWidth: 320,
            backgroundColor: '#fff',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {formattedItems.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13px',
                  color: '#1e293b',
                  fontWeight: 500,
                }}
              >
                <span style={{ flex: 1 }}>{item.formattedLabel || item.label}</span>
                <span style={{ color: item.color, fontWeight: 600 }}>{item.displayValue}</span>
              </div>
            ))}
          </div>
        </div>
      </Popover>
    </>
  );
};

export default ScoreBreakdownValue;
