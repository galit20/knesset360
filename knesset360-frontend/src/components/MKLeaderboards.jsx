import './InitiatorCard.css';
import userSvg from '../assets/user.svg';

import { getMkNameByID } from '../utils/mkId';

const handleError = (e) => {
    e.target.src = userSvg;
};

export default function MKLeaderboardChart({ mks = [], selectedMkId, onMkSelect, title, countText}) {
    // Dynamically calculate the maximum count to calibrate the 100% chart width bar
    const maxCount = mks.length > 0 ? Math.max(...mks.map(m => m.count)) : 1;

    return (
        <div style={{ 
            direction: 'rtl', 
            background: '#fff', 
            padding: '25px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>
                {title}
            </h3>

            {/* Injecting scrollbar styles directly so you don't need a separate CSS file */}
            <style>{`
                .scrollable-leaderboard-list::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollable-leaderboard-list::-webkit-scrollbar-track {
                    background: #f1f2f6;
                    border-radius: 10px;
                }
                .scrollable-leaderboard-list::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .scrollable-leaderboard-list::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            {/* The Scroll Container */}
            <div 
                className="scrollable-leaderboard-list"
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    maxHeight: '375px',      
                    overflowY: 'auto',       
                    paddingLeft: '10px',     
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 #f1f2f6'
                }}
            >
                {mks.map((mk, index) => {
                    const isSelected = selectedMkId === mk.id;
                    const barWidth = `${(mk.count / maxCount) * 100}%`;
                    const cleanName = getMkNameByID(mk.id); // Use the utility function to get the clean name

                    return (
                        <div 
                            key={mk.id}
                            onClick={() => onMkSelect && onMkSelect(mk.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: isSelected ? '#f0f7ff' : 'transparent',
                                border: isSelected ? '1px solid #3498db' : '1px solid transparent',
                                transition: 'all 0.15s ease-in-out',
                                flexShrink: 0 // Prevents the flex rows from squishing inside the scroll frame
                            }}
                            onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.background = '#f8f9fa' }}
                            onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                        >
                            {/* Rank Positioning Label */}
                            <span style={{ 
                                fontSize: '15px', 
                                fontWeight: 'bold', 
                                color: index === 0 ? '#ddb619' : index === 1 ? '#9da5a6' : index === 2 ? '#cc7020' : '#6b69a8',
                                width: '22px',
                                textAlign: 'center'
                            }}>
                                {index + 1}
                            </span>

                            {/* Member Picture */}
                            <img 
                                src={`/mk-photos/${mk.id}.jpg`}
                                alt={cleanName}
                                onError={handleError}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '3px solid ' + (index === 0 ? '#ddb619' : index === 1 ? '#9da5a6' : index === 2 ? '#cc7020' : '#6b69a8'),
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                                }}
                            />

                            {/* 3. Graph Bars Layout Engine */}
                            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '600', color: '#34495e' }}>
                                    {cleanName}
                                </span>
                                
                                <div style={{ width: '100%', height: '10px', background: '#ecf0f1', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: barWidth, 
                                        height: '100%', 
                                        background: index === 0 ? 'linear-gradient(90deg, #f1c40f, #f39c12)' : 'linear-gradient(90deg, #3498db, #2980b9)', 
                                        borderRadius: '5px',
                                        transition: 'width 0.5s ease-out'
                                    }} />
                                </div>
                            </div>

                            {/* 4. Metric Output Label */}
                            <div style={{ minWidth: '70px', textAlign: 'left' }}>
                                <strong style={{ fontSize: '15px', color: '#2c3e50', display: 'block' }}>
                                    {mk.count.toLocaleString()}
                                </strong>
                                <span style={{ display: 'block', fontSize: '11px', color: '#95a5a6', marginTop: '-2px' }}>
                                    {countText || 'אזכורים'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}