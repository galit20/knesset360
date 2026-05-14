import {
    ComposedChart,
    Line,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { useMemo } from 'react';


import './ChartUI.css'

import { STATUS_COLORS, STATUS_DESC } from '../utils/billStatus'

// Return a custom dot to create a lollipop effect
const NeedleDot = (props) => {
    const { cx, cy, payload } = props;

    if (!payload || !payload.bills || payload.bills.length === 0) {
        return <circle cx={cx} cy={cy} r={6} fill="#ccc" />;
    }

    const multipleBills = payload.bill_count > 1;
    const dotColor = STATUS_COLORS[payload.bills[0].statusid];
    let targetY = (450 * (1 - payload.targetScore / 100)); // convert to pixels
    return (
        <g>
            {/* The Vertical Needle */}
            <line 
                x1={cx} 
                y1={cy} 
                x2={cx} 
                y2={targetY} 
                stroke={dotColor} 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                opacity={0.4}
            />
            <circle cx={cx} cy={cy} r={multipleBills ? 8 + payload.bill_count : 6} fill={dotColor} stroke="#fff" strokeWidth={2} />
            {multipleBills && (
                <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="bold">
                    {payload.bill_count}
                </text>
            )}
        </g>
    );

};

const MergedTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    // 1. Check if we have Bill data in the payload
    // We look for a payload item that has the 'name' property (unique to bills)
    
    const data = payload[0].payload;
    
    // --- IF HOVERING A BILL_GROUP ---
    if (data.bills) {
        const dotColor = data.bill_count > 1 ? '#4b5563' : STATUS_COLORS[data.bills[0].statusid];
        return (
            <div className="custom-tooltip bill-tooltip" 
                style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '15px', 
                    border: `2px solid ${dotColor}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxWidth: '400px',
                    direction: 'rtl',
                    textAlign: 'right'
                }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#6b7280' }}>
                    כנסת: {data.knessetnum} | {new Date(data.publishdate).toLocaleDateString('he-IL')}
                </p>
            
                {data.bills.map((bill, idx) => (
                    <div key={bill.id} style={{ marginBottom: idx !== data.bill_count - 1 ? '12px' : '0' }}>
                        <span style={{ 
                            display: 'inline-block',
                            padding: '2px 8px', 
                            borderRadius: '10px', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            backgroundColor: STATUS_COLORS[bill.statusid],
                            color: '#fff',
                            marginBottom: '10px'
                        }}>
                            {STATUS_DESC[bill.statusid]}
                        </span>
                        <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827'}}>
                            {bill.name}
                        </p>
                        <div style={{ fontSize: '13px', color: '#4b5563' }}>
                            <strong>👤 יוזמים:</strong>{' '}
                            {bill.initiators_info?.length < 4 ? (
                                /* Show first 3 in a row */
                                bill.initiators_info.map(p => p.name).join(', ')
                            ) : (
                                /* If 4 or more: Show the first 3 + the remaining count */
                                <>
                                    {bill.initiators_info.slice(0, 3).map(p => p.name).join(', ')}
                                    <span style={{ fontWeight: 'bold', color: '#8884d8' }}>
                                        {` +${bill.initiators_info.length - 3}`}
                                    </span>
                                </>
                            )}
                        </div>
                        {idx !== data.bill_count - 1 && <hr style={{ opacity: 0.4, margin: '8px 0' }} />}
                    </div>
                ))}
            </div>
        );
    }

    // --- IF HOVERING THE LINE (SCORE) ---
    if (data.score !== undefined) {
        return (
            <div style={{
                backgroundColor: '#fff',
                padding: '10px',
                border: '1px solid #8884d8',
                borderRadius: '8px',
                direction: 'rtl',
                textAlign: 'right',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                    {data.month}/{data.year}
                </p>
                <p style={{ color: '#8884d8', margin: '3px 0' }}>
                    ציון בטיחות: <strong>{data.score}</strong>
                </p>
                <hr style={{ border: '0.5px solid #eee' }} />
                <p style={{ fontSize: '0.9rem', margin: '3px 0' }}>💀 קטלניות: {data.fatal}</p>
                <p style={{ fontSize: '0.9rem', margin: '3px 0' }}>🚑 קשות: {data.severe}</p>
                <p style={{ fontSize: '0.9rem', margin: '3px 0' }}>🤕 קלות: {data.light}</p>
            </div>
        );
    }

    return null;
};


//TODO: check the parenthesis
const refineName = (name) => {

}

export default function TimelineImpactChart({ billsData, scoreData }) {

    const chartData = useMemo(() => {
        // 1. Process Scores
        const formattedScores = scoreData.map(s => ({
            ...s,
            timestamp: new Date(s.year, s.month - 1, 28).getTime(), // the 28's of the month to indicate the end of it
            type: 'score',
        }));

        const groups = {}; // group bills by same publication date

        billsData.forEach(bill => {
            const date = bill.publishdate;
            const billTs = new Date(date).getTime();
            
            if (!groups[date]) {
                groups[date] = {
                    publishdate: date,
                    knessetnum: bill.knessetnum,
                    timestamp: billTs,
                    bills: [],
                    type: 'bill_group'
                };
            }
            const newBill = {
                id: bill.id,
                name: bill.name.substring(bill.name.indexOf("(") + 1, bill.name.indexOf("),")), // only showing name of the bill
                initiators_info: bill.initiators_info,
                statusid: bill.statusid,
            }
            groups[date].bills.push(newBill);
        });

        const formattedBills = Object.values(groups).map(group => {            
            // Calculate the interpolated score once for the whole group
            let interpolatedScore = 0;
            const nextScoreIndex = formattedScores.findIndex(s => s.timestamp >= group.timestamp);
            if (nextScoreIndex === -1) 
                interpolatedScore = formattedScores[formattedScores.length - 1]?.score || 0;
            else if (nextScoreIndex <= 0) 
                interpolatedScore = formattedScores[0]?.score || 0;
            else {
                const prev = formattedScores[nextScoreIndex - 1];
                const next = formattedScores[nextScoreIndex];
                interpolatedScore = prev.score + (group.timestamp - prev.timestamp) * ((next.score - prev.score) / (next.timestamp - prev.timestamp));
            }
            return {
                ...group,
                bill_count: group.bills.length,
                targetScore: interpolatedScore,
                visualY: interpolatedScore + 10 + (group.bills[0]?.id % 25) * 4,
            };
        });

        const merged = [...formattedScores, ...formattedBills].sort((a, b) => a.timestamp - b.timestamp); // for better view

        // Return all three so we don't have to calculate them again
        return { merged, formattedBills, formattedScores };
    }, [billsData, scoreData]);

    //xAxis to show only months - will change later to 3 or 4 months for better view
    const scoreTicks = useMemo(() => {
        return chartData.formattedScores.map(d => d.timestamp);    
    },[chartData.formattedScores]);

    return (
        <div className="big-chart-container">
            <h2 className='title-content'>השפעת חקיקה על מדד הבטיחות</h2>
            <div style={ {height: "500px" }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData.merged} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                    
                    <XAxis 
                        dataKey="timestamp" 
                        type="number" 
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}
                        tick={{ fontSize: 12 }}
                        ticks={scoreTicks}
                    />
                    
                    {/* Y-Axis for the Safety Score (0-100) */}
                    <YAxis 
                        yAxisId="left"
                        domain={[0, 100]} 
                        tickCount={6}
                        label={{ value: 'ציון בטיחות', angle: -90, position: 'insideLeft' }}
                    />
                    {/* The Safety Score Line */}
                    <Line
                        name="score-line"
                        yAxisId="left"
                        type="monotone"
                        dataKey="score"
                        stroke="#8884d8"
                        strokeWidth={4}
                        activeDot={{ r: 8, strokeWidth: 0 }} // Shows when hover
                        dot={false}
                        connectNulls // for Continuous function view
                    />

                    {/* The Bills Scatter */}
                    <Scatter
                        name="bill-dot"
                        shape={<NeedleDot />}
                        dataKey="visualY"
                    />
                    <Tooltip 
                        content={<MergedTooltip />} 
                        shared={false} 
                        trigger="item" 
                    />                
                </ComposedChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
}