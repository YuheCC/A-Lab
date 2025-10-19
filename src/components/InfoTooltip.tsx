import React from 'react';
import { Tooltip } from '@mui/material';
import type { TooltipProps, SxProps, Theme } from '@mui/material';

export const infoTooltipPopperSx: SxProps<Theme> = {
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'white',
    color: 'black',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    maxWidth: 280,
  },
  '& .MuiTooltip-arrow': {
    color: 'white',
  },
};

const mergeSx = (incoming?: SxProps<Theme>): SxProps<Theme> => {
  if (!incoming) {
    return infoTooltipPopperSx;
  }

  if (Array.isArray(incoming)) {
    return [infoTooltipPopperSx, ...incoming];
  }

  return {
    ...(infoTooltipPopperSx as Record<string, unknown>),
    ...(incoming as Record<string, unknown>),
  } as SxProps<Theme>;
};

export interface InfoTooltipContentProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  remainingLabel?: React.ReactNode;
}

export const InfoTooltipContent: React.FC<InfoTooltipContentProps> = ({
  title,
  description,
  remainingLabel,
}) => (
  <div style={{ padding: '4px' }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: description ? '8px' : 0,
      }}
    >
      <h4
        style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 600,
          color: '#111827',
        }}
      >
        {title}
      </h4>
      {remainingLabel ? (
        <span
          style={{
            fontSize: '12px',
            color: '#56B26A',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(86, 178, 106, 0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          {remainingLabel}
        </span>
      ) : null}
    </div>
    {description ? (
      <div
        style={{
          fontSize: '13px',
          color: '#4b5563',
          lineHeight: 1.5,
          fontWeight: 300,
        }}
      >
        {description}
      </div>
    ) : null}
  </div>
);

const InfoTooltip: React.FC<TooltipProps> = ({ PopperProps, arrow, ...rest }) => {
  const mergedSx = mergeSx(PopperProps?.sx);
  const finalArrow = arrow !== undefined ? arrow : true;
  return (
    <Tooltip
      {...rest}
      arrow={finalArrow}
      PopperProps={{
        ...PopperProps,
        sx: mergedSx,
      }}
    />
  );
};

export default InfoTooltip;
