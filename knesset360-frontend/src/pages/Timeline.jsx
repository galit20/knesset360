import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './Timeline.css'

import StatusPieChart       from '../components/PieChartBill'
import StatusBarChart       from '../components/BarChartBill'
import TimelineImpactChart  from '../components/TimelineImpactChart'
import TrendsChart          from '../components/trendCharts'
import MKLeaderboards       from '../components/MKleaderboards'
import LoadingSpinner       from '../components/LoadingSpinner'

import { POSTPONEMENT_DESC, POSTPONEMENT_COLORS, STATUS_COLORS_SHORT, getShortStatus } from '../utils/billStatus'
import { SUBJECTS_DICT } from '../utils/subjects'

import roadSafetyImg    from '../assets/categories/road-safety.svg';
import educationImg     from '../assets/categories/education.svg';
import healthImg        from '../assets/categories/health.svg';
import crimeImg         from '../assets/categories/crime.svg';
import migrationImg     from '../assets/categories/migration.svg';
import environmentImg   from '../assets/categories/environment.svg';

const imageMap = {
    'road_safety':  roadSafetyImg,
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


const EmptyState = ({ icon, title, subtitle }) => (
    <div className="empty-state-container">
        <div className="empty-state-icon">{icon}</div>
        <h3 className="empty-state-text">{title}</h3>
        <p className="empty-state-subtext">{subtitle}</p>
    </div>
);

export default function TimelinePage() {
    const { subject } = useParams();
    const currentSubject = subject || 'road_safety';
    const config = SUBJECTS_DICT[currentSubject];
    const subjectImage = imageMap[currentSubject];

    // Data States
    const [billsData, setBillData] = useState([]);
    const [scoreData, setScoreData] = useState([]);
    const [committeeData, setCommitteeData] = useState([]);
    const [plenumData, setPlenumData] = useState([]);
    const [topMksCommittee, setTopMksCommittee] = useState([]);
    const [topMksPlenum, setTopMksPlenum] = useState([]);

    // UI Interaction States
    const [selectedKnesset, setSelectedKnesset] = useState(null);
    const [selectedInitiatorId, setSelectedInitiatorId] = useState(null);
    
    // ⏳ INDEPENDENT LOADING STATES
    const [billsLoading, setBillsLoading] = useState(true);
    const [trendsLoading, setTrendsLoading] = useState(true);
    const [mksLoading, setMksLoading] = useState(true);

    const [mainError, setMainError] = useState(false);
    const [trendsError, setTrendsError] = useState(false);
    const [mksError, setMksError] = useState(false);

    // 🚀 1. Fetch Core Bills Data (Independent)
    useEffect(() => {
        setBillsLoading(true);
        setMainError(false);

        fetch(`${API_ADDR}/api/timeline/${currentSubject}`)
            .then(r => {
                if (!r.ok) throw new Error("Server error");
                return r.json();
            })
            .then(data => setBillData(data))
            .catch(err => {
                console.error("Error fetching bills:", err);
                setMainError(true);
            })
            .finally(() => setBillsLoading(false));
    }, [currentSubject]);

    // 🚀 2. Fetch Impact Scores (Loads silently in the background)
    useEffect(() => {
        fetch(`${API_ADDR}/api/scores/${currentSubject}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setScoreData(data))
            .catch(err => console.error("Error fetching scores:", err));
    }, [currentSubject]);

    // 🚀 3. Fetch Trends Charts with Promise.allSettled
    useEffect(() => {
        setTrendsLoading(true);
        setTrendsError(false);

        // allSettled ensures that if one fails, the other still renders!
        Promise.allSettled([
            fetch(`${API_ADDR}/api/trends/committee/${currentSubject}`).then(r => r.ok ? r.json() : Promise.reject()),
            fetch(`${API_ADDR}/api/trends/plenum/${currentSubject}`).then(r => r.ok ? r.json() : Promise.reject())
        ])
        .then(([commResult, plenResult]) => {
            if (commResult.status === 'fulfilled') setCommitteeData(commResult.value);
            else setTrendsError(true);

            if (plenResult.status === 'fulfilled') setPlenumData(plenResult.value);
            else setTrendsError(true);
        })
        .finally(() => setTrendsLoading(false));
    }, [currentSubject]);

    // 🚀 4. Fetch MK Leaderboards (Updates every time Knesset filter changes)
    useEffect(() => {
        setMksLoading(true);
        setMksError(false);
        let urlComm = `${API_ADDR}/api/trends/committee/${currentSubject}/top_mks?limit=15`;
        let urlPlen = `${API_ADDR}/api/trends/plenum/${currentSubject}/top_mks?limit=15`;
        
        if (selectedKnesset) {
            urlComm += `&knesset=${selectedKnesset}`;
            urlPlen += `&knesset=${selectedKnesset}`;
        }

        Promise.allSettled([
            fetch(urlComm).then(r => r.ok ? r.json() : Promise.reject()),
            fetch(urlPlen).then(r => r.ok ? r.json() : Promise.reject())
        ])
        .then(([commMks, plenMks]) => {
            if (commMks.status === 'fulfilled') setTopMksCommittee(commMks.value);
            else setMksError(true);

            if (plenMks.status === 'fulfilled') setTopMksPlenum(plenMks.value);
            else setMksError(true);
        })
        .finally(() => setMksLoading(false));
    }, [currentSubject, selectedKnesset]);


    // --- Memoized Calculations ---
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

            if (!barMap[kNum]) { barMap[kNum] = { knessetnum: kNum }; }

            if (bill.postponementreasonid) {
                if (!stoppedMap[bill.postponementreasonid]) {
                    stoppedMap[bill.postponementreasonid] = {   
                        name: POSTPONEMENT_DESC[bill.postponementreasonid],
                        value: 0, 
                        statusId: bill.postponementreasondesc,
                        fill: POSTPONEMENT_COLORS[bill.postponementreasonid]
                    };
                }
                stoppedMap[bill.postponementreasonid].value += 1; 
            }
                
            const status_name = getShortStatus(sId, kNum);
            pie_accumulator[status_name].value += 1;
            barMap[kNum][status_name] = (barMap[kNum][status_name] || 0) + 1;
        }
        return {
            statusPieData: Object.values(pie_accumulator).filter(item => item.value > 0),
            stoppedPieData: Object.values(stoppedMap),
            barData: Object.values(barMap)
        };
    }, [billsData]); 

    const topInitiators = useMemo(() => {
        if (!billsData || billsData.length === 0) return [];
        const targetBills = selectedKnesset ? billsData.filter(b => b.knessetnum === selectedKnesset) : billsData;
        const initiator_counts = {};
        
        for (const bill of targetBills) {
            bill.initiators_info.forEach(person => {
                if (!initiator_counts[person.id]) {
                    initiator_counts[person.id] = { ...person, count: 0 };
                }
                initiator_counts[person.id].count += 1;
            });
        }
        return Object.values(initiator_counts).sort((a, b) => b.count - a.count).slice(0, 15);
    }, [billsData, selectedKnesset]);

    const filteredBillsData = selectedKnesset ? billsData.filter(b => b.knessetnum === selectedKnesset) : billsData;
    
    const filteredScores = selectedKnesset ? scoreData.filter(s => {
        const startDate = new Date(KNESSETS[selectedKnesset].start);
        const endDate = new Date(KNESSETS[selectedKnesset].end);
        startDate.setMonth(startDate.getMonth() - 2);
        endDate.setMonth(endDate.getMonth() + 1);
        const scoreTime = new Date(s.year, s.month - 1, 28).getTime();
        return scoreTime >= startDate.getTime() && scoreTime <= endDate.getTime();
    }) : scoreData;

    const filteredCommitteeData = selectedKnesset ? committeeData.filter(s => {
        const startDate = new Date(KNESSETS[selectedKnesset].start);
        const endDate = new Date(KNESSETS[selectedKnesset].end);
        startDate.setMonth(startDate.getMonth() - 2);
        endDate.setMonth(endDate.getMonth() + 1);
        const [month, year] = s.name.split('/').map(Number);
        const scoreTime = new Date(2000 + year, month - 1, 1).getTime();
        return scoreTime >= startDate.getTime() && scoreTime <= endDate.getTime();
    }) : committeeData;

    const filteredPlenumData = selectedKnesset ? plenumData.filter(s => {
        const startDate = new Date(KNESSETS[selectedKnesset].start);
        const endDate = new Date(KNESSETS[selectedKnesset].end);
        startDate.setMonth(startDate.getMonth() - 2);
        endDate.setMonth(endDate.getMonth() + 1);
        const [month, year] = s.name.split('/').map(Number);
        const scoreTime = new Date(2000 + year, month - 1, 1).getTime();
        return scoreTime >= startDate.getTime() && scoreTime <= endDate.getTime();
    }) : plenumData;


    return (
        <div style={{ width: '100vw', margin: '0 auto'}} >
            {/* Banner Section */}
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
                
                {/* Global Filter Bar */}
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

                {/* 🎯 ZONE 1: BILLS & IMPACT */}
                {billsLoading ? (
                    <LoadingSpinner text="טוען נתוני הצעות חוק..." />
                ) : mainError ? (
                    <EmptyState 
                        icon="🔌" 
                        title="שגיאת תקשורת" 
                        subtitle=".לא ניתן להתחבר לשרת הנתונים" 
                    />
                ) : filteredBillsData.length === 0 ? (
                    <EmptyState 
                        icon="📭" 
                        title="אין נתונים להצגה" 
                        subtitle="לא נמצאו הצעות חוק מתאימות בחתך הנבחר." 
                    />
                ) : (
                    <>
                        <TimelineImpactChart billsData={filteredBillsData} scoreData={filteredScores} knessetNumber={selectedKnesset}/>
                        
                        <div className="box-chart-container">
                            <StatusPieChart pieData={statusPieData} total={totalBills} title="התפלגות סטטוס הצעות חוק" />
                            <StatusBarChart barData={barData} title="התפלגות הצעות חוק על פי כנסות" />
                            <StatusPieChart pieData={stoppedPieData} total={stoppedPieData.reduce((acc, curr) => acc + curr.value, 0)} title="התפלגות סיבות הצעות חוק שנעצרו" />
                        </div>
                    </>
                )}

                {/* 🎯 ZONE 2: TRENDS */}
                {trendsLoading ? (
                    <LoadingSpinner text="מנתח מגמות ופרוטוקולים..." />
                ) : trendsError || (filteredCommitteeData.length === 0 && filteredPlenumData.length === 0) ? (
                    <EmptyState 
                        icon="📉" 
                        title="מדדי עיסוק אינם זמינים" 
                        subtitle={trendsError ? ".שגיאה בטעינת הנתונים משרת החיפוש" : "לא נמצאו דיונים רלוונטיים בתאריכים אלו."} 
                    />
                ) : (
                    <div className="box-chart-container">
                        <TrendsChart quotesData={filteredCommitteeData} title={"מדד עיסוק מרכזי בוועדות"}/>
                        <TrendsChart quotesData={filteredPlenumData} title={"מדד עיסוק מרכזי במליאות"}/>
                    </div>
                )}

                {/* 🎯 ZONE 3: LEADERBOARDS */}
                <div className="box-chart-container" style={{ minHeight: '400px' }}>
                    {mksLoading ? (
                        <LoadingSpinner text="שולף נתוני חברי כנסת..." />
                    ) : mksError || (topInitiators.length === 0 && topMksCommittee.length === 0 && topMksPlenum.length === 0) ? (
                        <EmptyState 
                            icon="👥" 
                            title="נתוני פעילות חברי כנסת חסרים" 
                            subtitle={mksError ? "שגיאה בחיבור למסד הנתונים." : "אין נתונים על פעילות חברי כנסת בנושא זה."} 
                        />
                    ) : (
                        <>
                            <div style={{ flex: 1, minWidth: '320px' }}>
                                <MKLeaderboards mks={topInitiators} title="חברי הכנסת המובילים לפי הצעות חוק" countText="הצעות חוק" />
                            </div>
                            <div style={{ flex: 1, minWidth: '320px' }}>
                                <MKLeaderboards mks={topMksCommittee} title="חברי הכנסת המובילים באזכורים בוועדות" countText="אזכורים" />
                            </div>
                            <div style={{ flex: 1, minWidth: '320px' }}>
                                <MKLeaderboards mks={topMksPlenum} title="חברי הכנסת המובילים באזכורים במליאות" countText="אזכורים" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}