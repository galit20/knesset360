// import { useState, useEffect } from 'react';
// import './Factions.css';

// const KNESSET_OPTIONS = [20, 21, 22, 23, 24, 25];

// const FACTION_LOGOS = {
//   'הליכוד': '/faction-logos/likud.png',
//   'כחול לבן': '/faction-logos/kahol_lavan.png',
//   'יש עתיד': '/faction-logos/yesh_atid.png',
//   'המחנה הציוני': '/faction-logos/hamahane_hazioni.png',
//   'המחנה הדמוקרטי': '/faction-logos/hamahane_hademokrati.png',
//   'המחנה הממלכתי': '/faction-logos/kahol_lavan.png',
//   'הרשימה המשותפת': '/faction-logos/Joint_List.png',
//   'מרצ': '/faction-logos/Meretz.png',
//   'שס': '/faction-logos/shas.png',
//   'יהדות התורה': '/faction-logos/yahadut_hatora.png',
//   'ישראל ביתנו': '/faction-logos/israel.jpg',
//   'העבודה': '/faction-logos/Haavoda.png',
//   'כולנו': '/faction-logos/kulanu.jpg',
//   'הבית היהודי': '/faction-logos/habait_hayeudi.png',
//   'ימינה': '/faction-logos/yamina.png',
//   'הציונות הדתית': '/faction-logos/otzma_yehudit.png',
//   'עוצמה יהודית': '/faction-logos/otzma_yehudit.png',
//   'תקווה חדשה': '/faction-logos/tikva_hadasha.png',
//   'רעם': '/faction-logos/raam.png',
//   'חדש': '/faction-logos/Hadash.png',
//   'תעל': '/faction-logos/hadash_taal.png',
//   'חדש-תעל': '/faction-logos/hadash_taal.png',
//   'דגל התורה': '/faction-logos/degel_hatora.jpg',
//   'אגודת ישראל': '/faction-logos/Agudat_Yisrael.png',
//   'גשר': '/faction-logos/haavoda_gesher.png',
//   'תלם': '/faction-logos/telem.png',
//   'יש עתיד - תלם': '/faction-logos/yesh_atid_telem.jpeg',
//   'העבודה - גשר': '/faction-logos/havoda_geshser_meretz.jpeg',
//   'העבודה - גשר - מרצ': '/faction-logos/havoda_geshser_meretz.jpeg',
//   'הימין החדש': '/faction-logos/Yamin_Mamlakhti.png',
//   'הימין הממלכתי': '/faction-logos/Yamin_Mamlakhti.png',
//   'בלד': '/faction-logos/raam_balad.png',
//   'רעם - בלד': '/faction-logos/raam_balad.png',
// };

// const STATUS_COLORS = {
//   'עברו': '#1a3a8f',
//   'בתהליך': '#60a5fa',
//   'נעצרו': '#e2e8f0',
//   'אחר': '#94a3b8'
// };

// const OFFICIAL_SEATS = {
//   20: {
//     'הליכוד': 30,
//     'המחנה הציוני': 24,
//     'הרשימה המשותפת': 13,
//     'יש עתיד': 11,
//     'כולנו': 10,
//     'הבית היהודי': 8,
//     'שס': 7,
//     'ישראל ביתנו': 6,
//     'יהדות התורה': 6,
//     'מרצ': 5,
//   },
//   21: {
//     'הליכוד': 35,
//     'כחול לבן': 35,
//     'חדש-תעל': 6,
//     'רעם-בלד': 4,
//     'שס': 8,
//     'יהדות התורה': 8,
//     'ישראל ביתנו': 5,
//     'העבודה': 6,
//     'תקווה חדשה': 4,
//     'מרצ': 4,
//   },
//   22: {
//     'כחול לבן': 33,
//     'הליכוד': 32,
//     'הרשימה המשותפת': 13,
//     'ישראל ביתנו': 8,
//     'שס': 9,
//     'יהדות התורה': 7,
//     'העבודה-גשר-מרצ': 7,
//     'ימינה': 7,
//     'כולנו': 4,
//     'רעם-בלד': 4,
//   },
//   23: {
//     'הליכוד': 36,
//     'כחול לבן': 33,
//     'הרשימה המשותפת': 15,
//     'שס': 9,
//     'יהדות התורה': 7,
//     'ישראל ביתנו': 7,
//     'העבודה-גשר-מרצ': 7,
//     'ימינה': 6,
//   },
//   24: {
//     'הליכוד': 30,
//     'יש עתיד': 17,
//     'שס': 9,
//     'כחול לבן': 8,
//     'ימינה': 7,
//     'העבודה': 7,
//     'יהדות התורה': 7,
//     'ישראל ביתנו': 7,
//     'תקווה חדשה': 6,
//     'הרשימה המשותפת': 6,
//     'הציונות הדתית': 6,
//     'מרצ': 6,
//     'רעם': 4,
//   },
//   25: {
//     'הליכוד': 32,
//     'יש עתיד': 24,
//     'הציונות הדתית': 14,
//     'המחנה הממלכתי': 12,
//     'שס': 11,
//     'יהדות התורה': 7,
//     'ישראל ביתנו': 6,
//     'רעם': 5,
//     'חדש-תעל': 5,
//     'עבודה': 4,
//   },
// };

// const FACTION_COLORS = [
//   '#1a3a8f','#378ADD','#1D9E75','#EF9F27','#D85A30',
//   '#7F77DD','#D4537E','#5DCAA5','#639922','#E24B4A',
//   '#BA7517','#0F6E56','#534AB7','#993C1D','#888780',
// ];

// function ParliamentChart({ factions, selectedFaction, onSelect, knessetNum }) {
//   const colorMap = {};
//   factions.forEach((f, i) => { colorMap[f.id] = FACTION_COLORS[i % FACTION_COLORS.length]; });

//   const officialSeats = OFFICIAL_SEATS[knessetNum] || {};

//   const getSeatCount = (f) => {
//     if (knessetNum === 25) {
//       const n = f.name;
//       if (n.includes('ליכוד')) return 32;
//       if (n.includes('יש עתיד')) return 24;
//       if (n.includes('ציונות')) return 14;
//       if (n.includes('ממלכתי') || n.includes('כחול')) return 12;
//       if (n.includes('שס') || n.includes('ש"ס')) return 11;
//       if (n.includes('תורה')) return 7;
//       if (n.includes('ביתנו')) return 6;
//       if (n.includes('רעם') || n.includes('רע"מ')) return 5;
//       if (n.includes('חדש') || n.includes('תעל') || n.includes('תע"ל')) return 5;
//       if (n.includes('עבודה')) return 4;
//       if (n.includes('ימין') || n.includes('עוצמה')) return 0;
//     }
//     const match = Object.entries(officialSeats).find(([name]) =>
//       f.name.includes(name) || name.includes(f.name)
//     );
//     return match ? match[1] : (f.member_count || 0);
//   };

//   const total = factions.reduce((s, f) => s + getSeatCount(f), 0) || 120;
//   const cx = 220, cy = 200, innerR = 75, outerR = 165, rows = 4;

//   const allSeats = factions.flatMap(f =>
//     Array(getSeatCount(f)).fill({ id: f.id, color: colorMap[f.id] })
//   );

//   const seats = [];
//   let idx = 0;
//   for (let row = 0; row < rows; row++) {
//     const r = innerR + (outerR - innerR) * row / (rows - 1);
//     const n = Math.round(16 + row * 9);
//     for (let i = 0; i < n && idx < allSeats.length; i++, idx++) {
//       const angle = Math.PI + Math.PI * i / (n - 1);
//       const x = cx + r * Math.cos(angle);
//       const y = cy + r * Math.sin(angle);
//       seats.push({ x, y, ...allSeats[idx] });
//     }
//   }

//   return (
//     <div className="parliament-wrap">
//       <svg viewBox="0 0 440 210" className="parliament-svg">
//         {seats.map((s, i) => (
//           <circle
//             key={i}
//             cx={s.x.toFixed(1)}
//             cy={s.y.toFixed(1)}
//             r={selectedFaction?.id === s.id ? 7 : 5.5}
//             fill={s.color}
//             opacity={selectedFaction && selectedFaction.id !== s.id ? 0.25 : 1}
//             style={{ cursor: 'pointer', transition: 'opacity 0.2s, r 0.2s' }}
//             onClick={() => onSelect(factions.find(f => f.id === s.id))}
//           />
//         ))}

//       </svg>
//       <div className="parliament-legend">
//         {factions.map((f, i) => (
//           <div
//             key={f.id}
//             className={`parliament-legend-item ${selectedFaction?.id === f.id ? 'selected' : ''}`}
//             onClick={() => onSelect(selectedFaction?.id === f.id ? null : f)}
//           >
//             <span className="parliament-legend-dot" style={{ background: colorMap[f.id] }} />
//             <span className="parliament-legend-name">{f.name}</span>
//             <span className="parliament-legend-count">{getSeatCount(f)}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


// function FactionBanner({ faction, color }) {
//   const logoSrc = FACTION_LOGOS[faction.name];
//   const bannerColor = color || '#1a3a8f';

//   return (
//     <div className="faction-banner" style={{ background: bannerColor }}>
//       {logoSrc && (
//         <div className="faction-banner-logo">
//           <img src={logoSrc} alt={faction.name} />
//         </div>
//       )}
//       <div className="faction-banner-text">
//         <h3 className="faction-banner-name">{faction.name}</h3>
//         {faction.startdate && (
//           <p className="faction-banner-dates">
//             {new Date(faction.startdate).getFullYear()}
//             {faction.finishdate
//               ? ` – ${new Date(faction.finishdate).getFullYear()}`
//               : ' – היום'}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// function DonutChart({ statusData, selectedTopic, onClear }) {
//   const total = statusData.reduce((sum, s) => sum + s.count, 0);
//   const radius = 60;
//   const cx = 80;
//   const cy = 80;
//   const strokeWidth = 22;
//   let cumulative = 0;

//   return (
//     <div className="status-chart">
//       <h4 className="topics-title">
//         {selectedTopic ? `${selectedTopic} — סטטוס` : 'כל הצעות החוק — סטטוס'}
//       </h4>

//       <div className="donut-container">
//         <div className="donut-legend">
//           {statusData.map((s, i) => (
//             <div key={i} className="legend-item">
//               <span className="legend-dot" style={{ background: STATUS_COLORS[s.status_group] || '#ccc' }} />
//               <span className="legend-label">{s.status_group}</span>
//               <span className="legend-count">{s.count}</span>
//               <span className="legend-pct">({Math.round(s.count / total * 100)}%)</span>
//             </div>
//           ))}
//         </div>

//         <div className="donut-svg-wrap">
//           <svg width="160" height="160" viewBox="0 0 160 160">
//             {statusData.map((s, i) => {
//               const pct = s.count / total;
//               const circumference = 2 * Math.PI * radius;
//               const dash = pct * circumference;
//               const gap = circumference - dash;
//               const offset = -(cumulative * circumference) + circumference / 4;
//               cumulative += pct;
//               return (
//                 <circle
//                   key={i}
//                   cx={cx}
//                   cy={cy}
//                   r={radius}
//                   fill="none"
//                   stroke={STATUS_COLORS[s.status_group] || '#ccc'}
//                   strokeWidth={strokeWidth}
//                   strokeDasharray={`${dash} ${gap}`}
//                   strokeDashoffset={offset}
//                 />
//               );
//             })}
//             <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1a1a2e">
//               {total.toLocaleString()}
//             </text>
//             <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#888">
//               הצעות
//             </text>
//           </svg>
//         </div>
//       </div>

//       {selectedTopic && (
//         <button className="clear-topic-btn" onClick={onClear}>
//           חזור לכל הצעות החוק
//         </button>
//       )}
//     </div>
//   );
// }

// function TopMKsBySubject({ topics, selectedTopic, onSelectTopic, topMKs }) {
//   if (!topics.length) return null;

//   return (
//     <div className="top-mks-by-subject">
//       <h4 className="topics-title">חברי כנסת מובילים לפי תחום</h4>

//       <div className="subject-dropdown-row">
//         <select
//           className="subject-dropdown"
//           value={selectedTopic || ''}
//           onChange={e => onSelectTopic(e.target.value || null)}
//         >
//           <option value="">כל הצעות החוק</option>
//           {topics.map((t, i) => (
//             <option key={i} value={t.name}>{t.name}</option>
//           ))}
//         </select>
//       </div>

//       <div className="top-mks-list">
//         {topMKs.length === 0 ? (
//           <p className="no-mks-msg">אין נתונים לתחום זה</p>
//         ) : (
//           topMKs.map((mk, i) => {
//             const initials = mk.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('');
//             const maxCount = topMKs[0].bill_count;
//             const barWidth = Math.round((mk.bill_count / maxCount) * 100);
//             return (
//               <div key={i} className="mk-card">
//                 <span className="mk-rank">{['🥇','🥈','🥉'][i]}</span>
//                 <div className="mk-avatar">{initials}</div>
//                 <span className="mk-name">{mk.name}</span>
//                 <div className="mk-bar-wrap">
//                   <div className="mk-bar-fill" style={{ width: `${barWidth}%` }} />
//                 </div>
//                 <span className="mk-count">{mk.bill_count} הצעות</span>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }

// export default function Factions() {
//   const [selectedKnesset, setSelectedKnesset] = useState(23);
//   const [factions, setFactions] = useState([]);
//   const [selectedFaction, setSelectedFaction] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [topics, setTopics] = useState([]);
//   const [statusData, setStatusData] = useState([]);
//   const [selectedTopic, setSelectedTopic] = useState(null);
//   const [topMKs, setTopMKs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setSelectedFaction(null);
//     setStats(null);
//     setTopics([]);
//     setStatusData([]);
//     setSelectedTopic(null);
//     setTopMKs([]);
//     setError(null);
//     const url = selectedKnesset === 'all'
//       ? 'http://localhost:8000/api/factions'
//       : `http://localhost:8000/api/factions?knesset=${selectedKnesset}`;
//     fetch(url)
//       .then(r => {
//         if (!r.ok) throw new Error(`HTTP ${r.status}`);
//         return r.json();
//       })
//       .then(data => setFactions(data))
//       .catch(e => {
//         console.error('Failed to load factions:', e);
//         setError('שגיאה בטעינת הסיעות');
//       });
//   }, [selectedKnesset]);

//   useEffect(() => {
//     if (!selectedFaction) return;
//     setLoading(true);
//     setStats(null);
//     setTopics([]);
//     setStatusData([]);
//     setSelectedTopic(null);
//     setTopMKs([]);
//     const knessetParam = selectedKnesset === 'all' ? '' : `&knesset=${selectedKnesset}`;

//     fetch(`http://localhost:8000/api/faction-stats?faction_id=${selectedFaction.id}${knessetParam}`)
//       .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
//       .then(data => { setStats(data); setLoading(false); })
//       .catch(e => { console.error(e); setLoading(false); });

//     fetch(`http://localhost:8000/api/faction-topics?faction_id=${selectedFaction.id}${knessetParam}`)
//       .then(r => r.json())
//       .then(setTopics)
//       .catch(console.error);

//     fetch(`http://localhost:8000/api/faction-status?faction_id=${selectedFaction.id}${knessetParam}`)
//       .then(r => r.json())
//       .then(setStatusData)
//       .catch(console.error);

//     fetch(`http://localhost:8000/api/faction-top-mks?faction_id=${selectedFaction.id}${knessetParam}`)
//       .then(r => r.json())
//       .then(setTopMKs)
//       .catch(console.error);

//   }, [selectedFaction]);

//   useEffect(() => {
//     if (!selectedFaction) return;
//     const knessetParam = selectedKnesset === 'all' ? '' : `&knesset=${selectedKnesset}`;
//     const committeeParam = selectedTopic ? `&committee=${encodeURIComponent(selectedTopic)}` : '';

//     fetch(`http://localhost:8000/api/faction-status?faction_id=${selectedFaction.id}${knessetParam}${committeeParam}`)
//       .then(r => r.json())
//       .then(setStatusData)
//       .catch(console.error);

//     fetch(`http://localhost:8000/api/faction-top-mks?faction_id=${selectedFaction.id}${knessetParam}${committeeParam}`)
//       .then(r => r.json())
//       .then(setTopMKs)
//       .catch(console.error);

//   }, [selectedTopic]);

//   return (
//     <div className="factions-page" dir="rtl">

//       <p className="bar-label">מספר כנסת</p>
//       <div className="selector-bar">
//         {KNESSET_OPTIONS.map(k => (
//           <button
//             key={k}
//             className={`selector-btn ${selectedKnesset === k ? 'active' : ''}`}
//             onClick={() => setSelectedKnesset(k)}
//           >
//             {k}
//           </button>
//         ))}
//         <button
//           className={`selector-btn ${selectedKnesset === 'all' ? 'active' : ''}`}
//           onClick={() => setSelectedKnesset('all')}
//         >
//           הכל
//         </button>
//       </div>

//       {error && <div className="stats-error">{error}</div>}

//       {factions.length > 0 && (
//         <ParliamentChart
//           factions={[...factions].sort((a, b) => {
//             const seats = OFFICIAL_SEATS[selectedKnesset] || {};
//             const getSeats = f => {
//               const match = Object.entries(seats).find(([name]) => f.name.includes(name) || name.includes(f.name));
//               return match ? match[1] : (f.member_count || 0);
//             };
//             return getSeats(b) - getSeats(a);
//           })}
//           selectedFaction={selectedFaction}
//           onSelect={f => setSelectedFaction(f)}
//           knessetNum={selectedKnesset}
//         />
//       )}

//       {factions.length === 0 && !error && (
//         <div className="stats-loading">טוען סיעות...</div>
//       )}

//       {loading && <div className="stats-loading">טוען נתונים...</div>}

//       {stats && !loading && (
//         <div className="stats-panel">
//           <FactionBanner
//             faction={stats.faction}
//             color={FACTION_COLORS[factions.findIndex(f => f.id === stats.faction.id) % FACTION_COLORS.length]}
//           />
//           <div className="stats-cards">
//             <div className="stat-card">
//               <span className="stat-number">{stats.total_bills.toLocaleString()}</span>
//               <span className="stat-label">הצעות חוק שהוגשו</span>
//             </div>
//             <div className="stat-card">
//               <span className="stat-number">{stats.passed_bills.toLocaleString()}</span>
//               <span className="stat-label">חוקים שעברו</span>
//             </div>
//             <div className="stat-card highlight">
//               <span className="stat-number">{stats.success_rate}%</span>
//               <span className="stat-label">אחוזי הצלחה</span>
//             </div>
//           </div>

//           {topics.length > 0 && statusData.length > 0 && (
//             <div className="charts-row">
//               <DonutChart
//                 statusData={statusData}
//                 selectedTopic={selectedTopic}
//                 onClear={() => setSelectedTopic(null)}
//               />
//               <div className="topics-chart">
//                 <h4 className="topics-title">תחומי עיסוק — לחץ לסינון</h4>
//                 {topics.map((t, i) => (
//                   <div
//                     key={i}
//                     className={`topic-row clickable ${selectedTopic === t.name ? 'selected' : ''}`}
//                     onClick={() => setSelectedTopic(selectedTopic === t.name ? null : t.name)}
//                   >
//                     <span className="topic-name">{t.name}</span>
//                     <div className="topic-bar-bg">
//                       <div
//                         className={`topic-bar-fill color-${i}`}
//                         style={{ width: `${(t.bill_count / topics[0].bill_count) * 100}%` }}
//                       />
//                     </div>
//                     <span className="topic-count">{t.bill_count}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {topics.length > 0 && (
//             <TopMKsBySubject
//               topics={topics}
//               selectedTopic={selectedTopic}
//               onSelectTopic={setSelectedTopic}
//               topMKs={topMKs}
//             />
//           )}

//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import MkAvatar from '../components/MkAvatar';
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

const OFFICIAL_SEATS = {
  20: {
    'הליכוד': 30,
    'המחנה הציוני': 24,
    'הרשימה המשותפת': 13,
    'יש עתיד': 11,
    'כולנו': 10,
    'הבית היהודי': 8,
    'שס': 7,
    'ישראל ביתנו': 6,
    'יהדות התורה': 6,
    'מרצ': 5,
  },
  21: {
    'הליכוד': 35,
    'כחול לבן': 35,
    'חדש-תעל': 6,
    'רעם-בלד': 4,
    'שס': 8,
    'יהדות התורה': 8,
    'ישראל ביתנו': 5,
    'העבודה': 6,
    'תקווה חדשה': 4,
    'מרצ': 4,
  },
  22: {
    'כחול לבן': 33,
    'הליכוד': 32,
    'הרשימה המשותפת': 13,
    'ישראל ביתנו': 8,
    'שס': 9,
    'יהדות התורה': 7,
    'העבודה-גשר-מרצ': 7,
    'ימינה': 7,
    'כולנו': 4,
    'רעם-בלד': 4,
  },
  23: {
    'הליכוד': 36,
    'כחול לבן': 33,
    'הרשימה המשותפת': 15,
    'שס': 9,
    'יהדות התורה': 7,
    'ישראל ביתנו': 7,
    'העבודה-גשר-מרצ': 7,
    'ימינה': 6,
  },
  24: {
    'הליכוד': 30,
    'יש עתיד': 17,
    'שס': 9,
    'כחול לבן': 8,
    'ימינה': 7,
    'העבודה': 7,
    'יהדות התורה': 7,
    'ישראל ביתנו': 7,
    'תקווה חדשה': 6,
    'הרשימה המשותפת': 6,
    'הציונות הדתית': 6,
    'מרצ': 6,
    'רעם': 4,
  },
  25: {
    'הליכוד': 32,
    'יש עתיד': 24,
    'הציונות הדתית': 14,
    'המחנה הממלכתי': 12,
    'שס': 11,
    'יהדות התורה': 7,
    'ישראל ביתנו': 6,
    'רעם': 5,
    'חדש-תעל': 5,
    'עבודה': 4,
  },
};

const FACTION_COLORS = [
  '#1a3a8f','#378ADD','#1D9E75','#EF9F27','#D85A30',
  '#7F77DD','#D4537E','#5DCAA5','#639922','#E24B4A',
  '#BA7517','#0F6E56','#534AB7','#993C1D','#888780',
];

function ParliamentChart({ factions, selectedFaction, onSelect, knessetNum }) {
  const colorMap = {};
  factions.forEach((f, i) => { colorMap[f.id] = FACTION_COLORS[i % FACTION_COLORS.length]; });

  const officialSeats = OFFICIAL_SEATS[knessetNum] || {};

  const getSeatCount = (f) => {
    if (knessetNum === 25) {
      const n = f.name;
      if (n.includes('ליכוד')) return 32;
      if (n.includes('יש עתיד')) return 24;
      if (n.includes('ציונות')) return 14;
      if (n.includes('ממלכתי') || n.includes('כחול')) return 12;
      if (n.includes('שס') || n.includes('ש"ס')) return 11;
      if (n.includes('תורה')) return 7;
      if (n.includes('ביתנו')) return 6;
      if (n.includes('רעם') || n.includes('רע"מ')) return 5;
      if (n.includes('חדש') || n.includes('תעל') || n.includes('תע"ל')) return 5;
      if (n.includes('עבודה')) return 4;
      if (n.includes('ימין') || n.includes('עוצמה')) return 0;
    }
    const match = Object.entries(officialSeats).find(([name]) =>
      f.name.includes(name) || name.includes(f.name)
    );
    return match ? match[1] : (f.member_count || 0);
  };

  const total = factions.reduce((s, f) => s + getSeatCount(f), 0) || 120;
  const cx = 220, cy = 200, innerR = 75, outerR = 165, rows = 4;

  const allSeats = factions.flatMap(f =>
    Array(getSeatCount(f)).fill({ id: f.id, color: colorMap[f.id] })
  );

  const seats = [];
  let idx = 0;
  for (let row = 0; row < rows; row++) {
    const r = innerR + (outerR - innerR) * row / (rows - 1);
    const n = Math.round(16 + row * 9);
    for (let i = 0; i < n && idx < allSeats.length; i++, idx++) {
      const angle = Math.PI + Math.PI * i / (n - 1);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      seats.push({ x, y, ...allSeats[idx] });
    }
  }

  return (
    <div className="parliament-wrap">
      <svg viewBox="0 0 440 210" className="parliament-svg">
        {seats.map((s, i) => (
          <circle
            key={i}
            cx={s.x.toFixed(1)}
            cy={s.y.toFixed(1)}
            r={selectedFaction?.id === s.id ? 7 : 5.5}
            fill={s.color}
            opacity={selectedFaction && selectedFaction.id !== s.id ? 0.25 : 1}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s, r 0.2s' }}
            onClick={() => onSelect(factions.find(f => f.id === s.id))}
          />
        ))}

      </svg>
      <div className="parliament-legend">
        {factions.map((f, i) => (
          <div
            key={f.id}
            className={`parliament-legend-item ${selectedFaction?.id === f.id ? 'selected' : ''}`}
            onClick={() => onSelect(selectedFaction?.id === f.id ? null : f)}
          >
            <span className="parliament-legend-dot" style={{ background: colorMap[f.id] }} />
            <span className="parliament-legend-name">{f.name}</span>
            <span className="parliament-legend-count">{getSeatCount(f)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function FactionBanner({ faction, color }) {
  const logoSrc = FACTION_LOGOS[faction.name];
  const bannerColor = color || '#1a3a8f';

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
              <span className="legend-count">{s.count}</span>
              <span className="legend-pct">({Math.round(s.count / total * 100)}%)</span>
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
            const maxCount = topMKs[0].bill_count;
            const barWidth = Math.round((mk.bill_count / maxCount) * 100);
            return (
              <div key={i} className="mk-card">
                <span className="mk-rank">{['🥇','🥈','🥉'][i]}</span>
                <MkAvatar id={mk.personid} name={mk.name} size={36} />
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

function VotingDeviations({ data, loading, knesset }) {
  if (knesset === 'all') {
    return (
      <div className="voting-deviations">
        <h3 className="vd-title">חריגות בהצבעות</h3>
        <p className="vd-subtitle">הצבעות בהן חבר הכנסת חרג מעמדת הרוב בסיעתו</p>
        <p className="no-mks-msg">בחרו כנסת ספציפית כדי לצפות בחריגות בהצבעות</p>
      </div>
    );
  }

  if (loading) {
    return <div className="stats-loading">טוען נתוני הצבעות...</div>;
  }

  if (!data || !data.summary || data.summary.total_rebel_votes === 0) {
    return (
      <div className="voting-deviations">
        <h3 className="vd-title">חריגות בהצבעות</h3>
        <p className="vd-subtitle">הצבעות בהן חבר הכנסת חרג מעמדת הרוב בסיעתו</p>
        <p className="no-mks-msg">אין נתוני הצבעות מספקים לסיעה זו בכנסת הנבחרת</p>
      </div>
    );
  }

  const { summary, top_mks } = data;
  const maxCount = top_mks[0]?.rebel_count || 1;
  const barColors = ['#1a3a8f', '#2563eb', '#60a5fa'];

  return (
    <div className="voting-deviations">
      <h3 className="vd-title">חריגות בהצבעות</h3>
      <p className="vd-subtitle">הצבעות בהן חבר הכנסת חרג מעמדת הרוב בסיעתו</p>

      <div className="vd-stats-row">
        <div className="vd-stat-tile">
          <span className="vd-stat-number">{summary.total_rebel_votes}</span>
          <span className="vd-stat-label">סה״כ חריגות</span>
        </div>
        <div className="vd-stat-tile">
          <span className="vd-stat-number">{summary.rebel_mk_count}</span>
          <span className="vd-stat-label">חברי כנסת חורגים</span>
        </div>
      </div>

      <div className="vd-mk-list">
        {top_mks.map((mk, i) => (
          <div key={i} className="vd-mk-row">
            <MkAvatar id={mk.personid} name={mk.name} size={32} />
            <span className="vd-mk-name">{mk.name}</span>
            <div className="vd-mk-bar-wrap">
              <div
                className="vd-mk-bar-fill"
                style={{
                  width: `${(mk.rebel_count / maxCount) * 100}%`,
                  background: barColors[i % barColors.length],
                }}
              />
            </div>
            <span className="vd-mk-count" style={{ color: barColors[i % barColors.length] }}>
              {mk.rebel_count}
            </span>
          </div>
        ))}
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
  const [rebelsData, setRebelsData] = useState(null);
  const [rebelsLoading, setRebelsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSelectedFaction(null);
    setStats(null);
    setTopics([]);
    setStatusData([]);
    setSelectedTopic(null);
    setTopMKs([]);
    setRebelsData(null);
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
    setRebelsData(null);
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

  useEffect(() => {
    if (!selectedFaction || selectedKnesset === 'all') return;
    setRebelsLoading(true);
    fetch(`http://localhost:8000/api/faction-rebels?faction_id=${selectedFaction.id}&knesset=${selectedKnesset}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setRebelsData(data); setRebelsLoading(false); })
      .catch(e => { console.error(e); setRebelsLoading(false); });
  }, [selectedFaction, selectedKnesset]);

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
        <ParliamentChart
          factions={[...factions].sort((a, b) => {
            const seats = OFFICIAL_SEATS[selectedKnesset] || {};
            const getSeats = f => {
              const match = Object.entries(seats).find(([name]) => f.name.includes(name) || name.includes(f.name));
              return match ? match[1] : (f.member_count || 0);
            };
            return getSeats(b) - getSeats(a);
          })}
          selectedFaction={selectedFaction}
          onSelect={f => setSelectedFaction(f)}
          knessetNum={selectedKnesset}
        />
      )}

      {factions.length === 0 && !error && (
        <div className="stats-loading">טוען סיעות...</div>
      )}

      {loading && <div className="stats-loading">טוען נתונים...</div>}

      {stats && !loading && (
        <div className="stats-panel">
          <FactionBanner
            faction={stats.faction}
            color={FACTION_COLORS[factions.findIndex(f => f.id === stats.faction.id) % FACTION_COLORS.length]}
          />
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

          <VotingDeviations
            data={rebelsData}
            loading={rebelsLoading}
            knesset={selectedKnesset}
          />

        </div>
      )}
    </div>
  );
}