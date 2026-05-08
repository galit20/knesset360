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

const ScoreChart = ({ data }) => {
  // for date format consistency
  const reformatDate = (year, month) => {
    const date = new Date(year, month-1);
    return date.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
  };

  const formattedData = data.map(item => ({
    ...item,
    dateDisplay: reformatDate(item.year, item.month) 
  }));

  // custom tooltip to show data
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const monthly_data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          direction: 'rtl',
          textAlign: 'right',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{reformatDate(monthly_data.year, monthly_data.month)}</p>
          <p style={{ color: '#8884d8', margin: '3px 0' }}>ציון בטיחות: <strong>{monthly_data.score}</strong></p>
          <hr style={{ border: '0.5px solid #eee' }} />
          <p style={{ fontSize: '0.9rem', margin: '3px 0' }}>💀 קטלניות: {monthly_data.fatal}</p>
          <p style={{ fontSize: '0.9rem', margin: '3px 0' }}>🚑 קשות: {monthly_data.severe}</p>
          <p style={{ fontSize: '0.9rem', margin: '3px 0' }}>🤕 קלות: {monthly_data.light}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
      <h2 style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>מדד בטיחות בדרכים</h2>
      <ResponsiveContainer>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
          <XAxis 
            dataKey="dateDisplay" 
          />
          
          <YAxis 
            domain={[0, 100]} 
            tickCount={6}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend />

          {/* הקו המרכזי של הציון */}
          <Line
            name="ציון בטיחות"
            type="basis"
            dataKey="score"
            stroke="#8884d8"
            strokeWidth={4}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;