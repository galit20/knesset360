import { useState, useEffect, useMemo } from 'react';

import StatusPieChart from '../components/PieChartBill'
import './Timeline.css'


import { 
    ScatterChart, 
    Scatter,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

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
                barMap[kNum] = { knessetnum: kNum };
            }
            barMap[kNum][sId] = (barMap[kNum][sId] || 0) + 1;
        }
        return {
            pieData: Object.values(pie_accumulator),
            barData: Object.values(barMap)
        };
    }, [billsData]); 


    const [selectedKnesset, setSelectedKnesset] = useState(null);
    // Filter bills for the table based on bar selection
    const billsForTable = useMemo(() => {
    if (!selectedKnesset) return [];
        return billsData.filter(b => b.knessetnum === selectedKnesset);
    }, [selectedKnesset, billsData]);

    const [selectedStatus, setSelectedStatus] = useState(null);
    // Filter bills for the table based on pie selection
    const billsForTableByStatus = useMemo(() => {
    if (!selectedStatus) return [];
        return billsData.filter(b => b.statusid === selectedStatus);
    }, [selectedStatus, billsData]);

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

            <div className="box-chart-container">
                <StatusPieChart 
                    pieData={pieData}
                    total={totalBills}
                    title="התפלגות סטטוס הצעות חוק"
                    onSliceClick={(data) => {
                        if (data) {
                            setSelectedStatus(Number(data.payload.statusId));
                            setSelectedKnesset(null);
                        }
                    }} 
                />
                <div className="chart-container">
                    <h2 style={{ textAlign: 'center', color: '#374151', marginBottom: '20px' }}>
                    התפלגות הצעות חוק על פי כנסות
                    </h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="knessetnum" label={{ value: 'מספר כנסת', position: 'insideBottom', offset: -5 }} />
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
                                onClick={(data) => {
                                    if (data) {
                                        setSelectedKnesset(data.payload.knessetnum);
                                        setSelectedStatus(null);
                                    }
                                }}
                            />
                        ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {selectedKnesset && (
            <div style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row-reverse',
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    padding: '16px 20px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    position: 'sticky',        
                    top: 0,                     
                    zIndex: 10                  
                }}>
                    <h3 style={{ margin: 0, color: '#1f2937' }}>הצעות חוק בכנסת ה-{selectedKnesset}</h3>
                    <button 
                        onClick={() => setSelectedKnesset(null)} 
                        style={{ 
                            backgroundColor: '#3b82f6', // Bright blue
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',                // Space between the text and the X
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>✕</span>
                        <span>סגור</span>
                    </button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th>מספר הצעה</th>
                            <th>שם הצעה</th>
                            <th>סטטוס</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billsForTable.map(bill => (
                            <tr key={bill.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{bill.id}</td>
                                <td>{bill.name}</td>
                                <td>{STATUS_DESC[bill.statusid]}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {selectedStatus && (
            <div style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row-reverse',
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    padding: '16px 20px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    position: 'sticky',        
                    top: 0,                     
                    zIndex: 10                  
                }}>
                    <h3 style={{ margin: 0, color: '#1f2937' }}>הצעות חוק בסטטוס - {STATUS_DESC[selectedStatus]}</h3>
                    <button 
                        onClick={() => setSelectedStatus(null)} 
                        style={{ 
                            backgroundColor: '#3b82f6', // Bright blue
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',                // Space between the text and the X
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>✕</span>
                        <span>סגור</span>
                    </button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse', direction: 'rtl'}}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 9 }}>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                <th>מספר הצעה</th>
                                <th>שם הצעה</th>
                                <th>יוזמים</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billsForTableByStatus.map(bill => (
                            <tr key={bill.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{bill.id}</td>
                                <td>{bill.name}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
    );
}