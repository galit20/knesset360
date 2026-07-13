import {
    ComposedChart,
    Line,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine
} from 'recharts';
import { useMemo, useEffect, useState } from 'react';

import './ChartUI.css'
import './TimelineImpactChart.css'
import InfoTooltip  from '../components/InfoTooltip';

import { STATUS_COLORS, STATUS_DESC, STATUS_COLORS_SHORT, getShortStatus, BILL_TYPE_CONFIG, isRejectedStatus, getActiveStepIndex, POSTPONEMENT_DESC } from '../utils/billStatus'

const KNESSETS = [
    { name: "כנסת 20", date: "2015-03-31"},
    { name: "כנסת 21", date: "2019-04-30"},
    { name: "כנסת 22", date: "2019-10-03"},
    { name: "כנסת 23", date: "2020-03-16"},
    { name: "כנסת 24", date: "2021-04-06"},
    { name: "כנסת 25", date: "2022-11-15"},
];

const HISTORICAL_EVENTS = [
    { name: "קורונה",           date: "2020-02-27",},
    { name: "שומר חומות",       date: "2021-05-10",},
    { name: "מלחמת חרבות ברזל",date: "2023-10-07",},
    { name: "עם כלביא",         date: "2025-06-13",},
    { name: "שאגת הארי",        date: "2026-02-28",},
];

const getProgressColor = (passingScore) => {
    if (!passingScore || passingScore <= 1) return '#cb5858ff'; // Red 
    const MAX_SCORE = 4; 
    // Normalize score to a 0 to 1 scale
    const normalized = Math.min(1, (passingScore - 1) / (MAX_SCORE - 1));
    // Scale to HSL Hue values: 0 (Red) to 125 (Green)
    const hue = normalized * 125; 
    return `hsl(${hue}, 85%, 40%)`;
};

// Return a custom dot to create a lollipop effect
const NeedleDot = (props) => {
    const { cx, cy, payload } = props;

    if (payload && payload.bills && payload.bills.length !== 0) {
        const n = payload.bill_count;
        const multipleBills = n > 1;
        const circleSize = 
        n === 1 ? 7 : 
        n <= 5  ? 8 + n :
        n <= 10 ? 12 : 
        n <= 20 ? 14 : 
        n <= 40 ? 16 :
        n <= 60 ? 18 :
        n <= 80 ? 20 : 22;

        const dotColor = payload.passingScore !== undefined 
            ? getProgressColor(payload.passingScore)
            : STATUS_COLORS_SHORT[getShortStatus(payload.bills[0].statusid, payload.bills[0].knessetnum)];
        // const dotColor = STATUS_COLORS_SHORT[getShortStatus(payload.bills[0].statusid, payload.bills[0].knessetnum)];
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
                    opacity={0.3}
                />
                <circle cx={cx} cy={cy} r={circleSize} fill={dotColor} stroke="#fff" strokeWidth={2} />
                {multipleBills && (
                    <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="12px" fontWeight="bold">
                        {n}
                    </text>
                )}
            </g>
        );
    }
};



const MergedTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    // Check if we have Bill data in the payload
    // We look for a payload item that has the 'name' property (unique to bills)
    
    const data = payload[0].payload;
    
    // --- IF HOVERING A BILL_GROUP ---
    if (data.bills) {
        const dotColor = data.bill_count > 1 ? '#4b5563' : STATUS_COLORS[data.bills[0].statusid];

        let passed = 0;
        let stopped = 0;
        let inprogress = 0;
        let hasPrevious = false;
        for (const bill of data.bills) {
            const status = getShortStatus(bill.statusid, bill.knessetnum);
            status === 'עברו' ? passed++ : status === 'נעצרו' ? stopped++ : inprogress++;
        }
        return (
            <div 
                style={{ 
                        backgroundColor: '#ffffff', 
                        padding: '3px', 
                        border: '0.8px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        direction: 'rtl',
                        textAlign: 'right'
                    }}>
                <p className="tooltip-click-prompt">
                    {new Date(data.publishdate).toLocaleDateString('he-IL', { month: 'long', year: '2-digit' })}
                </p>
                <div className="tooltip-breakdown-box">
                    {passed > 0 && (
                        hasPrevious = true,
                        <span className="breakdown-stat passed">{passed} {passed === 1 ? 'אושר' : 'אושרו'}</span>
                    )}
                    
                    {stopped > 0 && (
                        <>
                            {hasPrevious && <span className="breakdown-stat separator">|</span>}
                            {hasPrevious = true}
                            <span className="breakdown-stat stopped">{stopped} {stopped === 1 ? 'נעצר' : 'נעצרו'}</span>
                        </>
                    )}
                    
                    {inprogress > 0 && (
                        <>
                            {hasPrevious && <span className="breakdown-stat separator">|</span>}
                            <span className="breakdown-stat inprogress">{inprogress} בתהליך</span>
                        </>
                    )}
                </div>
                <p className="tooltip-click-prompt">לחץ לצפייה בפרטים מלאים</p>
            </div>
        );
    }

    // --- IF HOVERING THE LINE (SCORE) ---
    if (data.score !== undefined) {
        return (
            <div style={{
                backgroundColor: '#fff',
                padding: '10px',
                border: '1px solid #4273de',
                borderRadius: '8px',
                direction: 'rtl',
                textAlign: 'right',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                    {data.month}/{data.year}
                </p>
                <p style={{ color: '#4273de', margin: '3px 0' }}>
                    ציון: <strong>{data.score}</strong>
                </p>
                {data.breakdown && (
                <>
                    <hr style={{ border: '0.5px solid #e2e8f0', margin: '8px 0' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {Object.entries(data.breakdown).map(([key, value]) => (
                            <p key={key} style={{ fontSize: '0.85rem', margin: '2px 0', color: '#475569' }}>
                                🔹 {key}: <strong style={{ color: '#0f172a' }}>{value}</strong>
                            </p>
                        ))}
                    </div>
                </>
            )}

            </div>
        );
    }

    return null;
};

// get cleaner bill names
const refineName = (name) => {
    const newName = name.lastIndexOf(",") >= 0 ? name.slice(0, name.indexOf(",")) : name // delete the date at the end
    const close = newName.lastIndexOf(')')
    const open = newName.lastIndexOf('(', close);
    const len = close - open - 1
    return len > 15 ? newName.slice(open + 1, close) : newName
}

const MAIN_STATUS = ["עברו", "בתהליך", "נעצרו"];

export default function TimelineImpactChart({ billsData, scoreData, knessetNumber }) {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null); // 'all', 'passed', 'progress', 'stopped'

    // Tracks the ID of the expanded bill card
    const [expandedBillId, setExpandedBillId] = useState(null);

    // Clear circle group details whenever the preset knesset number parameter shifts
    useEffect(() => { 
        setSelectedGroup(null); 
    }, [knessetNumber, statusFilter]);

    // Reset the expanded bill if the month group or status filters change
    useEffect(() => {
        setExpandedBillId(null);
    }, [selectedGroup, statusFilter, knessetNumber]);

    const chartData = useMemo(() => {
        // 1. Process Scores
        const formattedScores = scoreData.map(s => ({
            ...s,
            timestamp: new Date(s.year, s.month - 1, 28).getTime(), // the 28's of the month to indicate the end of it
            type: 'score',
        }));

        const groups = {}; // group bills by same publication date month. (Set in 15 of the month)

        const filteredBillsInput = !statusFilter ? billsData :
                                billsData.filter(bill => statusFilter === getShortStatus(bill.statusid, bill.knessetnum));

        filteredBillsInput.forEach(bill => {
            const originalDate = new Date(bill.publishdate);
            const year = originalDate.getFullYear();
            const month = originalDate.getMonth(); // 0 = Jan, 11 = Dec
            
            // 1. Determine if the bill falls in the 1st half or 2nd half of the month
            let targetDay = 15;
            
            // 2. Create the normalized half-month date
            const halfMonthDate = new Date(year, month, targetDay);
            
            // 3. Format key as YYYY-MM-DD for the unique object dictionary
            const halfMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            const halfMonthTs = halfMonthDate.getTime();
            
            // 4. Group by this bi-weekly boundary
            if (!groups[halfMonthKey]) {
                groups[halfMonthKey] = {
                    publishdate: halfMonthTs,
                    knessetnum: bill.knessetnum,
                    timestamp: halfMonthTs, // Everyone in this half-month gets stacked together
                    bills: [],
                    type: 'bill_group'
                };
            }
            
            const newBill = {
                id: bill.id,
                name: refineName(bill.name),
                initiators_info: bill.initiators_info,
                statusid: bill.statusid,
                subtypeid: bill.subtypeid,
                knessetnum: bill.knessetnum,
                summarylaw: bill.summarylaw,
                failreasonid: bill.postponementreasonid,
                actualPublishDate: bill.publishdate // Keep original date for tooltip lists
            };
            
            groups[halfMonthKey].bills.push(newBill);
        });

        const formattedBills = Object.values(groups).map((group, index) => {            
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

            let yValue = (index % 5) * 7 + (group.bills[0]?.id % 3);
            if (Math.abs(yValue - interpolatedScore) < 50)
                yValue += 35;
            if (yValue < interpolatedScore)
                yValue = interpolatedScore + 1;
            let successScore = 0;
            for (const bill of group.bills) {
                const indexScore = getActiveStepIndex(bill.subtypeid, bill.statusid);
                if (bill.statusid === 118)
                    successScore += 30;
                else if (bill.knessetnum === 25 && !isRejectedStatus(bill.statusid))
                    successScore += 2.2;
                else
                    successScore += indexScore;
                if (indexScore > 1 && bill.subtypeid === 54)
                    successScore += 2;
            }
            return {
                ...group,
                bill_count: group.bills.length,
                targetScore: interpolatedScore,
                visualY: yValue,
                passingScore: successScore / group.bills.length
            };
        });

        const merged = [...formattedScores, ...formattedBills].sort((a, b) => a.timestamp - b.timestamp); // for better view

        // Return all three so we don't have to calculate them again
        return { merged, formattedBills, formattedScores };
    }, [billsData, scoreData, statusFilter]);

    // xAxis to show only months
    const scoreTicks = useMemo(() => {
        return chartData.formattedScores.length < 15 ? chartData.formattedScores.map(d => d.timestamp) :
                chartData.formattedScores.filter((d, i) => i % 6 === 0).map(d => d.timestamp);    
    }, [chartData.formattedScores]);

    // --- SIDEBAR DATA LOGIC ---
    // Extract individual bills depending on whether a node is actively clicked, or fallback to full timeline sets
    const billsForSidePanel = useMemo(() => {
        if (selectedGroup) {
            return selectedGroup.bills;
        }
        // If no circle clicked, show all bills that belong to this timeline's dataset
        return chartData.formattedBills.reduce((acc, currentGroup) => {
            return acc.concat(currentGroup.bills);
        }, []);
    }, [selectedGroup, chartData.formattedBills]);

    // Header localized text evaluation matching the side selection status
    const sidePanelHeader = useMemo(() => {
        if (selectedGroup) {
            const d = new Date(selectedGroup.timestamp);
            return `הצעות חוק: ${d.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}`;
        }
        return knessetNumber ? `הצעות חוק - כנסת ${knessetNumber}` : "כל הצעות החוק";
    }, [selectedGroup, knessetNumber]);


    return (
        <div className="split-view-container" style={{ direction: 'rtl' }}>
            
            {/* Left Box Frame: Takes up 80% of layout view space */}
            <div className="chart-main-frame">
                <div className="big-chart-container">
                    <div className='chart-top-row'>
                        <h2 className='title-content-side'>השפעת חקיקה על המדד הלאומי  
                            <InfoTooltip 
                                text={
                                    <div style={{ textAlign: 'right', direction: 'rtl' }}>
                                        <strong>כיצד לקרוא את הגרף?</strong><br/><br/>
                                        <strong>• מדד לאומי (הקו):</strong> ציון משוקלל המבוסס על נתונים אובייקטיביים. ציון גבוה = מצב טוב יותר.<br/>
                                        <strong>• הצעות חוק (הנקודות):</strong> מייצגות כמות הצעות בחודש. ככל שהנקודה ירוקה יותר, כך יותר הצעות מאותו חודש עברו בהצלחה. אדום/צהוב מעיד על עצירה או תהליך <br/>
                                        <strong>• ציר הזמן:</strong> הקווים האנכיים מחלקים את הנתונים לפי כנסות ואירועי מפתח.
                                    </div>
                                } 
                            />
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-start' }}>
                            <button
                                className={`selector-btn ${statusFilter === null ? 'active' : ''}`}
                                onClick={() => {setSelectedGroup(null); setStatusFilter(null)}}>
                            הכל
                            </button>
                            {MAIN_STATUS.map(s => (
                                <button
                                    key={s}
                                    className={`selector-btn ${statusFilter === s ? 'active' : ''}`}
                                    onClick={() => {setSelectedGroup(null); setStatusFilter(s)}}>
                                {s}
                                </button>))
                            }
                        </div>
                    </div>
                    

                    <div style={{ height: "500px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData.merged} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                                { !knessetNumber && (KNESSETS.map((event) => (
                                    <ReferenceLine
                                        key={event.name}
                                        x={new Date(event.date).getTime()}
                                        stroke="rgba(117, 103, 209, 0.5)"
                                        strokeDasharray="4 4"
                                        strokeWidth={1.5}
                                        label={{
                                            value: event.name,
                                            position: 'insideTopRight', // Positions it clearly near the top boundary
                                            fill: '#4c5869',            // Dark, high-contrast slate text color
                                            fontSize: 13,
                                            fontWeight: 700,
                                            offset: 8,
                                            // Soft text-shadow acts as an invisible protective mask over grid lines
                                            style: { 
                                                filter: 'drop-shadow(0px 1px 2px rgba(255,255,255,0.9))',
                                                backgroundColor: '#fff',
                                                writingMode: 'vertical-rl'
                                            } 
                                        }}
                                    />
                                )))}
                                {HISTORICAL_EVENTS.map((event) => (
                                    <ReferenceLine
                                        key={event.name}
                                        x={new Date(event.date).getTime()}
                                        stroke="rgba(117, 68, 208, 0.5)"
                                        strokeDasharray="4 4"
                                        strokeWidth={1.5}
                                        label={{
                                            value: event.name,
                                            position: 'insideBottomLeft', // Positions it clearly near the top boundary
                                            fill: '#4c5869',            // Dark, high-contrast slate text color
                                            fontSize: 14,
                                            fontWeight: 700,
                                            offset: 10,
                                            // Soft text-shadow acts as an invisible protective mask over grid lines
                                            style: { 
                                                filter: 'drop-shadow(0px 1px 2px rgba(255,255,255,0.9))',
                                                backgroundColor: '#fff',
                                                writingMode: 'vertical-rl'
                                            } 
                                        }}
                                    />
                                ))}
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
                                    label={{ value: 'מדד לאומי', angle: -90, position: 'insideLeft' }}
                                />

                                {/* The Safety Score Line */}
                                <Line
                                    name="score-line"
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#1a334cd4"
                                    strokeWidth={3.5}
                                    activeDot={{ r: 8, strokeWidth: 1 }} 
                                    dot={scoreTicks.length < 15}
                                    connectNulls 
                                />

                                {/* The Bills Scatter Nodes */}
                                <Scatter
                                    name="bill-dot"
                                    shape={<NeedleDot />}
                                    dataKey="visualY"
                                    onClick={(data) => setSelectedGroup(data.payload)} 
                                    cursor="pointer"
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
            </div>

            {/* Right Box Sidebar Registry: Takes up 20% of space */}
            <div className="bill-sidebar-panel">
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3>{sidePanelHeader}</h3>
                        <span className="sidebar-count-badge">{billsForSidePanel.length}</span>
                    </div>
                    {selectedGroup && (
                        <button className="clear-circle-btn" onClick={() => setSelectedGroup(null)}>
                            הצג הכל
                        </button>
                    )}
                </div>

                <div className="sidebar-scrollable-content">
                    {billsForSidePanel.length === 0 ? 
                        (<p className="empty-sidebar-text">אין הצעות חוק להצגה בטווח זה</p>) 
                        : 
                        billsForSidePanel.map((bill) => {
                            // Fallback gracefully if typeid is missing, or if it's 55 (which we ignore/handle as unknown for now)
                            const config = BILL_TYPE_CONFIG[bill.subtypeid];
                            
                            if (!config) { // skip 55 for now}
                                return null; 
                            }
                            
                            // Find the correct step index (0-based) using our new helper function
                            const activeStepIndex = getActiveStepIndex(bill.subtypeid, bill.statusid);
                            
                            // Fallback to 0 if the status isn't found anywhere in the tracking map arrays
                            const currentStep = activeStepIndex === -1 ? 0 : activeStepIndex;
                            const isRejected = isRejectedStatus(bill.statusid);
                            const isFullyCompleted = currentStep === config.totalSteps - 1 && !isRejected;
                            const isFromInactiveKnesset = Number(bill.knessetnum) < 25;

                            const isExpanded = expandedBillId === bill.id;

                            return (
                                <div 
                                    key={bill.id} 
                                    className={`sidebar-bill-card accordion-card ${isExpanded ? 'expanded' : ''}`}
                                    onClick={() => setExpandedBillId(isExpanded ? null : bill.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Top row: Bill Name and Type Label */}
                                    <div className="bill-card-top-row">
                                        <h4>{bill.name}</h4>
                                        <span className={`bill-type-badge ${config.className}`}>
                                            {config.name}
                                        </span>
                                    </div>
                                    
                                    {/* Bottom row: Meta Info (Right) & Progress Component (Left) */}
                                    <div className="bill-card-bottom-row">                                      
                                        {/* Progress Visualizer Container */}
                                        <div className="bill-progress-container">
                                            <span 
                                                className={`status-text-label 
                                                    ${isRejected ? 'rejected' : ''} 
                                                    ${isFullyCompleted ? 'success' : ''} 
                                                    ${isFromInactiveKnesset && !isFullyCompleted && !isRejected ? 'inactive-knesset' : ''}`
                                                }
                                            >
                                                {STATUS_DESC[bill.statusid] || (isRejected ? "נעצרה" : isFullyCompleted ? "אושרה" : "בתהליך")}
                                            </span>
                                            
                                            <div className="knesset-progress-bar">
                                                {Array.from({ length: config.totalSteps }).map((_, index) => {
                                                    let stepClass = "pending";
                                                    
                                                    let customStyle = {};
                                                    if (isRejected && index === currentStep) {
                                                        stepClass = "rejected-dot";
                                                    } else if (isFromInactiveKnesset && index === currentStep && !isFullyCompleted) {
                                                        // 1. If it's a frozen/stale active step from an old Knesset, color it dark orange
                                                        stepClass = "inactive-knesset-dot";
                                                    } else if (isFullyCompleted || index < currentStep) {
                                                        stepClass = "completed";
                                                        
                                                        // 2. Calculate dynamic green gradient step intensity 
                                                        // Starts light at index 0, grows progressively richer/darker toward completion
                                                        const progressionFactor = 0.35 + (index / config.totalSteps) * 0.65;
                                                        customStyle = {
                                                            backgroundColor: `rgba(90, 132, 110, ${progressionFactor})`
                                                        };
                                                    } else if (index === currentStep) {
                                                        stepClass = "active-dot";
                                                    }
                                                    
                                                    return (
                                                        <div 
                                                            key={index} 
                                                            className={`progress-block ${stepClass}`}
                                                            style={customStyle}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', gap: '0.5rem', alignItems:'center'}}>
                                            {bill.actualPublishDate && (
                                                <span className="bill-card-date">
                                                    {new Date(bill.actualPublishDate).toLocaleDateString('he-IL')}
                                                </span>
                                            )}
                                            <span className={`accordion-arrow ${isExpanded ? 'rotated' : ''}`}>
                                                ▼
                                            </span>
                                        </div>
                                    </div>
                                    {/* Expandable Drawer Content */}
                                    {isExpanded && (
                                        <div className="bill-card-drawer" onClick={(e) => e.stopPropagation()}>
                                            {/* Initiators Section */}
                                            {bill.initiators_info?.length > 0 && (
                                                <div className="drawer-section">
                                                    <h5>יוזמים:</h5>
                                                    <p className="initiators-text">{bill.initiators_info.map(p => p.name).join(', ')}</p>
                                                </div>
                                            )}
                                            {(isRejected || isFromInactiveKnesset) && bill.failreasonid && (
                                                <div className="drawer-section stopped-reason-section">
                                                    <h5>סיבת עצירה:</h5>
                                                    <p className="stopped-reason-text">{POSTPONEMENT_DESC[bill.failreasonid]}</p>
                                                </div>
                                            )}

                                            {/* Conditional Summary Law (Only available for passed bills) */}
                                            {isFullyCompleted && bill.summarylaw && (
                                                <div className="drawer-section summary-section">
                                                    <h5>תקציר החוק המאושר:</h5>
                                                    <p className="summary-text">{bill.summarylaw}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}