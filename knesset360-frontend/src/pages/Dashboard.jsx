import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import './Dashboard.css'

const API = 'http://localhost:8000'

const KNESSETS = [20, 21, 22, 23, 24, 25]

const SIGNIFICANT_EVENTS = []

const FACTION_COLORS = [
  '#3b82f6', '#10b981', '#a855f7', '#f97316',
  '#ef4444', '#eab308', '#06b6d4', '#ec4899',
  '#84cc16', '#f43f5e', '#8b5cf6', '#14b8a6',
]

const MONTH_LABELS = {
  '01': 'ינו', '02': 'פבר', '03': 'מרץ', '04': 'אפר',
  '05': 'מאי', '06': 'יונ', '07': 'יול', '08': 'אוג',
  '09': 'ספט', '10': 'אוק', '11': 'נוב', '12': 'דצמ',
}

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
      .then(r => r.json())
      .then(setCalendarData)
      .catch(() => {})
  }, [calMonth, calYear])

  const eventMonths = new Set(SIGNIFICANT_EVENTS.map(e => e.date.slice(0, 7)))
  const maxBills = Math.max(...billsPerMonth.map(b => b.count), 1)

  const today = new Date()
  const firstDay = new Date(calYear, calMonth - 1, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth, 0).getDate()
  const eventDays = new Set(calendarData.map(d => new Date(d.session_date).getDate()))

  const totalBills = billStatus.reduce((a, b) => a + b.count, 0)
  const statusOrder = ['בתהליך', 'נעצרו', 'עברו', 'אחר']
  const statusColors = { 'בתהליך': '#2563eb', 'נעצרו': '#94a3b8', 'עברו': '#16a34a', 'אחר': '#888' }
  const sortedStatus = [...billStatus].sort(
    (a, b) => statusOrder.indexOf(a.status_group) - statusOrder.indexOf(b.status_group)
  )

  const DAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
  const MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

  const prevMonth = () => {
    if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  return (
    <div className="dashboard" dir="rtl">

      {/* Knesset selector */}
      <div className="dash-ksel-row">
        {[...KNESSETS].reverse().map(k => (
          <button
            key={k}
            className={`dash-ksel-btn ${selectedKnesset === k ? 'active' : ''}`}
            onClick={() => setSelectedKnesset(k)}
          >
            כנסת {k}
          </button>
        ))}
        <button
          className={`dash-ksel-btn ${selectedKnesset === null ? 'active' : ''}`}
          onClick={() => setSelectedKnesset(null)}
        >
          הכל
        </button>
      </div>

      {loading ? (
        <div className="dash-loading">טוען נתונים...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="dash-stats-row">
            <StatCard
              label="חברי כנסת"
              value={stats ? (stats.women + stats.men) : '—'}
            />
            <StatCard
              label="חילופי ח״כים"
              value={stats?.mid_term_exits ?? '—'}
            />
            <StatCard
              label="משרדי ממשלה"
              value={stats?.ministries ?? '—'}
            />
            <StatCard
              label="הצעות חוק"
              value={stats?.total_bills?.toLocaleString() ?? '—'}
            />
          </div>

          {/* Bills per month chart */}
          <div className="dash-widget dash-widget-full">
            <div className="dash-widget-title">
              הצעות חוק לפי חודש
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={billsPerMonth} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6b7a99', fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {billsPerMonth.map((entry, i) => (
                    <Cell key={i} fill='#2d4a7a' />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Middle row: factions + committees */}
          <div className="dash-mid-row">
            <div className="dash-widget">
              <div className="dash-widget-title">התפלגות מנדטים</div>
              <div className="dash-factions">
                {[...factions].sort((a, b) => b.seats - a.seats).map((f, i) => (
                  <div key={f.name} className="dash-faction-row">
                    <span className="dash-faction-name">{f.name}</span>
                    <div className="dash-faction-bar-wrap">
                      <div
                        className="dash-faction-bar"
                        style={{
                          width: `${(f.seats / (Math.max(...factions.map(x => x.seats)) || 1)) * 100}%`,
                          background: FACTION_COLORS[i % FACTION_COLORS.length],
                        }}
                      />
                      <span className="dash-faction-seats">{f.seats}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-widget">
              <div className="dash-widget-title">ועדות פעילות</div>
              <div className="dash-committees">
                {hotCommittees.map((c, i) => (
                  <div key={c.name} className="dash-committee-row">
                    <span className="dash-committee-name">{c.name}</span>
                    <div className="dash-committee-bar-bg">
                      <div
                        className="dash-committee-bar-fill"
                        style={{ width: `${(c.session_count / (hotCommittees[0]?.session_count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="dash-committee-count">{c.session_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row: bill status + calendar + gender */}
          <div className="dash-bottom-row">
            <div className="dash-widget">
              <div className="dash-widget-title">סטטוס הצעות חוק</div>
              <div className="dash-status-list">
                {sortedStatus.filter(s => s.status_group !== 'אחר').map(s => (
                  <div key={s.status_group} className="dash-status-row">
                    <span className="dash-status-pct">
                      {totalBills ? Math.round((s.count / totalBills) * 100) : 0}%
                    </span>
                    <span className="dash-status-label">{s.status_group}</span>
                    <div className="dash-status-bar-bg">
                      <div
                        className="dash-status-bar-fill"
                        style={{
                          width: `${totalBills ? (s.count / totalBills) * 100 : 0}%`,
                          background: statusColors[s.status_group],
                        }}
                      />
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
                {DAY_LABELS.map(d => (
                  <div key={d} className="dash-cal-header">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isToday =
                    day === today.getDate() &&
                    calMonth === today.getMonth() + 1 &&
                    calYear === today.getFullYear()
                  const hasEvent = eventDays.has(day)
                  return (
                    <div
                      key={day}
                      className={`dash-cal-cell ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="dash-widget">
              <div className="dash-widget-title">פילוח מגדרי</div>
              {stats && (
                <>
                  <div className="dash-gender-chart">
                    <svg viewBox="0 0 120 120" width="110" height="110">
                      {(() => {
                        const total = stats.women + stats.men
                        const womenPct = total ? stats.women / total : 0
                        const menPct = 1 - womenPct
                        const circumference = 2 * Math.PI * 48
                        const womenDash = circumference * womenPct
                        const menDash = circumference * menPct
                        return (
                          <>
                            <circle
                              cx="60" cy="60" r="48"
                              fill="none"
                              stroke="#1E5FA8"
                              strokeWidth="18"
                              strokeDasharray={`${menDash} ${circumference - menDash}`}
                              strokeDashoffset={circumference * 0.25 - womenDash}
                              strokeLinecap="butt"
                            />
                            <circle
                              cx="60" cy="60" r="48"
                              fill="none"
                              stroke="#FF6B9D"
                              strokeWidth="18"
                              strokeDasharray={`${womenDash} ${circumference - womenDash}`}
                              strokeDashoffset={circumference * 0.25}
                              strokeLinecap="butt"
                            />
                          </>
                        )
                      })()}
                    </svg>
                  </div>
                  <div className="dash-gender-legend">
                    <div className="dash-legend-item">
                      <span className="dash-legend-dot" style={{ background: '#FF6B9D' }} />
                      <i className="ti ti-woman" style={{ color: '#FF6B9D', fontSize: '16px' }} />
                      נשים {stats.women} ({stats.women + stats.men ? Math.round((stats.women / (stats.women + stats.men)) * 100) : 0}%)
                    </div>
                    <div className="dash-legend-item">
                      <span className="dash-legend-dot" style={{ background: '#1E5FA8' }} />
                      <i className="ti ti-man" style={{ color: '#1E5FA8', fontSize: '16px' }} />
                      גברים {stats.men} ({stats.women + stats.men ? Math.round((stats.men / (stats.women + stats.men)) * 100) : 0}%)
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
