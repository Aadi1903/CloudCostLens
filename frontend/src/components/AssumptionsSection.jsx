import React from 'react';
import ExplainerSection from './ExplainerSection';

const AssumptionsSection = () => {
    return (
        <ExplainerSection title="Assumptions used for this estimate">
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Pricing based on on-demand usage (us-east-1 region pricing reference).</li>
                <li style={{ marginBottom: '0.5rem' }}>Single-region deployment assumed for simplicity.</li>
                <li style={{ marginBottom: '0.5rem' }}>No reserved instances or savings plans applied.</li>
                <li style={{ marginBottom: '0.5rem' }}>Average traffic distribution assumed consistent throughout the month.</li>
                <li style={{ marginBottom: '0.5rem' }}>Data transfer costs estimated based on typical usage patterns for the selected traffic level.</li>
            </ul>

            <p style={{
                fontSize: '0.85rem',
                fontStyle: 'italic',
                color: 'var(--text-muted)',
                marginTop: '1rem',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.5rem'
            }}>
                These assumptions are used to keep estimates simple and consistent.
                Advanced configurations like multi-region deployments are outside the current scope.
            </p>
        </ExplainerSection>
    );
};

export default AssumptionsSection;
