import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Animated "Deploy Infrastructure" button with loading states.
 */
const DeployButton = ({ onClick, loading, disabled, label = 'Deploy Infrastructure' }) => {
  return (
    <button
      className="btn btn-deploy w-full"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: loading
          ? 'linear-gradient(135deg, #059669, #047857)'
          : 'linear-gradient(135deg, #10B981, #059669)',
        fontSize: '1.0625rem',
        padding: '1rem 2rem',
        letterSpacing: '0.01em',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <>
          <span className="spin" style={{ display: 'inline-block' }}>⚙️</span>
          {' '}Deploying...
        </>
      ) : (
        <>🚀 {label}</>
      )}
    </button>
  );
};

export default DeployButton;
