import React from 'react';
import './AnalysisCards.css';

export default function AnalysisCards({ analysis }) {
    if (!analysis) return null;

    // Mapping the JSON keys
    const cardConfigs = [
        { key: 'general_index', title: '📊 סקירה כללית' },
        { key: 'war_impact', title: '⚔️ השפעת המלחמה' },
        { key: 'legislation_type', title: '📜 סוגי חקיקה' },
        { key: 'correlation', title: '🔄 מתאם חקיקה-שטח' }
    ];

    return (
        <div className="analysis-cards-grid">
            {cardConfigs.map(({ key, title }) => {
                const textContent = analysis[key];
                if (!textContent) return null; // Skip if the key is missing in data
                return (
                    <div key={key} className="analysis-card">
                        <div className="analysis-card-header">{title}</div>
                        <p className="analysis-card-text">{textContent}</p>
                    </div>
                );
            })}
        </div>
    );
}