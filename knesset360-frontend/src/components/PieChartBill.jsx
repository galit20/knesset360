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
                marginBottom: '10px'
                }}
            >
            <svg width="12" height="12" style={{ marginLeft: '10px', flexShrink: 0 }}>
                <circle cx="6" cy="6" r="6" fill={entry.color} />
            </svg>
                
            <span style={{ color: '#374151', fontSize: '18px', textAlign: 'right' }}>
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
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}  // Creates the donut hole
                        outerRadius={130}
                        paddingAngle={2}  // Visual gap between slices
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
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};