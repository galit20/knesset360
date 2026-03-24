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


const STATUS_COLORS = {
    104: '#3b82f6', // (Started - הונחה על שולחן הכנסת לדיון מוקדם)            = Blue
    108: '#f59e0b', // (Passed first step - הכנה לקריאה ראשונה)                 = Orange
    113: '#40c320', // (Passed second step - הכנה לקריאה שנייה ושלישית)         = Green
    118: '#106b31', // (Passed - התקבלה בקריאה שלישית)                          = Forest Green
    122: '#640cca', // (Merged with another bill - מוזגה עם הצעת חוק אחרת)      = Purple
    124: '#b71adb', // (Moved to daily meeting - הוסבה להצעה לסדר היום)         = Pink
    150: '#0bbfbf', // (In Committee for the first step - במליאה לדיון מוקדם)   = Light Blue
    177: '#d62a2a', // (Stopped - נעצרה)                                         = Red
};

const STATUS_DESC = {
    104: "הונחה על שולחן הכנסת לדיון מוקדם",
    108: "הכנה לקריאה ראשונה",
    113: "הכנה לקריאה שנייה ושלישית",
    118: "התקבלה בקריאה שלישית",
    122: "מוזגה עם הצעת חוק אחרת",
    124: "הוסבה להצעה לסדר היום",
    150: "במליאה לדיון מוקדם",
    177: "נעצרה"
};

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


};


export default function TimelinePage() {
    // hold the data from the server
    const [billsData, setBillData] = useState([]);

    // fetch the data from FastAPI when the page loads
    useEffect(() => {
        fetch('http://localhost:8000/api/timeline')
            .then(response => response.json())      // convert the server response to JSON
            .then(data => setBillData(data))        // save to your react state
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
                        <Scatter name="Bills" data={billsData} shape={<NewDot />}></Scatter>
                </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}