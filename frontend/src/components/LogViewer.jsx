import React, { useRef, useEffect } from 'react';

/**
 * Terminal-style log viewer with syntax highlighting.
 */
const LogViewer = ({ logs = [], title = 'Deployment Logs', maxHeight = '360px' }) => {
  const scrollContainerRef = useRef(null);
  const isAtBottom = useRef(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Check if user is within 50px of the bottom
    isAtBottom.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  useEffect(() => {
    if (isAtBottom.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const colorize = (line) => {
    if (line.includes('✅') || line.includes('completed') || line.includes('COMPLETED') || line.includes('success')) {
      return 'log-success';
    }
    if (line.includes('❌') || line.includes('failed') || line.includes('FAILED') || line.includes('Error') || line.includes('error')) {
      return 'log-error';
    }
    if (line.includes('⚠️') || line.includes('Warning') || line.includes('warning')) {
      return 'log-warn';
    }
    if (line.includes('🔧') || line.includes('📋') || line.includes('📤') || line.includes('⚙️') ||
        line.includes('Running') || line.includes('Initializing') || line.includes('Creating')) {
      return 'log-info';
    }
    return '';
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          💻 {title}
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {logs.length} lines
        </span>
      </div>
      <div 
        className="log-viewer" 
        style={{ maxHeight }} 
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {logs.length === 0 ? (
          <span style={{ color: 'var(--text-muted)' }}>Waiting for logs...</span>
        ) : (
          logs.map((line, i) => (
            <span key={i} className={`log-line ${colorize(line)}`}>
              {line}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default LogViewer;
