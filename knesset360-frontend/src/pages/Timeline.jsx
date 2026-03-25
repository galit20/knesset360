import { useState, useEffect, useMemo } from 'react';

import { 
    ScatterChart, 
    Scatter,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Label,
    Legend,
    BarChart,
    Bar
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

    const totalBills = billsData.length;

    const { pieData, barData } = useMemo(() => {
        if (!billsData || billsData.length === 0) 
            return { pieData: [], barData: [] };

        const pie_accumulator = Object.keys(STATUS_DESC).reduce((acc, key) => {
            acc[key] = { name: STATUS_DESC[key], value: 0, statusId: key, fill: STATUS_COLORS[key] };
            return acc;
        }, {});
        const barMap = {};

        for (const bill of billsData) {
            const sId = bill.statusid;
            const kNum = bill.knessetnum;

            pie_accumulator[sId].value += 1; // update the pie chart data - count by status of bill

            if (!barMap[kNum]) {
                barMap[kNum] = { knessetNum: kNum };
            }
            barMap[kNum][sId] = (barMap[kNum][sId] || 0) + 1;
        }
        return {
            pieData: Object.values(pie_accumulator),
            barData: Object.values(barMap)
        };
    }, [billsData]); 


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
            <div style={{ 
                    display: 'flex', 
                    gap: '20px',
                    width: '100%', 
                    direction: 'rtl',
                    marginBottom: '40px' 
                }}>
                <div style={{ 
                            width: '50%',
                            height: 450,
                            marginBottom: '20px',
                            direction: 'rtl',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '20px',          
                            backgroundColor: '#ffffff', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }}>
                    <h2 style={{ textAlign: 'center', color: '#374151', marginBottom: '20px' }}>
                    התפלגות סטטוס הצעות חוק
                    </h2>
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
                            >
                            <Label 
                                value={totalBills} 
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
                <div style={{ 
                            width: '50%',
                            height: 450,
                            marginBottom: '20px',
                            direction: 'rtl',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '20px',          
                            backgroundColor: '#ffffff', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="knessetNum" label={{ value: 'מספר כנסת', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'כמות הצעות', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        {Object.keys(STATUS_DESC).map((statusId) => (
                            <Bar 
                                key={statusId}
                                dataKey={statusId} 
                                name={STATUS_DESC[statusId]} 
                                stackId="a" 
                                fill={STATUS_COLORS[statusId]} 
                                cursor="pointer"
                            />
                        ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}