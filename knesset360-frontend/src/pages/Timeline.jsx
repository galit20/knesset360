import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './Timeline.css'

import ScatterChartBills    from '../components/ScatterChartBill'
import StatusPieChart       from '../components/PieChartBill'
import StatusBarChart       from '../components/BarChartBill'
import InitiatorCard        from '../components/InitiatorCard'
import ScoreChart           from '../components/ScoreChart'
import TimelineImpactChart  from '../components/TimelineImpactChart'

import { STATUS_COLORS, STATUS_DESC } from '../utils/billStatus'
import { SUBJECTS_DICT } from '../utils/subjects'

import roadSafetyImg    from '../assets/categories/road-safety.svg';
import educationImg     from '../assets/categories/education.svg';
import healthImg        from '../assets/categories/health.svg';
import crimeImg         from '../assets/categories/crime.svg';
import migrationImg     from '../assets/categories/migration.svg';
import environmentImg   from '../assets/categories/environment.svg';

const imageMap = {
    'road-safety':  roadSafetyImg,
    'education':    educationImg,
    'health':       healthImg,
    'crime':        crimeImg,
    'migration':    migrationImg,
    'environment':  environmentImg,
};


export default function TimelinePage() {

    const { subject } = useParams();

    // hold the data from the server
    const [billsData, setBillData] = useState([]);
    const [scoreData, setScoreData] = useState([]);

    const currentSubject = subject || 'road-safety';
    const config = SUBJECTS_DICT[currentSubject];
    const subjectImage = imageMap[currentSubject];

    // fetch the data from FastAPI when the page loads
    useEffect(() => {
        fetch(`http://localhost:8000/api/timeline/${currentSubject}`)
            .then(response => response.json())      // convert the server response to JSON
            .then(data => setBillData(data))        // save to your react state
            .catch(error => console.error("Error fetching data:", error));
    },  [currentSubject]);


    // TODO: get all scores for all subjects and make an api/scores/{subject} route
    // fetch the data from FastAPI when the page loads
    useEffect(() => {
        fetch('http://localhost:8000/api/traffic_score')
            .then(response => response.json())      // convert the server response to JSON
            .then(data => setScoreData(data))        // save to your react state
            .catch(error => console.error("Error fetching data:", error));
    },  []); // [] - only run this once when the page loads

    const totalBills = billsData.length;

    const { pieData, barData, topInitiators } = useMemo(() => {
        if (!billsData || billsData.length === 0) 
            return { pieData: [], barData: [] , topInitiators: []};

        const pie_accumulator = Object.keys(STATUS_DESC).reduce((acc, key) => {
            acc[key] = { name: STATUS_DESC[key], value: 0, statusId: key, fill: STATUS_COLORS[key] };
            return acc;
        }, {});

        const barMap = {};
        const initiator_counts = {};
        
        for (const bill of billsData) {
            const sId = bill.statusid;
            const kNum = bill.knessetnum;

            pie_accumulator[sId].value += 1; // update the pie chart data - count by status of bill

            if (!barMap[kNum]) {
                barMap[kNum] = { knessetnum: kNum };
            }
            barMap[kNum][sId] = (barMap[kNum][sId] || 0) + 1;

            bill.initiators_info.forEach(person => {
                if (!initiator_counts[person.id]) {
                    initiator_counts[person.id] = { ...person, count: 0 };
                }
                initiator_counts[person.id].count += 1;
            });
        }
        const pie_accumulator_values =  Object.values(pie_accumulator).filter(item => item.value > 0);
        return {
            pieData: pie_accumulator_values,
            barData: Object.values(barMap),
            topInitiators: Object.values(initiator_counts).sort((a, b) => b.count - a.count).slice(0, 10)
        };
    }, [billsData]); 


    const [selectedKnesset, setSelectedKnesset] = useState(null);
    // Filter bills for the table based on bar selection
    const billsForTableByKnesset = useMemo(() => {
    if (!selectedKnesset) return [];
        return billsData.filter(b => b.knessetnum === selectedKnesset);
    }, [selectedKnesset, billsData]);

    const [selectedStatus, setSelectedStatus] = useState(null);
    // Filter bills for the table based on pie selection
    const billsForTableByStatus = useMemo(() => {
    if (!selectedStatus) return [];
        return billsData.filter(b => b.statusid === selectedStatus);
    }, [selectedStatus, billsData]);

    const [selectedInitiatorId, setSelectedInitiatorId] = useState(null);
    // Filter bills for selected top initiator
    const billsForTableByInitiatorId = useMemo(() => {
        if (!selectedInitiatorId) return [];
            return billsData.filter(b => 
                    b.initiators_info.some(p => p.id === selectedInitiatorId)
                );
    }, [selectedInitiatorId, billsData]);

    const bills2015 = billsData.filter(b => new Date(b.publishdate).getFullYear() === 2015);
    const bills2025newdate = bills2015.map(b => ({...b, publishdate: new Date(b.publishdate).getTime()}));
    const scores2015 = scoreData.filter(s => s.year === 2015);

    return (
        <div style={{ width: '100vw', margin: '0 auto'}}>
        <div className="subject-banner">
            <div className="subject-banner-content">
                <h1 className="subject-title">{config.label}</h1>
                <p className="subject-description">{config.description}</p>
            </div>
            <div className="subject-banner-visual">
                <img src={subjectImage} alt={config.label} className="subject-illustration" />
            </div>
        </div>
        <div style={{ width: '95vw', margin: '0 auto'}}>

            <TimelineImpactChart billsData={billsData} scoreData={scoreData} />
            
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
                <StatusBarChart 
                    barData={barData}
                    title="התפלגות הצעות חוק על פי כנסות"
                    onSliceClick={(data) => {
                        if (data) {
                            setSelectedKnesset(data.payload.knessetnum);
                            setSelectedStatus(null);
                        }
                    }} 
                />
            </div>

            {selectedKnesset && (
            <div className="table-container">
                <div className="table-top-container">
                    <h3 style={{ margin: 0, color: '#1f2937' }}>הצעות חוק בכנסת ה-{selectedKnesset}</h3>
                    <button
                        className="close-button-style"
                        onClick={() => setSelectedKnesset(null)} >
                        <span style={{ fontSize: '16px' }}>✕</span>
                        <span>סגור</span>
                    </button>
                </div>
                <div className="table-div-scroll">
                    <table className="table-content">
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th>מספר הצעה</th>
                            <th>שם הצעה</th>
                            <th>סטטוס</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billsForTableByKnesset.map(bill => (
                            <tr key={bill.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px' }}>{bill.id}</td>
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
            <div className="table-container">
                <div className="table-top-container">
                    <h3 style={{ margin: 0, color: '#1f2937' }}>הצעות חוק בסטטוס - {STATUS_DESC[selectedStatus]}</h3>
                    <button 
                        className="close-button-style"
                        onClick={() => setSelectedStatus(null)} >
                        <span style={{ fontSize: '16px' }}>✕</span>
                        <span>סגור</span>
                    </button>
                </div>
                <div className="table-div-scroll">
                    <table className="table-content">
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
                                <td style={{ padding: '15px' }}>{bill.id}</td>
                                <td>{bill.name}</td>
                                <td></td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            <div className="initiator-section">
                <h2 className="title-content">עשרת חברי הכנסת היוזמים המובילים</h2>
                
                <div className="initiator-grid">
                    {topInitiators.map((initiator) => (
                        <InitiatorCard 
                            key={initiator.id} // Essential for React to track items
                            initiator={initiator}
                            isSelected={selectedInitiatorId === initiator.id}
                            onClick={(id) => {
                                // Toggle selection: if already selected, clear it; otherwise, set it.
                                setSelectedInitiatorId(prevId => prevId === id ? null : id);
                                
                                // Clear other filters to focus only on this person
                                setSelectedStatus(null);
                                setSelectedKnesset(null);
                            }}
                        />
                    ))}
                </div>

                {selectedInitiatorId && (
                <div className="table-container">
                    <div className="table-top-container">
                        <h3 style={{ margin: 0, color: '#1f2937' }}>הצעות החוק של {topInitiators.find(i => i.id === selectedInitiatorId).name}</h3>
                        <button 
                            className="close-button-style"
                            onClick={() => setSelectedInitiatorId(null)} >
                            <span style={{ fontSize: '16px' }}>✕</span>
                            <span>סגור</span>
                        </button>
                    </div>
                    <div className="table-div-scroll">
                        <table className="table-content">
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 9 }}>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th>מספר הצעה</th>
                                    <th>שם הצעה</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billsForTableByInitiatorId.map(bill => (
                                <tr key={bill.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}>{bill.id}</td>
                                    <td>{bill.name}</td>
                                    <td></td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

            </div>
        </div>
        </div>
    );
}