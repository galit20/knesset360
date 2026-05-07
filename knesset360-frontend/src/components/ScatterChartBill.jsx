import {    
    ScatterChart, 
    Scatter,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

import './ChartUI.css'

import { STATUS_COLORS, STATUS_DESC } from '../utils/billStatus'

// Return a custom dot according to bill status by colors up top.
const NewDot = (props) => {
    const { cx, cy, payload } = props;
    const dotColor = STATUS_COLORS[payload.statusid] || '#292e36';
    return (
        <circle 
            cx={cx} 
            cy={cy} 
            r={6} /* The size of the dot */
            fill={dotColor} 
        />
    );
};


// custom tooltip when hovering over a dot, it shows the bill info
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
            maxWidth: '300px'}}>
        
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>
                Knesset: {bill.knessetnum}
            </p>
            <span style={{ 
                display: 'inline-block',
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                backgroundColor: STATUS_COLORS[bill.statusid] || '#9ca3af',
                color: '#fff',
                marginBottom: '10px'
            }}>
                {STATUS_DESC[bill.statusid]}
            </span>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827'}}>
                {bill.name}
            </p>
            <div style={{ margin: 0, fontSize: '14px', color: '#3b82f6', fontWeight: '500' }}>
                👤 יוזמים:
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', color: '#4b5563', fontSize: '13px', fontWeight: 'normal' }}>
                    {bill.initiators_info.map((person, index) => (
                        <li key={index}>{person.name}</li>
                    ))}
                </ul>
            </div>
        </div>
        );
    }
    return null;
};

export default function ScatterChartBills ({ billsData }) {
    return (
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
                    <Scatter name="Bills" data={billsData} shape={<NewDot />}></Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};