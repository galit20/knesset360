import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import MkAvatar from '../components/MkAvatar'
import './Dashboard.css'

const API = 'http://localhost:8000'
const KNESSETS = [20, 21, 22, 23, 24, 25]

// Hardcoded historical/security events to mark on the timeline as dashed
// reference lines. `month` is in the same 'YYYY-MM' format the backend
// returns, used to find the closest available bar even if no bill happens
// to be published in that exact month (common at the start/end of a term).
const TIMELINE_EVENTS = [
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

function MonthTick({ x, y, payload }) {
  const label = payload?.value || '';
  const isJan = label.startsWith('1/');

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={10}
        textAnchor="middle"
        fontSize={8}
        fill={isJan ? '#1a1a2e' : '#6b7a99'}
        fontWeight={isJan ? 700 : 400}
      >
        {label}
      </text>
    </g>
  );
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

function formatWeekDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const FACTION_NAME_OVERRIDES = {
  'חדש-תעל': 'חד"ש-תע"ל',
  'רעם': 'רע"מ',
  'שס': 'ש"ס',
  'כחול לבן - המחנה הממלכתי': 'כחול לבן',
  'הציונות הדתית (נסגרה)': 'הציונות הדתית',
  'התאחדות הספרדים שומרי תורה תנועתו של מרן הרב עובדיה יוסף זצל': 'ש"ס',
  'עוצמה יהודית בראשות איתמר בן גביר': 'עוצמה יהודית',
  'הציונות הדתית בראשות בצלאל סמוטריץ\'': 'הציונות הדתית',
  'הליכוד בהנהגת בנימין נתניהו לראשות הממשלה': 'הליכוד',
  'ימינה בראשות נפתלי בנט': 'ימינה',
  'יהדות התורה והשבת - אגודת ישראל דגל התורה': 'יהדות התורה',
  'הרשימה הערבית המאוחדת': 'רע"מ',
  'כחול לבן בראשות בנימין גנץ': 'כחול לבן',
  'הרשימה המשותפת חדש, רעמ, תעל, בלד': 'הרשימה המשותפת',
  'יהדות התורה והשבת אגודת ישראל - דגל התורה': 'יהדות התורה',
  'ישראל ביתנו בראשות אביגדור ליברמן': 'ישראל ביתנו',
  'הרשימה המשותפת חדש, רעם, תעל, בלד': 'הרשימה המשותפת',
  'ימינה בראשות איילת שקד הבית היהודי – האיחוד הלאומי – הימין החדש': 'ימינה',
  'חדש תעל בראשות איימן עודה ואחמד טיבי': 'חד"ש תע"ל',
  'הבית היהודי - האיחוד הלאומי': 'ימינה',
  'כולנו בראשות משה כחלון': 'כולנו',
  'רעם - בלד - הרשימה הערבית המאוחדת ברית לאומית דמוקרטית': 'רע"מ - בל"ד',
  'הבית היהודי בראשות נפתלי בנט': 'הבית היהודי',
  'תקווה חדשה - אחדות לישראל': 'תקווה חדשה',
  'נעם - בראשות חהכ אבי מעוז': 'נעם',
  'נעם - בראשות אבי מעוז': 'נעם',
  'תלם - תנועה לאומית ממלכתית': 'תלם',
  'תעל – בראשות אחמד טיבי': 'תע"ל',
}

function normalizeFactionName(name) {
  if (!name) return name
  const trimmed = name.trim()
  for (const [key, display] of Object.entries(FACTION_NAME_OVERRIDES)) {
    if (trimmed.includes(key)) return display
  }
  return trimmed
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

  useEffect(() => {
    fetch(`${API}/api/dashboard/latest-committee-date`)
      .then(r => r.json())
      .then(data => {
        if (data?.latest_date) {
          const d = new Date(data.latest_date)
          setCalYear(d.getFullYear())
          setCalMonth(d.getMonth() + 1)
        }
      })
      .catch(() => {})
  }, [])
  const [loading, setLoading] = useState(true)
  const [weekSummary, setWeekSummary] = useState(null)

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
        label: (parseInt(row.month?.slice(5, 7)) || '') + '/' + (row.month?.slice(0, 4) || ''),
      })))
      setBillStatus(bs)
      setHotCommittees(hc)
      setFactions(f)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [selectedKnesset])

  useEffect(() => {
    fetch(`${API}/api/dashboard/committee-calendar?year=${calYear}&month=${calMonth}&knesset=${selectedKnesset}`)
      .then(r => r.json()).then(setCalendarData).catch(() => {})
  }, [calMonth, calYear, selectedKnesset])

  useEffect(() => {
    if (selectedKnesset !== 25) {
      setWeekSummary(null)
      return
    }
    fetch(`${API}/api/dashboard/last-week-summary`)
      .then(r => r.json()).then(setWeekSummary).catch(() => {})
  }, [selectedKnesset])

  const today = new Date()
  const firstDay = new Date(calYear, calMonth - 1, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth, 0).getDate()

  // Build day → [committee names] map for tooltips (top 3 + count of rest)
  const dayCommittees = {}
  for (const d of calendarData) {
    const day = new Date(d.session_date).getDate()
    if (!dayCommittees[day]) dayCommittees[day] = []
    dayCommittees[day].push(d.committee_name)
  }

  const totalBills = billStatus.reduce((a, b) => a + b.count, 0)
  const statusOrder = ['בתהליך', 'נעצרו', 'עברו', 'אחר']
  const statusColors = { 'בתהליך': '#2563eb', 'נעצרו': '#94a3b8', 'עברו': '#16a34a', 'אחר': '#888' }
  const sortedStatus = [...billStatus].sort((a, b) => statusOrder.indexOf(a.status_group) - statusOrder.indexOf(b.status_group))

  const DAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
  const MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

  const prevMonth = () => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }

  // Year range for dropdown: 2015 to 2027
  const calYears = Array.from({ length: 2027 - 2015 + 1 }, (_, i) => 2015 + i)

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

          {selectedKnesset === 25 && weekSummary && weekSummary.week_end && (
            <div className="dash-widget dash-widget-full dash-week-summary">
              <div className="dash-widget-title">
                סיכום השבוע האחרון ({formatWeekDate(weekSummary.week_start)} – {formatWeekDate(weekSummary.week_end)})
              </div>
              <div className="dash-week-grid">
                <div className="dash-week-cell dash-week-cell-blue">
                  <div className="dash-week-value">{weekSummary.plenum_sessions}</div>
                  <div className="dash-week-label">ישיבות מליאה</div>
                </div>
                <div className="dash-week-cell dash-week-cell-purple">
                  <div className="dash-week-value">{weekSummary.committee_sessions}</div>
                  <div className="dash-week-label">ישיבות ועדות</div>
                </div>
                <div className="dash-week-cell dash-week-cell-green">
                  <div className="dash-week-value">{weekSummary.bills?.passed ?? 0}</div>
                  <div className="dash-week-label">חוקים שעברו</div>
                </div>
                <div className="dash-week-cell dash-week-cell-amber">
                  <div className="dash-week-value">{weekSummary.bills?.in_process ?? 0}</div>
                  <div className="dash-week-label">חוקים בתהליך חקיקה</div>
                </div>
                <div className="dash-week-cell dash-week-cell-red">
                  <div className="dash-week-value">{weekSummary.bills?.failed ?? 0}</div>
                  <div className="dash-week-label">הצעות חוק שנפלו</div>
                </div>
              </div>

              {weekSummary.active_committees && weekSummary.active_committees.length > 0 && (
                <div className="dash-week-section">
                  <div className="dash-week-section-title">דיוני הוועדות המובילות</div>
                  <div className="dash-week-bars">
                    {weekSummary.active_committees.map(c => {
                      const max = weekSummary.active_committees[0].session_count || 1
                      return (
                        <div key={c.committee_name} className="dash-week-bar-row">
                          <span className="dash-week-bar-label">{c.committee_name}</span>
                          <div className="dash-week-bar-bg">
                            <div className="dash-week-bar-fill" style={{ width: `${(c.session_count / max) * 100}%` }} />
                          </div>
                          <span className="dash-week-bar-count">{c.session_count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {weekSummary.top_mks && weekSummary.top_mks.length > 0 && (
                <div className="dash-week-section">
                  <div className="dash-week-section-title">חברי הכנסת המובילים</div>
                  <div className="dash-week-mks">
                    {weekSummary.top_mks.map(m => (
                      <div key={m.personid} className="dash-week-mk-card">
                        <MkAvatar id={m.personid} name={`${m.firstname} ${m.lastname}`} size={48} />
                        <div className="dash-week-mk-name">{m.firstname} {m.lastname}</div>
                        {m.faction_name && <div className="dash-week-mk-faction">{normalizeFactionName(m.faction_name)}</div>}
                        <div className="dash-week-mk-count">{m.bill_count} הצעות</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="dash-widget dash-widget-full">
            <div className="dash-widget-title">הצעות חוק לפי חודש</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={billsPerMonth} margin={{ top: 28, right: 8, left: -20, bottom: 14 }}>
                <XAxis dataKey="label" tick={<MonthTick />} axisLine={false} tickLine={false} interval={0} />
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
                    <span className="dash-faction-name">{f.name.replace('כחול לבן - המחנה הממלכתי', 'כחול לבן').replace('הציונות הדתית (נסגרה)', 'הציונות הדתית')}</span>
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
              <div className="dash-widget-title">לוח ועדות</div>
              <div className="dash-cal-nav-row">
                <button className="dash-cal-nav" onClick={prevMonth}>›</button>
                <div className="dash-cal-selectors">
                  <select className="dash-cal-select" value={calMonth} onChange={e => setCalMonth(Number(e.target.value))}>
                    {MONTH_NAMES.map((n, i) => <option key={i+1} value={i+1}>{n}</option>)}
                  </select>
                  <select className="dash-cal-select" value={calYear} onChange={e => setCalYear(Number(e.target.value))}>
                    {calYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button className="dash-cal-nav" onClick={nextMonth}>‹</button>
              </div>
              <div className="dash-cal">
                {DAY_LABELS.map(d => <div key={d} className="dash-cal-header">{d}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isToday = day === today.getDate() && calMonth === today.getMonth() + 1 && calYear === today.getFullYear()
                  const committees = dayCommittees[day] || []
                  const hasEvent = committees.length > 0
                  return (
                    <div key={day} className={`dash-cal-cell ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}`}>
                      {day}
                      {hasEvent && (
                        <>
                          <span className="dash-cal-dot" />
                          <div className="dash-cal-tooltip">
                            {committees.slice(0, 3).map((c, i) => <div key={i} className="dash-cal-tooltip-row">• {c}</div>)}
                            {committees.length > 3 && <div className="dash-cal-tooltip-row" style={{opacity:0.6}}>+{committees.length - 3} נוספות</div>}
                          </div>
                        </>
                      )}
                    </div>
                  )
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