import React from 'react';

const AboutPage = () => {
    return (
        <div className="section">
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="text-center mb-4">
                    <h1>About This Project</h1>
                </div>

                {/* Project Goal */}
                <div className="card mb-3">
                    <h2 className="card-title">Project Goal</h2>
                    <p className="card-content">
                        CloudCostLens is an educational tool designed to help
                        developers and architects make informed decisions about AWS service selection. Our mission is to
                        simplify the complex process of choosing the right AWS services for your application while staying
                        within budget.
                    </p>
                </div>

                {/* Design Philosophy */}
                <div className="card mb-3">
                    <h2 className="card-title">Design Philosophy</h2>
                    <p className="card-content">
                        Unlike AI-powered recommendation systems, we use a <strong>deterministic, rule-based approach</strong>.
                        This means:
                    </p>
                    <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                        <li className="mb-1">
                            <strong>No AI Hallucinations:</strong> Every recommendation is based on transparent, repeatable rules
                        </li>
                        <li className="mb-1">
                            <strong>Explainable Decisions:</strong> You'll always know why a service was recommended
                        </li>
                        <li className="mb-1">
                            <strong>Budget-Safe:</strong> Cost estimates are calculated upfront to prevent overspending
                        </li>
                        <li className="mb-1">
                            <strong>Educational:</strong> Learn about AWS services and their use cases
                        </li>
                    </ul>
                </div>

                {/* How It Works */}
                <div className="card mb-3">
                    <h2 className="card-title">Decision Engine</h2>
                    <p className="card-content">
                        Our recommendation engine uses a multi-stage process:
                    </p>
                    <ol style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                        <li className="mb-1">
                            <strong>Filtering:</strong> Eliminate services that don't match your use case or constraints
                        </li>
                        <li className="mb-1">
                            <strong>Scoring:</strong> Rate eligible services using a weighted algorithm based on cost,
                            scalability, operational effort, and use case optimization
                        </li>
                        <li className="mb-1">
                            <strong>Ranking:</strong> Select the top-rated service from each category (compute, storage, database, etc.)
                        </li>
                        <li className="mb-1">
                            <strong>Cost Estimation:</strong> Calculate approximate monthly costs and validate against your budget
                        </li>
                    </ol>
                </div>

                {/* Supported Services */}
                <div className="card mb-3">
                    <h2 className="card-title">Supported AWS Services</h2>
                    <p className="card-content">
                        We currently support 17 commonly used AWS services across multiple categories:
                    </p>

                    <div className="grid grid-2 mt-2">
                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Compute</h4>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li>Amazon EC2</li>
                                <li>AWS Lambda</li>
                                <li>Amazon ECS</li>
                                <li>AWS Elastic Beanstalk</li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Storage</h4>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li>Amazon S3</li>
                                <li>Amazon EBS</li>
                                <li>Amazon EFS</li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Database</h4>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li>Amazon RDS</li>
                                <li>Amazon DynamoDB</li>
                                <li>Amazon Aurora</li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Networking</h4>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li>Amazon CloudFront</li>
                                <li>Amazon Route 53</li>
                                <li>Amazon API Gateway</li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Messaging</h4>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li>Amazon SQS</li>
                                <li>Amazon SNS</li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Other</h4>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li>Amazon CloudWatch</li>
                                <li>AWS IAM</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Limitations */}
                <div className="card mb-3">
                    <h2 className="card-title">Limitations & Assumptions</h2>
                    <ul style={{ paddingLeft: '1.5rem' }}>
                        <li className="mb-1">
                            <strong>Approximate Pricing:</strong> Cost estimates are educational and may not reflect actual AWS pricing
                        </li>
                        <li className="mb-1">
                            <strong>No Real Provisioning:</strong> This tool does not deploy or configure actual AWS resources
                        </li>
                        <li className="mb-1">
                            <strong>Limited Service Coverage:</strong> We support 17 common services, not the full AWS catalog
                        </li>
                        <li className="mb-1">
                            <strong>Target Audience:</strong> Designed for small to medium workloads, not enterprise-scale deployments
                        </li>
                        <li className="mb-1">
                            <strong>Deterministic Logic:</strong> Recommendations are rule-based and may not account for all edge cases
                        </li>
                    </ul>
                </div>

                {/* Tech Stack */}
                <div className="card">
                    <h2 className="card-title">Technology Stack</h2>
                    <div className="grid grid-2">
                        <div>
                            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Backend</h4>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li>Java Spring Boot</li>
                                <li>RESTful APIs</li>
                                <li>JSON-based data storage</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Frontend</h4>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li>React</li>
                                <li>React Router</li>
                                <li>Modern CSS</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="card mt-4">
                    <h3>Planned Enhancements (Roadmap)</h3>
                    <p>We are constantly working to improve CloudCostLens. Here is what's coming next:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                        <li><strong>Multi-Cloud Support:</strong> Support for Azure and Google Cloud Platform (GCP).</li>
                        <li><strong>Advanced Requirement Parsing:</strong> Use NLP to understand free-text requirements.</li>
                        <li><strong>Region-Specific Pricing:</strong> Dynamic pricing based on selected AWS regions.</li>
                        <li><strong>User Accounts:</strong> Save and manage multiple project estimations.</li>
                        <li><strong>Export to Terraform:</strong> Generate infrastructure-as-code templates from recommendations.</li>
                    </ul>
                    <div style={{ marginTop: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        Have a feature request? Use the "Give Feedback" button on the recommendation page!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
