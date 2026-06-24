import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './Timeline.css'

import StatusPieChart       from '../components/PieChartBill'
import StatusBarChart       from '../components/BarChartBill'
import InitiatorCard        from '../components/InitiatorCard'
import TimelineImpactChart  from '../components/TimelineImpactChart'
import TrendsChart          from '../components/trendCharts'
import MKLeaderboards       from '../components/MKleaderboards'


import { POSTPONEMENT_DESC, POSTPONEMENT_COLORS, STATUS_COLORS, STATUS_COLORS_SHORT, STATUS_DESC, getShortStatus } from '../utils/billStatus'
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

const API_ADDR = "http://localhost:8000"

const KNESSET_OPTIONS = [20, 21, 22, 23, 24, 25];

const KNESSETS = {
    "20": {start: "2015-03-31", end: "2019-04-29"},
    "21": {start: "2019-04-30", end: "2019-10-03"},
    "22": {start: "2019-10-03", end: "2020-03-16"},
    "23": {start: "2020-03-16", end: "2021-01-06"},
    "24": {start: "2021-04-06", end: "2022-11-14"},
    "25": {start: "2022-11-15", end: "2026-10-27"}
};

export default function TimelinePage() {

    const { subject } = useParams();

    // hold the data from the server
    const [billsData, setBillData] = useState([]);
    const [scoreData, setScoreData] = useState([]);
    const [committeeData, setCommitteeData] = useState([]);
    const [plenumData, setPlenumData] = useState([]);

    const [topMksCommittee, setTopMksCommittee] = useState([]);
    const [selectedMk, setSelectedMk] = useState(null);

    const [topMksPlenum, setTopMksPlenum] = useState([]);

    const [selectedKnesset, setSelectedKnesset] = useState(null);


    const currentSubject = subject || 'road-safety';
    const config = SUBJECTS_DICT[currentSubject];
    const subjectImage = imageMap[currentSubject];

    // fetch the data from FastAPI when the page loads
    useEffect(() => {
        fetch(`${API_ADDR}/api/timeline/${currentSubject}`)
            .then(response => response.json())      // convert the server response to JSON
            .then(data => setBillData(data))        // save to your react state
            .catch(error => console.error("Error fetching data:", error));
    },  [currentSubject]);


    // TODO: get all scores for all subjects and make an api/scores/{subject} route
    useEffect(() => {
        fetch(`${API_ADDR}/api/scores/road_safety`)
            .then(response => response.json())      // convert the server response to JSON
            .then(data => setScoreData(data))        // save to your react state
            .catch(error => console.error("Error fetching data:", error));
    },  []); // [] - only run this once when the page loads


    useEffect(() => {
        fetch(`${API_ADDR}/api/trends/committee/road_safety`)
        .then(response => response.json())
        .then(data => setCommitteeData(data))
        .catch(error => console.error("Error fetching data:", error));
  }, []);


    useEffect(() => {
            fetch(`${API_ADDR}/api/trends/plenum/road_safety`)
            .then(response => response.json())
            .then(data => setPlenumData(data))
            .catch(error => console.error("Error fetching data:", error));
    }, []);


    // useEffect(() => {
    //     // Fetching top 10 speakers for subject in committees
    //     fetch(`${API_ADDR}/api/trends/committee/road_safety/top_mks`)
    //         .then(res => res.json())
    //         .then(data => setTopMksCommittee(data))
    //         .catch(error => console.error("Error fetching data:", error));
    // }, []);

    // useEffect(() => {
    //     // Fetching top 10 speakers for subject in plenums
    //     fetch(`${API_ADDR}/api/trends/plenum/road_safety/top_mks`)
    //         .then(res => res.json())
    //         .then(data => setTopMksPlenum(data))
    //         .catch(error => console.error("Error fetching data:", error));
    // }, []);


    useEffect(() => {
        let url = `${API_ADDR}/api/trends/committee/road_safety/top_mks?limit=15`;
        if (selectedKnesset) {
            url += `&knesset=${selectedKnesset}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => setTopMksCommittee(data))
            .catch(error => console.error("Error fetching committee speaker leaderboards:", error));
    }, [selectedKnesset]); 

    useEffect(() => {
        let url = `${API_ADDR}/api/trends/plenum/road_safety/top_mks?limit=15`;
        if (selectedKnesset) {
            url += `&knesset=${selectedKnesset}`;
        }
        fetch(url)
            .then(res => res.json())
            .then(data => setTopMksPlenum(data))
            .catch(error => console.error("Error fetching plenum speaker leaderboards:", error));
    }, [selectedKnesset]); 

    const totalBills = billsData.length;

    const { statusPieData, stoppedPieData, barData } = useMemo(() => {
        if (!billsData || billsData.length === 0) 
            return { statusPieData: [], stoppedPieData: [], barData: [] };

        const pie_accumulator = Object.keys(STATUS_COLORS_SHORT).reduce((acc, key) => {
            acc[key] = { name: key, value: 0, statusId: key, fill: STATUS_COLORS_SHORT[key] };
            return acc;
        }, {});

        const barMap = {};
        const stoppedMap = {};
        
        for (const bill of billsData) {
            const sId = bill.statusid;
            const kNum = bill.knessetnum;

            if (!barMap[kNum]) {
                barMap[kNum] = { knessetnum: kNum };
            }

            if (bill.postponementreasonid) {
                if (!stoppedMap[bill.postponementreasonid]) {
                    stoppedMap[bill.postponementreasonid] = {   name: POSTPONEMENT_DESC[bill.postponementreasonid],
                                                                value: 0, 
                                                                statusId: bill.postponementreasondesc,
                                                                fill: POSTPONEMENT_COLORS[bill.postponementreasonid]};
                }
                stoppedMap[bill.postponementreasonid].value += 1; // update the pie chart data - count by postponement status of bill
            }
                
            const status_name = getShortStatus(sId, kNum);
            pie_accumulator[status_name].value += 1; // update the pie chart data - count by status of bill
            barMap[kNum][status_name] = (barMap[kNum][status_name] || 0) + 1;
        }
        return {
            statusPieData: Object.values(pie_accumulator).filter(item => item.value > 0),
            stoppedPieData: Object.values(stoppedMap),
            barData: Object.values(barMap)
        };
    }, [billsData]); 


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



    const topInitiators = useMemo(() => {
        if (!billsData || billsData.length === 0) return [];

        // Filter down to the targeted Knesset
        const targetBills = selectedKnesset 
            ? billsData.filter(b => b.knessetnum === selectedKnesset)
            : billsData;

        const initiator_counts = {};
        
        // Count frequencies
        for (const bill of targetBills) {
            bill.initiators_info.forEach(person => {
                if (!initiator_counts[person.id]) {
                    initiator_counts[person.id] = { ...person, count: 0 };
                }
                initiator_counts[person.id].count += 1;
            });
        }

        // Sort and yield the top 10 matches
        return Object.values(initiator_counts).sort((a, b) => b.count - a.count).slice(0, 15);
    }, [billsData, selectedKnesset]);



    const filteredBillsData = selectedKnesset ?
        billsData.filter(b => b.knessetnum === selectedKnesset) : billsData;

    const filteredScores = selectedKnesset 
    ? scoreData.filter(s => {
        const startDate = new Date(KNESSETS[selectedKnesset].start);
        const endDate = new Date(KNESSETS[selectedKnesset].end);
        startDate.setMonth(startDate.getMonth() - 2);
        endDate.setMonth(endDate.getMonth() + 1);
        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();
        const scoreTime = new Date(s.year, s.month - 1, 28).getTime();
        return scoreTime >= startTimestamp && scoreTime <= endTimestamp;
      })
    : scoreData;

    const filteredCommitteeData = selectedKnesset 
    ? committeeData.filter(s => {
        const startDate = new Date(KNESSETS[selectedKnesset].start);
        const endDate = new Date(KNESSETS[selectedKnesset].end);
        startDate.setMonth(startDate.getMonth() - 2);
        endDate.setMonth(endDate.getMonth() + 1);
        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();
        const [month, year] = s.name.split('/').map(Number);
        const scoreTime = new Date(2000 + year, month - 1, 1);
        return scoreTime >= startTimestamp && scoreTime <= endTimestamp;
      })
    : committeeData;


    const filteredPlenumData = selectedKnesset 
    ? plenumData.filter(s => {
        const startDate = new Date(KNESSETS[selectedKnesset].start);
        const endDate = new Date(KNESSETS[selectedKnesset].end);
        startDate.setMonth(startDate.getMonth() - 2);
        endDate.setMonth(endDate.getMonth() + 1);
        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();
        const [month, year] = s.name.split('/').map(Number);
        const scoreTime = new Date(2000 + year, month - 1, 1);
        return scoreTime >= startTimestamp && scoreTime <= endTimestamp;
      })
    : plenumData;

    const [selectedInitiatorId, setSelectedInitiatorId] = useState(null);
    // Filter bills for selected top initiator
    const billsForTableByInitiatorId = useMemo(() => {
        if (!selectedInitiatorId) return [];
            return filteredBillsData.filter(b => 
                    b.initiators_info.some(p => p.id === selectedInitiatorId)
                );
    }, [selectedInitiatorId, filteredBillsData]);

    return (
        <div style={{ width: '100vw', margin: '0 auto'}} >
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
                <div className="filter-section-wrapper">
                    <p className="bar-label">מספר כנסת</p>
                    <div className="selector-bar">
                        <button
                            className={`selector-btn ${selectedKnesset === null ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedKnesset(null);
                                setSelectedInitiatorId(null);
                            }}>
                        הכל
                        </button>
                        {KNESSET_OPTIONS.map(k => (
                            <button
                                key={k}
                                className={`selector-btn ${selectedKnesset === k ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedKnesset(k);
                                    setSelectedInitiatorId(null);
                                }}>
                            {k}
                            </button>))
                        }
                    </div>
                </div>

                <TimelineImpactChart billsData={filteredBillsData} scoreData={filteredScores} knessetNumber={selectedKnesset}/>
                
                <div className="box-chart-container">
                    <StatusPieChart 
                        pieData={statusPieData}
                        total={totalBills}
                        title="התפלגות סטטוס הצעות חוק"
                    />
                    <StatusBarChart 
                        barData={barData}
                        title="התפלגות הצעות חוק על פי כנסות"
                    />
                    <StatusPieChart 
                        pieData={stoppedPieData}
                        total={stoppedPieData.reduce((acc, curr) => acc + curr.value, 0)}
                        title="התפלגות סיבות הצעות חוק שנעצרו"
                    />
                </div>
                
                
                <div className="box-chart-container">
                    <TrendsChart quotesData={filteredCommitteeData} title={"מדד עיסוק בטיחות בדרכים בוועדות"}/>
                    <TrendsChart quotesData={filteredPlenumData} title={"מדד עיסוק בטיחות בדרכים במליאות"}/>
                </div>

                {/* <div className="initiator-section">
                    <h2 className="title-content">עשרת חברי הכנסת היוזמים המובילים בהצעות חוקים</h2>
                    
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

                </div> */}

                <div className="box-chart-container">
                    <div style={{ padding: '20px', maxWidth: '400px' }}>
                        <MKLeaderboards 
                            mks={topInitiators} 
                            // selectedMkId={selectedInitiatorId} 
                            // onMkSelect={(id) => setSelectedInitiatorId(id)} 
                            title="חברי הכנסת המובילים לפי מספר הצעות חוק" 
                            countText="הצעות חוק"
                        />
                    </div>

                    <div style={{ padding: '20px', maxWidth: '400px' }}>
                        <MKLeaderboards 
                            mks={topMksCommittee} 
                            // selectedMkId={selectedMk} 
                            // onMkSelect={(id) => setSelectedMk(id)}                 
                            title="חברי הכנסת המובילים באזכורים בוועדות"
                            countText="אזכורים"
                        />
                    </div>
                    <div style={{ padding: '20px', maxWidth: '400px' }}>
                        <MKLeaderboards 
                            mks={topMksPlenum} 
                            // selectedMkId={selectedMk} 
                            // onMkSelect={(id) => setSelectedMk(id)}                 
                            title="חברי הכנסת המובילים באזכורים במליאות"
                            countText="אזכורים"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}