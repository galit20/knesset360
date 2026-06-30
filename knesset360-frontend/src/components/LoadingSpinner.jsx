import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ text = "טוען נתונים..." }) {
    return (
        <div className="spinner-container">
            <div className="spinner-circle"></div>
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );
}