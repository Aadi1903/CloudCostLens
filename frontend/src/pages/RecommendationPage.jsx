import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import CostBreakdown from '../components/CostBreakdown';
import FeedbackModal from '../components/FeedbackModal';
import { jsPDF } from 'jspdf';
import ReasoningSection from '../components/ReasoningSection';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import AssumptionsSection from '../components/AssumptionsSection';

const RecommendationPage = () => {
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [requirements, setRequirements] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedArchitecture, setSelectedArchitecture] = useState(null);

    useEffect(() => {
        const storedRecommendation = sessionStorage.getItem('recommendation');
        const storedRequirements = sessionStorage.getItem('requirements');

        if (!storedRecommendation || !storedRequirements) {
            navigate('/requirements');
            return;
        }

        const rec = JSON.parse(storedRecommendation);
        const req = JSON.parse(storedRequirements);

        setRecommendation(rec);
        setRequirements(req);

        // Initialize with recommended architecture as default selection
        setSelectedArchitecture({
            name: 'Recommended Architecture',
            services: rec.architecture,
            totalCost: rec.totalCost,
            optionalUpgrades: rec.optionalUpgrades || [],
            isRecommended: true
        });
    }, [navigate]);

    const handleSelectArchitecture = (architecture) => {
        setSelectedArchitecture(architecture);
    };

    const handleDownloadPDF = () => {
        if (!selectedArchitecture) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('CloudCostLens Report', 20, 20);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);

        doc.line(20, 32, 190, 32);

        // Selected Architecture Name
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Selected: ${selectedArchitecture.name}`, 20, 40);

        // User Requirements Summary
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('User Requirements', 20, 50);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        let y = 58;
        doc.text(`Application Type: ${requirements.applicationType}`, 25, y);
        y += 6;
        doc.text(`Traffic Level: ${requirements.traffic}`, 25, y);
        y += 6;
        doc.text(`Storage: ${requirements.storageGB} GB`, 25, y);
        y += 6;
        doc.text(`Database Required: ${requirements.databaseNeeded ? 'Yes' : 'No'}`, 25, y);
        y += 6;
        doc.text(`Operational Preference: ${requirements.operationalEffort}`, 25, y);
        y += 6;
        doc.text(`Monthly Budget: $${requirements.monthlyBudget.toFixed(2)} (≈ ₹${(requirements.monthlyBudget * 84).toFixed(0)})`, 25, y);

        y += 10;
        doc.line(20, y, 190, y);

        // Service Breakdown
        y += 8;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Service-wise Cost Breakdown', 20, y);

        y += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        selectedArchitecture.services.forEach((service) => {
            const usdCost = `$${service.estimatedCost.toFixed(2)}`;
            const inrCost = `≈ ₹${(service.estimatedCost * 84).toFixed(0)}`;
            doc.text(`${service.service} (${service.category})`, 25, y);
            doc.text(usdCost, 140, y);
            doc.text(inrCost, 165, y);
            y += 6;
        });

        y += 4;
        doc.line(20, y, 190, y);

        // Total Cost
        y += 8;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Total Estimated Monthly Cost:', 20, y);

        y += 8;
        doc.setFontSize(16);
        doc.text(`$${selectedArchitecture.totalCost.toFixed(2)}`, 20, y);

        y += 7;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`≈ ₹${(selectedArchitecture.totalCost * 84).toFixed(0)} (approx)`, 20, y);

        y += 10;

        // Optional Upgrades (if available)
        if (selectedArchitecture.optionalUpgrades && selectedArchitecture.optionalUpgrades.length > 0) {
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Optional Upgrades Available:', 20, y);

            y += 8;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            selectedArchitecture.optionalUpgrades.forEach((upgrade) => {
                doc.text(`• ${upgrade}`, 25, y);
                y += 6;
            });

            y += 4;
        }

        // Disclaimer
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.text('All costs are estimates for planning purposes only. Actual AWS bills may vary.', 20, y);
        y += 5;
        doc.text('INR values are approximate and may vary based on exchange rate.', 20, y);

        doc.save('cloudcostlens-estimate.pdf');
    };

    if (!recommendation || !requirements) {
        return null;
    }

    return (
        <div className="section">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1>Your AWS Architecture Recommendation</h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                        Based on your requirements, here's our recommended AWS architecture
                    </p>
                </div>

                {/* Status Message */}
                {recommendation.message && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: recommendation.withinBudget ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)',
                        border: `1px solid ${recommendation.withinBudget ? 'var(--success)' : 'var(--error)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: recommendation.withinBudget ? 'var(--success)' : 'var(--error)',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {recommendation.message}
                    </div>
                )}

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                    {/* Recommended Services */}
                    <div>
                        <h2 className="mb-3">Recommended Architecture</h2>

                        {/* Recommended Architecture Card */}
                        <div
                            className="card"
                            style={{
                                border: selectedArchitecture?.isRecommended ? '2px solid var(--success)' : '1px solid var(--border)',
                                backgroundColor: selectedArchitecture?.isRecommended ? 'rgba(72, 187, 120, 0.05)' : 'transparent',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Recommended Architecture</h3>
                                {selectedArchitecture?.isRecommended ? (
                                    <span style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--success)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem',
                                        fontWeight: '600'
                                    }}>
                                        ✓ Currently Selected
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleSelectArchitecture({
                                            name: 'Recommended Architecture',
                                            services: recommendation.architecture,
                                            totalCost: recommendation.totalCost,
                                            optionalUpgrades: recommendation.optionalUpgrades || [],
                                            isRecommended: true
                                        })}
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.875rem' }}
                                    >
                                        Select this option
                                    </button>
                                )}
                            </div>

                            {selectedArchitecture?.isRecommended && (
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--success)',
                                    marginBottom: '1rem',
                                    fontStyle: 'italic'
                                }}>
                                    You've selected this architecture. You can switch anytime.
                                </p>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {recommendation.architecture.map((service, index) => (
                                    <ServiceCard
                                        key={index}
                                        service={service.service}
                                        category={service.category}
                                        reason={service.reason}
                                        cost={service.estimatedCost}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Explanatory Sections */}
                        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                            <ArchitectureDiagram selectedArchitecture={selectedArchitecture} />
                            <ReasoningSection selectedArchitecture={selectedArchitecture} requirements={requirements} />
                        </div>

                        {/* Optional Upgrades - now based on selected architecture */}
                        {selectedArchitecture?.optionalUpgrades && selectedArchitecture.optionalUpgrades.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 className="mb-2" style={{ color: 'var(--primary)' }}>Optional Upgrades Available</h3>
                                <div className="card" style={{ backgroundColor: 'rgba(56, 178, 172, 0.05)', border: '1px solid var(--primary)' }}>
                                    <p style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: '500' }}>
                                        You still have ~${(recommendation.budget - selectedArchitecture.totalCost).toFixed(2)} available in your budget.
                                        You may consider the following improvements:
                                    </p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                        {selectedArchitecture.optionalUpgrades.map((upgrade, idx) => (
                                            <li key={idx} style={{ marginBottom: '0.5rem' }}>{upgrade}</li>
                                        ))}
                                    </ul>
                                    <p style={{ fontSize: '0.875rem', marginTop: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                        These upgrades were not included by default because your current requirements do not strictly require them.
                                    </p>
                                </div>
                            </div>
                        )}

                        <AssumptionsSection />
                    </div>

                    {/* Cost Breakdown - now based on selected architecture */}
                    <div>
                        {selectedArchitecture && (
                            <CostBreakdown
                                services={selectedArchitecture.services}
                                totalCost={selectedArchitecture.totalCost}
                                budget={recommendation.budget}
                                withinBudget={selectedArchitecture.totalCost <= recommendation.budget}
                            />
                        )}
                        <button
                            onClick={handleDownloadPDF}
                            className="btn btn-primary mt-4"
                            style={{ width: '100%' }}
                        >
                            Download Cost Breakdown (PDF)
                        </button>
                    </div>
                </div>

                {/* Alternative Architectures */}
                {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                    <div>
                        <h2 className="mb-3">Alternative Architectures</h2>
                        <div className="grid grid-2">
                            {recommendation.alternatives.map((alt, index) => {
                                const isSelected = selectedArchitecture?.name === alt.name && !selectedArchitecture?.isRecommended;

                                return (
                                    <div
                                        key={index}
                                        className="card"
                                        style={{
                                            border: isSelected ? '2px solid var(--success)' : '1px solid var(--border)',
                                            backgroundColor: isSelected ? 'rgba(72, 187, 120, 0.05)' : 'transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <h3 className="card-title">{alt.name}</h3>
                                            {isSelected ? (
                                                <span style={{
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: 'var(--success)',
                                                    color: 'white',
                                                    borderRadius: 'var(--radius-md)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    ✓ Selected
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSelectArchitecture({
                                                        name: alt.name,
                                                        services: alt.services.map(serviceName => {
                                                            // Find the service details from the full service list
                                                            const serviceDetail = recommendation.architecture.find(s => s.service === serviceName);
                                                            return serviceDetail || { service: serviceName, category: 'unknown', reason: '', estimatedCost: 0 };
                                                        }),
                                                        totalCost: alt.totalCost,
                                                        optionalUpgrades: [], // Alternatives don't have upgrades by default
                                                        isRecommended: false
                                                    })}
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                                                >
                                                    Select this option
                                                </button>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--success)',
                                                marginBottom: '1rem',
                                                fontStyle: 'italic'
                                            }}>
                                                You've selected this architecture. You can switch anytime.
                                            </p>
                                        )}

                                        <p className="card-content">{alt.description}</p>

                                        <div style={{ marginTop: '1rem' }}>
                                            <strong>Services:</strong>
                                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                                {alt.services.map((service, idx) => (
                                                    <li key={idx} style={{ color: 'var(--text-secondary)' }}>{service}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: '600' }}>Estimated Cost:</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                                    ${alt.totalCost.toFixed(2)}/mo
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    ≈ ₹{(alt.totalCost * 84).toFixed(0)} (approx)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{
                    marginTop: '3rem',
                    padding: '2rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                }}>
                    <h3 className="mb-2">Want to Try Different Requirements?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Adjust your application requirements to see how recommendations change
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/requirements')}
                            className="btn btn-primary"
                        >
                            Try Different Requirements
                        </button>
                        <button
                            onClick={() => setShowFeedbackModal(true)}
                            className="btn"
                            style={{ border: '1px solid var(--border)' }}
                        >
                            Give Feedback
                        </button>
                    </div>
                </div>

                {showFeedbackModal && (
                    <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
                )}
            </div>
        </div>
    );
};

export default RecommendationPage;
