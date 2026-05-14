import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

import './ChartUI.css'

import { STATUS_COLORS, STATUS_DESC } from '../utils/billStatus'


export default function StatusBarChart ({ barData, title, onSliceClick }) {
    return (
        <div className="chart-container">
            <h2 className="title-content"> {title} </h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="knessetnum" label={{ value: 'מספר כנסת', position: 'insideBottom', offset: -2 }} />
                <YAxis
                    tick={{ textAnchor: 'start' }} 
                    label={{ value: 'כמות הצעות', angle: -90, position: 'insideLeft', offset: 10 }} />
                <Tooltip/>
                {Object.keys(STATUS_DESC).map((statusId) => (
                    <Bar 
                        maxBarSize = {70}
                        key={statusId}
                        dataKey={statusId} 
                        name={STATUS_DESC[statusId]} 
                        stackId="a" 
                        fill={STATUS_COLORS[statusId]} 
                        cursor="pointer"
                        onClick={onSliceClick}>
                    </Bar>
                ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};