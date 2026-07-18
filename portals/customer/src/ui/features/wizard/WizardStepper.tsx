import React from 'react';
import { CheckOutlined } from '@ant-design/icons';

interface Props {
  steps: { key?: string; title: string; subtitle?: string }[];
  currentIndex: number;
  size?: 'default' | 'small';
}

/**
 * Compact modern stepper — numbered dots only, with a filling progress line.
 * Only the active step's title is written out (below the dots), so nothing
 * gets truncated on small screens.
 */
const WizardStepper: React.FC<Props> = ({ steps, currentIndex, size = 'default' }) => {
  const current = steps[currentIndex];
  const progress = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div
      className={`beat-stepper${size === 'small' ? ' beat-stepper-sm' : ''}`}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={currentIndex + 1}
      aria-label={current?.title}
    >
      <div className="beat-stepper-track">
        <span className="beat-stepper-line" aria-hidden />
        <span className="beat-stepper-line beat-stepper-line-fill" style={{ width: `${progress}%` }} aria-hidden />
        {steps.map((item, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'todo';
          return (
            <span key={item.key || item.title} className={`beat-stepper-dot is-${state}`} title={item.title}>
              {state === 'done' ? <CheckOutlined /> : index + 1}
            </span>
          );
        })}
      </div>
      <div className="beat-stepper-caption">
        <span className="beat-stepper-count">
          Hatua {currentIndex + 1}/{steps.length}
        </span>
        <span className="beat-stepper-title">{current?.title}</span>
        {current?.subtitle && <span className="beat-stepper-subtitle">· {current.subtitle}</span>}
      </div>
    </div>
  );
};

export default WizardStepper;
