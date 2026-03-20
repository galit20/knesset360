import { useState, useEffect } from 'react';

import { 
    ScatterChart, 
    Scatter,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

export default function TimelinePage() {
    // hold the data from the server
    const [billsData, setBillData] = useState([]);

    // fetch the data from FastAPI when the page loads
    useEffect(() => {
        fetch('http://localhost:8000/api/timeline')
            .then(response => response.json())      // convert the server response to JSON
            .then(data => setBillData(data))  // save to your react state
            .catch(error => console.error("Error fetching data:", error));
    },  []); // [] - only run this once when the page loads

    // custom tooltip when hovering over a dot, it shows the bill
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
        const bill = payload[0].payload; 
        
        return (
            <div style={{ 
                backgroundColor: '#ffffff', 
                padding: '15px', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                maxWidth: '300px'
            }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>
                    Knesset: {bill.knessetnum}
                </p>
                <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827'}}>
                    {bill.name}
                </p>
                <div style={{ margin: 0, fontSize: '14px', color: '#3b82f6', fontWeight: '500' }}>
                    👤 Initiators:
                    <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', color: '#4b5563', fontSize: '13px', fontWeight: 'normal' }}>
                    {bill.initiators.map((name, index) => (
                        <li key={index}>{name}</li>
                    ))}
                    </ul>
                </div>
            </div>
            );
        }
        return null;
    };

    return (
        <div style={{ padding: '20px', width: '95vw', margin: '0 auto'}}>
            <h1>Timeline - data check</h1>
            <p style={{ color: '#6b7280' }}>Hover over any point to see the bill details.</p>
            <div style={{ width: '100%', height: 500, marginTop: '40px' }}>
                <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                    <XAxis 
                        dataKey="knessetnum" 
                        type="category" 
                        name="Knesset Number"
                        tick={{ fontSize: 14, fill: '#6b7280', fontWeight: 'bold' }} 
                    />
                    <YAxis 
                        dataKey="stack_position" 
                        type="number" 
                        tick={false} 
                        axisLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter 
                    name="Bills" 
                        data={billsData} 
                        fill="#3b82f6" 
                        shape="circle"
                    />
                </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}