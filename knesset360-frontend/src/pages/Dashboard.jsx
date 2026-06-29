import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import './Dashboard.css'

const API = 'http://localhost:8000'
const KNESSETS = [20, 21, 22, 23, 24, 25]

// Hardcoded historical/security events to mark on the timeline as dashed
// reference lines. `month` is in the same 'YYYY-MM' format the backend
// returns, used to find the closest available bar even if no bill happens
// to be published in that exact month (common at the start/end of a term).
const TIMELINE_EVENTS = [
  { month: '2020-03', name: 'קורונה' },
  { month: '2021-05', name: 'שומר חומות' },
  { month: '2023-10', name: 'חרבות ברזל' },
  { month: '2025-06', name: 'עם כלביא' },
  { month: '2026-02', name: 'שאגת הארי' },
]

// Only snap to a nearby bar if it's within ~2 months - otherwise this
// Knesset's term doesn't actually cover the event at all, and it should
// stay hidden rather than render in a misleading position.
const MAX_SNAP_MONTHS = 2

function monthDiff(a, b) {
  const [ay, am] = a.split('-').map(Number)
  const [by, bm] = b.split('-').map(Number)
  return Math.abs((ay - by) * 12 + (am - bm))
}

function findNearestLabel(eventMonth, rows) {
  let best = null
  let bestDiff = Infinity
  for (const row of rows) {
    const diff = monthDiff(eventMonth, row.month)
    if (diff < bestDiff) {
      bestDiff = diff
      best = row.label
    }
  }
  return bestDiff <= MAX_SNAP_MONTHS ? best : null
}

function EventPillLabel({ viewBox, value }) {
  const { x, y } = viewBox
  const width = value.length * 6 + 16
  return (
    <g>
      <rect x={x - width / 2} y={y - 22} width={width} height={18} rx={9} fill="#e8e8ec" />
      <text x={x} y={y - 13} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={600} fill="#1a1a2e">
        {value}
      </text>
    </g>
  )
}

const FACTION_COLORS = [
  '#3b82f6', '#10b981', '#a855f7', '#f97316',
  '#ef4444', '#eab308', '#06b6d4', '#ec4899',
  '#84cc16', '#f43f5e', '#8b5cf6', '#14b8a6',
]

function StatCard({ label, value, sub }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">{value}</div>
      {sub && <div className="dash-stat-sub">{sub}</div>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="dash-tooltip">
        <div className="dash-tooltip-label">{label}</div>
        <div className="dash-tooltip-value">{payload[0].value} הצעות</div>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [selectedKnesset, setSelectedKnesset] = useState(25)
  const [stats, setStats] = useState(null)
  const [billsPerMonth, setBillsPerMonth] = useState([])
  const [billStatus, setBillStatus] = useState([])
  const [hotCommittees, setHotCommittees] = useState([])
  const [factions, setFactions] = useState([])
  const [calendarData, setCalendarData] = useState([])
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/api/dashboard/stats?knesset=${selectedKnesset}`).then(r => r.json()),
      fetch(`${API}/api/dashboard/bills-per-month?knesset=${selectedKnesset}`).then(r => r.json()),
      fetch(`${API}/api/dashboard/bill-status?knesset=${selectedKnesset}`).then(r => r.json()),
      fetch(`${API}/api/dashboard/hot-committees?knesset=${selectedKnesset}`).then(r => r.json()),
      fetch(`${API}/api/dashboard/factions?knesset=${selectedKnesset}`).then(r => r.json()),
    ]).then(([s, bpm, bs, hc, f]) => {
      setStats(s)
      setBillsPerMonth(bpm.map(row => ({
        ...row,
        label: (parseInt(row.month?.slice(5, 7)) || '') + '/' + (row.month?.slice(2, 4) || ''),
      })))
      setBillStatus(bs)
      setHotCommittees(hc)
      setFactions(f)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [selectedKnesset])

  useEffect(() => {
    fetch(`${API}/api/dashboard/committee-calendar?year=${calYear}&month=${calMonth}`)
      .then(r => r.json()).then(setCalendarData).catch(() => {})
  }, [calMonth, calYear])

  const today = new Date()
  const firstDay = new Date(calYear, calMonth - 1, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth, 0).getDate()
  const eventDays = new Set(calendarData.map(d => new Date(d.session_date).getDate()))

  const totalBills = billStatus.reduce((a, b) => a + b.count, 0)
  const statusOrder = ['בתהליך', 'נעצרו', 'עברו', 'אחר']
  const statusColors = { 'בתהליך': '#2563eb', 'נעצרו': '#94a3b8', 'עברו': '#16a34a', 'אחר': '#888' }
  const sortedStatus = [...billStatus].sort((a, b) => statusOrder.indexOf(a.status_group) - statusOrder.indexOf(b.status_group))

  const DAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
  const MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

  const prevMonth = () => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }

  const sortedFactions = [...factions].sort((a, b) => b.seats - a.seats)
  const maxSeats = sortedFactions[0]?.seats || 1
  const maxSessions = hotCommittees[0]?.session_count || 1

  return (
    <div className="dashboard" dir="rtl">
      <div className="dash-ksel-row">
        {[...KNESSETS].reverse().map(k => (
          <button key={k} className={`dash-ksel-btn ${selectedKnesset === k ? 'active' : ''}`} onClick={() => setSelectedKnesset(k)}>
            כנסת {k}
          </button>
        ))}
      </div>

      {loading ? <div className="dash-loading">טוען נתונים...</div> : (
        <>
          <div className="dash-stats-row">
            <StatCard label="חברי כנסת" value={stats ? (stats.women + stats.men) : '—'} />
            <StatCard label="חילופי ח״כים" value={stats?.mid_term_exits ?? '—'} />
            <StatCard label="משרדי ממשלה" value={stats?.ministries ?? '—'} />
            <StatCard label="הצעות חוק" value={stats?.total_bills?.toLocaleString() ?? '—'} />
          </div>

          <div className="dash-widget dash-widget-full">
            <div className="dash-widget-title">הצעות חוק לפי חודש</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={billsPerMonth} margin={{ top: 28, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: '#6b7a99', fontSize: 8 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {billsPerMonth.map((_, i) => <Cell key={i} fill='#2d4a7a' />)}
                </Bar>
                {TIMELINE_EVENTS
                  .map(ev => ({ ...ev, label: findNearestLabel(ev.month, billsPerMonth) }))
                  .filter(ev => ev.label !== null)
                  .map(ev => (
                    <ReferenceLine
                      key={ev.month}
                      x={ev.label}
                      stroke="#1a1a2e"
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                      label={<EventPillLabel value={ev.name} />}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="dash-mid-row">
            <div className="dash-widget">
              <div className="dash-widget-title">התפלגות מנדטים</div>
              <div className="dash-factions">
                {sortedFactions.map((f, i) => (
                  <div key={f.name} className="dash-faction-row">
                    <span className="dash-faction-name">{f.name}</span>
                    <div className="dash-faction-bar-bg">
                      <div
                        className="dash-faction-bar"
                        style={{
                          width: `${(f.seats / maxSeats) * 100}%`,
                          background: FACTION_COLORS[i % FACTION_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="dash-faction-seats">{f.seats}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-widget">
              <div className="dash-widget-title">ועדות פעילות</div>
              <div className="dash-committees">
                {hotCommittees.map((c) => (
                  <div key={c.name} className="dash-committee-row">
                    <span className="dash-committee-name">{c.name}</span>
                    <div className="dash-committee-bar-bg">
                      <div className="dash-committee-bar-fill" style={{ width: `${(c.session_count / maxSessions) * 100}%` }} />
                    </div>
                    <span className="dash-committee-count">{c.session_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dash-bottom-row">
            <div className="dash-widget">
              <div className="dash-widget-title">סטטוס הצעות חוק</div>
              <div className="dash-status-list">
                {sortedStatus.filter(s => s.status_group !== 'אחר').map(s => (
                  <div key={s.status_group} className="dash-status-row">
                    <span className="dash-status-pct">{totalBills ? Math.round((s.count / totalBills) * 100) : 0}%</span>
                    <span className="dash-status-label">{s.status_group}</span>
                    <div className="dash-status-bar-bg">
                      <div className="dash-status-bar-fill" style={{ width: `${totalBills ? (s.count / totalBills) * 100 : 0}%`, background: statusColors[s.status_group] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-widget">
              <div className="dash-widget-title">
                <button className="dash-cal-nav" onClick={prevMonth}>›</button>
                לוח ועדות — {MONTH_NAMES[calMonth - 1]} {calYear}
                <button className="dash-cal-nav" onClick={nextMonth}>‹</button>
              </div>
              <div className="dash-cal">
                {DAY_LABELS.map(d => <div key={d} className="dash-cal-header">{d}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isToday = day === today.getDate() && calMonth === today.getMonth() + 1 && calYear === today.getFullYear()
                  const hasEvent = eventDays.has(day)
                  return <div key={day} className={`dash-cal-cell ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}`}>{day}</div>
                })}
              </div>
            </div>

            <div className="dash-widget">
              <div className="dash-widget-title">פילוח מגדרי</div>
              {stats && (() => {
                const total = stats.women + stats.men
                const womenPct = total ? stats.women / total : 0
                const circumference = 2 * Math.PI * 48
                const womenDash = circumference * womenPct
                const menDash = circumference * (1 - womenPct)
                return (
                  <>
                    <div className="dash-gender-chart">
                      <svg viewBox="0 0 120 120" width="110" height="110">
                        <circle cx="60" cy="60" r="48" fill="none" stroke="#1E5FA8" strokeWidth="18"
                          strokeDasharray={`${menDash} ${circumference - menDash}`}
                          strokeDashoffset={circumference * 0.25 - womenDash} strokeLinecap="butt" />
                        <circle cx="60" cy="60" r="48" fill="none" stroke="#FF6B9D" strokeWidth="18"
                          strokeDasharray={`${womenDash} ${circumference - womenDash}`}
                          strokeDashoffset={circumference * 0.25} strokeLinecap="butt" />
                      </svg>
                    </div>
                    <div className="dash-gender-legend">
                      <div className="dash-legend-item">
                        <span className="dash-legend-dot" style={{ background: '#FF6B9D' }} />
                        נשים {stats.women} ({total ? Math.round((stats.women / total) * 100) : 0}%)
                      </div>
                      <div className="dash-legend-item">
                        <span className="dash-legend-dot" style={{ background: '#1E5FA8' }} />
                        גברים {stats.men} ({total ? Math.round((stats.men / total) * 100) : 0}%)
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}