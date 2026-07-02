import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import './ChartUI.css'


export default function trendCharts ({ quotesData, title }) {
    return (
        <div className="chart-container">
            <h2>{title}</h2>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={quotesData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#666" />
                <YAxis tick={false} label={{ value: 'מדד העיסוק', angle: -90}}/>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="mentions" stroke="#4453a5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};