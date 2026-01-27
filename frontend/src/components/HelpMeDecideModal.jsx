import React, { useState } from 'react';

const HelpMeDecideModal = ({ onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({});

    const handleAnswer = (question, answer) => {
        setAnswers(prev => ({ ...prev, [question]: answer }));
        setStep(prev => prev + 1);
    };

    const determineApplicationType = () => {
        // Deterministic logic based on answers
        const { isUserFacing, isInstant, storesData } = answers;

        if (isUserFacing && isInstant && storesData) return 'full-stack';
        if (isUserFacing && isInstant && !storesData) return 'static-website';
        if (!isUserFacing && isInstant) return 'backend-api';
        if (storesData && !isInstant) return 'file-storage';

        return 'event-driven'; // Default fallback
    };

    const finish = () => {
        const type = determineApplicationType();
        onComplete(type);
    };

    // Modal Styles
    const modalStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    };
    const contentStyle = {
        backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%'
    };
    const btnStyle = {
        display: 'block', width: '100%', padding: '1rem', marginTop: '0.5rem',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', textAlign: 'left'
    };

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2>Help Me Decide</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                {step === 1 && (
                    <div>
                        <p className="mb-4">Is your application directly used by end-users via a browser/mobile app?</p>
                        <button style={btnStyle} onClick={() => handleAnswer('isUserFacing', true)}>Yes, users interact with it directly</button>
                        <button style={btnStyle} onClick={() => handleAnswer('isUserFacing', false)}>No, it runs in the background or consumed by other systems</button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <p className="mb-4">Does it need to respond instantly to requests (real-time)?</p>
                        <button style={btnStyle} onClick={() => handleAnswer('isInstant', true)}>Yes, low latency is critical</button>
                        <button style={btnStyle} onClick={() => handleAnswer('isInstant', false)}>No, it processes tasks asynchronously</button>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <p className="mb-4">Does it need to store and retrieve structured data (like user profiles, orders)?</p>
                        <button style={btnStyle} onClick={() => {
                            setAnswers(prev => ({ ...prev, storesData: true }));
                            finish(); // Finish after last question
                        }}>Yes, it needs a database</button>
                        <button style={btnStyle} onClick={() => {
                            setAnswers(prev => ({ ...prev, storesData: false }));
                            finish(); // Finish after last question
                        }}>No, it handles logic or files only</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpMeDecideModal;
