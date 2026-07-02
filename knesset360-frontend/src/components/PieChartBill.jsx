import {    
    ResponsiveContainer,
    PieChart,
    Pie,
    Label,
    Legend,
    Tooltip 
} from 'recharts';

import './ChartUI.css'

// Custom Recharts Legend for Hebrew (RTL) alignment
const renderHebrewLegend = (props) => {
    const { payload } = props;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {payload.map((entry, index) => (
            <li 
                key={`item-${index}`} 
                style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start', // Keeps everything aligned to the right edge
                marginBottom: '10px',
                }}
            >
            <svg width="15" height="15" style={{ marginLeft: '8px', flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6" fill={entry.color} />
            </svg>
                
            <span style={{ color: '#374151', fontSize: '14px', textAlign: 'right' }}>
                {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
};


export default function StatusPieChart ({ pieData, total, title, onSliceClick }) {
    return (
        <div className="chart-container">
            <h2 className="title-content"> {title} </h2>
            <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"  // Creates the donut hole
                        outerRadius="85%"
                        paddingAngle={3}  // Visual gap between slices
                        onClick={onSliceClick}
                    >
                    <Label 
                        value={total} 
                        position="center" 
                        fill="#111827"
                        style={{ fontSize: '40px', fontWeight: 'bold' }}
                    />
                    </Pie>
                    <Tooltip 
                        formatter={(value) => [`${value} הצעות`]}
                        contentStyle={{ borderRadius: '8px', direction: 'rtl', textAlign: 'center' }}
                    />       
                    <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right" 
                        content={renderHebrewLegend}
                        wrapperStyle={{ width: '40%' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
};