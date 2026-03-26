import { useState, useEffect, useMemo } from 'react';

import ScatterChartBills from '../components/ScatterChartBill'
import StatusPieChart from '../components/PieChartBill'
import StatusBarChart from '../components/BarChartBill'

import './Timeline.css'

import { STATUS_COLORS, STATUS_DESC } from '../utils/billStatus'


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

            <ScatterChartBills billsData={billsData} />

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
                            {billsForTable.map(bill => (
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
        </div>
    );
}