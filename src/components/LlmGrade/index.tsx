import React from 'react';
import { IconButton } from '@mui/material';
import { Info } from 'lucide-react';
import './index.css';

interface ReasoningButtonProps {
  reasoning?: string;
  onShow: (text: string) => void;
}

export const ReasoningButton: React.FC<ReasoningButtonProps> = ({ reasoning, onShow }) => {
  if (!reasoning) return null;
  return (
    <IconButton onClick={() => onShow(reasoning)} size="small">
      <Info size={18} style={{ margin: 2 }} />
    </IconButton>
  );
};

interface ReasoningModalProps {
  text: string | null;
  onClose: () => void;
}

export const ReasoningModal: React.FC<ReasoningModalProps> = ({ text, onClose }) => {
  if (!text) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>×</button>
        <pre className="modal-pre">{text}</pre>
      </div>
    </div>
  );
};

export const createLlmGradeProp = (
  grade: number | null | undefined,
  reasoning: string | undefined,
  onShow: (text: string) => void
) => ({
  label: 'LLM Grade',
  value: grade,
  span: 2,
  suffix: '/10',
  action: <ReasoningButton reasoning={reasoning} onShow={onShow} />,
  show: grade !== null && grade !== undefined,
});

export default ReasoningButton;
