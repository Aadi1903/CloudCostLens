import React from 'react';
import ExplainerSection from './ExplainerSection';

const ReasoningSection = ({ selectedArchitecture, requirements }) => {
    if (!selectedArchitecture || !requirements) return null;

    const services = selectedArchitecture.services;
    const isServerless = services.some(s => s.service.includes('Lambda') || s.service.includes('Fargate'));
    const isEC2 = services.some(s => s.service.includes('EC2'));
    const isBudgetTight = requirements.monthlyBudget < 50;
    const isLowOps = requirements.operationalEffort === 'Low' || requirements.operationalEffort === 'None';
    const hasLoadBalancer = services.some(s => s.category.toLowerCase() === 'networking' || s.service.includes('Balancer'));

    return (
        <ExplainerSection title="Design decisions and constraints">
            {/* A. Rejected Options */}
            <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', marginTop: 0 }}>
                    Rejected Options
                </h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem' }}>
                    {isServerless ? (
                        <li>
                            <strong>EC2/VM-based solutions:</strong> Excluded to avoid paying for idle compute time and to minimize OS patching/maintenance overhead.
                        </li>
                    ) : (
                        <li>
                            <strong>Serverless functions (Lambda):</strong> Rejected in favor of EC2-based control for consistent, long-running computational workloads.
                        </li>
                    )}

                    {!hasLoadBalancer && (
                        <li>
                            <strong>Dedicated Load Balancing:</strong> Excluded because the estimated traffic volume does not justify the additional hourly fixed costs of an ALB/NLB.
                        </li>
                    )}
                </ul>
            </div>

            {/* B. Trade-offs */}
            <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', marginTop: 0 }}>
                    Key Trade-offs
                </h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem' }}>
                    {isBudgetTight && (
                        <li>
                            <strong>Availability vs. Cost:</strong> High availability (Multi-AZ) was deprioritized to ensure the architecture stays strictly within the small monthly budget.
                        </li>
                    )}
                    {isLowOps ? (
                        <li>
                            <strong>Control vs. Convenience:</strong> Fine-grained infrastructure control was traded off for automated management (managed services) to match your "Low" operational preference.
                        </li>
                    ) : (
                        <li>
                            <strong>Convenience vs. Cost/Control:</strong> Higher-level managed abstractions were traded off to provide maximum configurability and potential cost optimization.
                        </li>
                    )}
                    <li>
                        <strong>Simplicity vs. Scalability:</strong> The design favors a minimal moving-parts approach over complex auto-scaling groups for this scale of recommendation.
                    </li>
                </ul>
            </div>

            {/* C. Constraint-Driven Decisions */}
            <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', marginTop: 0 }}>
                    Constraint Impact
                </h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem' }}>
                    <li>
                        <strong>Budget limit (${requirements.monthlyBudget}):</strong> Strictly limited the selection of premium features like Global Accelerators or Provisioned IOPS.
                    </li>
                    <li>
                        <strong>Traffic Perception ({requirements.traffic}):</strong> Influenced the decision to {hasLoadBalancer ? 'include' : 'exclude'} complex networking layers.
                    </li>
                </ul>
            </div>
        </ExplainerSection>
    );
};

export default ReasoningSection;
