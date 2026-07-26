import React from 'react';
import './SelectionLayout.css';

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export default function SelectionLayout({
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
}: Props) {
  return (
    <div className="selection-screen">
      <header>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>

      <div className="selection-content">
        {children}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="actions">
          {primaryAction && (
            <button
              className="btn primary"
              disabled={primaryAction.disabled}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              className="btn secondary"
              disabled={secondaryAction.disabled}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
