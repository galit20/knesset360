import { useState, useEffect } from 'react';
import './Factions.css';

const KNESSET_OPTIONS = [20, 21, 22, 23, 24, 25];

const FACTION_LOGOS = {
  'הליכוד': '/faction-logos/likud.png',
  'כחול לבן': '/faction-logos/kahol_lavan.png',
  'יש עתיד': '/faction-logos/yesh_atid.png',
  'המחנה הציוני': '/faction-logos/hamahane_hazioni.png',
  'המחנה הדמוקרטי': '/faction-logos/hamahane_hademokrati.png',
  'המחנה הממלכתי': '/faction-logos/kahol_lavan.png',
  'הרשימה המשותפת': '/faction-logos/Joint_List.png',
  'מרצ': '/faction-logos/Meretz.png',
  'שס': '/faction-logos/shas.png',
  'יהדות התורה': '/faction-logos/yahadut_hatora.png',
  'ישראל ביתנו': '/faction-logos/israel.jpg',
  'העבודה': '/faction-logos/Haavoda.png',
  'כולנו': '/faction-logos/kulanu.jpg',
  'הבית היהודי': '/faction-logos/habait_hayeudi.png',
  'ימינה': '/faction-logos/yamina.png',
  'הציונות הדתית': '/faction-logos/otzma_yehudit.png',
  'עוצמה יהודית': '/faction-logos/otzma_yehudit.png',
  'תקווה חדשה': '/faction-logos/tikva_hadasha.png',
  'רעם': '/faction-logos/raam.png',
  'חדש': '/faction-logos/Hadash.png',
  'תעל': '/faction-logos/hadash_taal.png',
  'חדש-תעל': '/faction-logos/hadash_taal.png',
  'דגל התורה': '/faction-logos/degel_hatora.jpg',
  'אגודת ישראל': '/faction-logos/Agudat_Yisrael.png',
  'גשר': '/faction-logos/haavoda_gesher.png',
  'תלם': '/faction-logos/telem.png',
  'יש עתיד - תלם': '/faction-logos/yesh_atid_telem.jpeg',
  'העבודה - גשר': '/faction-logos/havoda_geshser_meretz.jpeg',
  'העבודה - גשר - מרצ': '/faction-logos/havoda_geshser_meretz.jpeg',
  'הימין החדש': '/faction-logos/Yamin_Mamlakhti.png',
  'הימין הממלכתי': '/faction-logos/Yamin_Mamlakhti.png',
  'בלד': '/faction-logos/raam_balad.png',
  'רעם - בלד': '/faction-logos/raam_balad.png',
};

const STATUS_COLORS = {
  'עברו': '#1a3a8f',
  'בתהליך': '#60a5fa',
  'נעצרו': '#e2e8f0',
  'אחר': '#94a3b8'
};

function getDominantColor(imgEl, fallback = '#1a3a8f') {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, 50, 50);
    const data = ctx.getImageData(0, 0, 50, 50).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 128) continue;
      const pr = data[i], pg = data[i + 1], pb = data[i + 2];
      const brightness = (pr + pg + pb) / 3;
      if (brightness > 230 || brightness < 20) continue;
      r += pr; g += pg; b += pb; count++;
    }
    if (count === 0) return fallback;
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    const darken = 0.6;
    return `rgb(${Math.round(r * darken)},${Math.round(g * darken)},${Math.round(b * darken)})`;
  } catch {
    return fallback;
  }
}

function FactionBanner({ faction }) {
  const [bannerColor, setBannerColor] = useState('#1a3a8f');
  const logoSrc = FACTION_LOGOS[faction.name];

  useEffect(() => {
    if (!logoSrc) return;
    setBannerColor('#1a3a8f');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBannerColor(getDominantColor(img));
    img.src = logoSrc;
  }, [logoSrc]);

  return (
    <div className="faction-banner" style={{ background: bannerColor }}>
      {logoSrc && (
        <div className="faction-banner-logo">
          <img src={logoSrc} alt={faction.name} />
        </div>
      )}
      <div className="faction-banner-text">
        <h3 className="faction-banner-name">{faction.name}</h3>
        {faction.startdate && (
          <p className="faction-banner-dates">
            {new Date(faction.startdate).getFullYear()}
            {faction.finishdate
              ? ` – ${new Date(faction.finishdate).getFullYear()}`
              : ' – היום'}
          </p>
        )}
      </div>
    </div>
  );
}

function DonutChart({ statusData, selectedTopic, onClear }) {
  const total = statusData.reduce((sum, s) => sum + s.count, 0);
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const strokeWidth = 22;
  let cumulative = 0;

  return (
    <div className="status-chart">
      <h4 className="topics-title">
        {selectedTopic ? `${selectedTopic} — סטטוס` : 'כל הצעות החוק — סטטוס'}
      </h4>

      <div className="donut-container">
        <div className="donut-legend">
          {statusData.map((s, i) => (
            <div key={i} className="legend-item">
              <span className="legend-dot" style={{ background: STATUS_COLORS[s.status_group] || '#ccc' }} />
              <span className="legend-label">{s.status_group}</span>
              <span className="legend-count"> — {s.count}</span>
              <span className="legend-pct"> ({Math.round(s.count / total * 100)}%)</span>
            </div>
          ))}
        </div>

        <div className="donut-svg-wrap">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {statusData.map((s, i) => {
              const pct = s.count / total;
              const circumference = 2 * Math.PI * radius;
              const dash = pct * circumference;
              const gap = circumference - dash;
              const offset = -(cumulative * circumference) + circumference / 4;
              cumulative += pct;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={STATUS_COLORS[s.status_group] || '#ccc'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={offset}
                />
              );
            })}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1a1a2e">
              {total.toLocaleString()}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#888">
              הצעות
            </text>
          </svg>
        </div>
      </div>

      {selectedTopic && (
        <button className="clear-topic-btn" onClick={onClear}>
          חזור לכל הצעות החוק
        </button>
      )}
    </div>
  );
}

function TopMKsBySubject({ topics, selectedTopic, onSelectTopic, topMKs }) {
  if (!topics.length) return null;

  return (
    <div className="top-mks-by-subject">
      <h4 className="topics-title">חברי כנסת מובילים לפי תחום</h4>

      <div className="subject-dropdown-row">
        <select
          className="subject-dropdown"
          value={selectedTopic || ''}
          onChange={e => onSelectTopic(e.target.value || null)}
        >
          <option value="">כל הצעות החוק</option>
          {topics.map((t, i) => (
            <option key={i} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="top-mks-list">
        {topMKs.length === 0 ? (
          <p className="no-mks-msg">אין נתונים לתחום זה</p>
        ) : (
          topMKs.map((mk, i) => {
            const initials = mk.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('');
            const maxCount = topMKs[0].bill_count;
            const barWidth = Math.round((mk.bill_count / maxCount) * 100);
            return (
              <div key={i} className="mk-card">
                <span className="mk-rank">{['🥇','🥈','🥉'][i]}</span>
                <div className="mk-avatar">{initials}</div>
                <span className="mk-name">{mk.name}</span>
                <div className="mk-bar-wrap">
                  <div className="mk-bar-fill" style={{ width: `${barWidth}%` }} />
                </div>
                <span className="mk-count">{mk.bill_count} הצעות</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Factions() {
  const [selectedKnesset, setSelectedKnesset] = useState(23);
  const [factions, setFactions] = useState([]);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [stats, setStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topMKs, setTopMKs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSelectedFaction(null);
    setStats(null);
    setTopics([]);
    setStatusData([]);
    setSelectedTopic(null);
    setTopMKs([]);
    setError(null);
    const url = selectedKnesset === 'all'
      ? 'http://localhost:8000/api/factions'
      : `http://localhost:8000/api/factions?knesset=${selectedKnesset}`;
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setFactions(data))
      .catch(e => {
        console.error('Failed to load factions:', e);
        setError('שגיאה בטעינת הסיעות');
      });
  }, [selectedKnesset]);

  useEffect(() => {
    if (!selectedFaction) return;
    setLoading(true);
    setStats(null);
    setTopics([]);
    setStatusData([]);
    setSelectedTopic(null);
    setTopMKs([]);
    const knessetParam = selectedKnesset === 'all' ? '' : `&knesset=${selectedKnesset}`;

    fetch(`http://localhost:8000/api/faction-stats?faction_id=${selectedFaction.id}${knessetParam}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setStats(data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });

    fetch(`http://localhost:8000/api/faction-topics?faction_id=${selectedFaction.id}${knessetParam}`)
      .then(r => r.json())
      .then(setTopics)
      .catch(console.error);

    fetch(`http://localhost:8000/api/faction-status?faction_id=${selectedFaction.id}${knessetParam}`)
      .then(r => r.json())
      .then(setStatusData)
      .catch(console.error);

    fetch(`http://localhost:8000/api/faction-top-mks?faction_id=${selectedFaction.id}${knessetParam}`)
      .then(r => r.json())
      .then(setTopMKs)
      .catch(console.error);

  }, [selectedFaction]);

  useEffect(() => {
    if (!selectedFaction) return;
    const knessetParam = selectedKnesset === 'all' ? '' : `&knesset=${selectedKnesset}`;
    const committeeParam = selectedTopic ? `&committee=${encodeURIComponent(selectedTopic)}` : '';

    fetch(`http://localhost:8000/api/faction-status?faction_id=${selectedFaction.id}${knessetParam}${committeeParam}`)
      .then(r => r.json())
      .then(setStatusData)
      .catch(console.error);

    fetch(`http://localhost:8000/api/faction-top-mks?faction_id=${selectedFaction.id}${knessetParam}${committeeParam}`)
      .then(r => r.json())
      .then(setTopMKs)
      .catch(console.error);

  }, [selectedTopic]);

  return (
    <div className="factions-page" dir="rtl">

      <p className="bar-label">מספר כנסת</p>
      <div className="selector-bar">
        {KNESSET_OPTIONS.map(k => (
          <button
            key={k}
            className={`selector-btn ${selectedKnesset === k ? 'active' : ''}`}
            onClick={() => setSelectedKnesset(k)}
          >
            {k}
          </button>
        ))}
        <button
          className={`selector-btn ${selectedKnesset === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedKnesset('all')}
        >
          הכל
        </button>
      </div>

      {error && <div className="stats-error">{error}</div>}

      {factions.length > 0 && (
        <>
          <p className="bar-label">מפלגות</p>
          <div className="faction-bar">
            {factions.map(f => (
              <button
                key={f.id}
                className={`selector-btn ${selectedFaction?.id === f.id ? 'active' : ''}`}
                onClick={() => setSelectedFaction(f)}
              >
                {f.name}
              </button>
            ))}
          </div>
        </>
      )}

      {factions.length === 0 && !error && (
        <div className="stats-loading">טוען סיעות...</div>
      )}

      {loading && <div className="stats-loading">טוען נתונים...</div>}

      {stats && !loading && (
        <div className="stats-panel">
          <FactionBanner faction={stats.faction} />
          <div className="stats-cards">
            <div className="stat-card">
              <span className="stat-number">{stats.total_bills.toLocaleString()}</span>
              <span className="stat-label">הצעות חוק שהוגשו</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.passed_bills.toLocaleString()}</span>
              <span className="stat-label">חוקים שעברו</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-number">{stats.success_rate}%</span>
              <span className="stat-label">אחוזי הצלחה</span>
            </div>
          </div>

          {topics.length > 0 && statusData.length > 0 && (
            <div className="charts-row">
              <DonutChart
                statusData={statusData}
                selectedTopic={selectedTopic}
                onClear={() => setSelectedTopic(null)}
              />
              <div className="topics-chart">
                <h4 className="topics-title">תחומי עיסוק — לחץ לסינון</h4>
                {topics.map((t, i) => (
                  <div
                    key={i}
                    className={`topic-row clickable ${selectedTopic === t.name ? 'selected' : ''}`}
                    onClick={() => setSelectedTopic(selectedTopic === t.name ? null : t.name)}
                  >
                    <span className="topic-name">{t.name}</span>
                    <div className="topic-bar-bg">
                      <div
                        className={`topic-bar-fill color-${i}`}
                        style={{ width: `${(t.bill_count / topics[0].bill_count) * 100}%` }}
                      />
                    </div>
                    <span className="topic-count">{t.bill_count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topics.length > 0 && (
            <TopMKsBySubject
              topics={topics}
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
              topMKs={topMKs}
            />
          )}

        </div>
      )}
    </div>
  );
}
