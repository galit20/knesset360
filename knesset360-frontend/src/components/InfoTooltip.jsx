import React, { useState, useRef } from 'react';
import './InfoTooltip.css';

const InfoTooltip = ({ text }) => {
    const [dynamicPosition, setDynamicPosition] = useState('left');     // Default to 'left'

    const containerRef = useRef(null);
    const tooltipRef = useRef(null);

    const calculatePosition = () => {
        if (!containerRef.current || !tooltipRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Measure how much empty space we have on the screen relative to the icon
        const spaceOnLeft = containerRect.left;
        const spaceOnRight = viewportWidth - containerRect.right;
        
        // Use the actual rendered width of the tooltip, or fallback to our max-width (300)
        const tooltipWidth = tooltipRect.width || 300;

        // First choice: Left (Best for Hebrew/RTL)
        if (spaceOnLeft >= tooltipWidth + 20) { 
            setDynamicPosition('left');
        } 
        // Second choice: Right (If it's cut off on the left but has room on the right)
        else if (spaceOnRight >= tooltipWidth + 20) {
            setDynamicPosition('right');
        } 
        // Fallback: Bottom (If screen is too narrow on both sides)
        else {
            setDynamicPosition('bottom');
        }
    };

    return (
        <div 
            className="tooltip-container" 
            ref={containerRef}
            onMouseEnter={calculatePosition} // Calculates exactly as the mouse enters
        >
            <svg 
                className="info-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            
            {/* Applies the dynamically calculated class */}
            <div className={`tooltip-text ${dynamicPosition}`} ref={tooltipRef}>
                {text}
            </div>
        </div>
    );
};

export default InfoTooltip;