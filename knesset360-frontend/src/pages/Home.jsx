import { useEffect, useRef, useState } from 'react';

import Countdown from 'react-countdown';
import buildingLogo from '../assets/building.svg'
import innerRingLogo from '../assets/inner-ring.svg';
import outerRingLogo from '../assets/outer-ring.svg';

import './Home.css'


const TOPICS = [
  {
    id: 'health',
    label: 'בריאות',
    icon: '🏥',
    color: '#C1E1C1',
    textColor: '#1a4a1a',
    accentColor: '#2d7a2d',
    stat: '150',
    statLabel: 'מדדי בריאות לאורך 5 כנסות',
    blurb: '......',
    href: '/timeline/health',
  },
  {
    id: 'פשיעה',
    label: 'פשיעה',
    icon: '⚖️',
    color: '#F4C2C2',
    textColor: '#4a0f0f',
    accentColor: '#b02020',
    stat: '150',
    statLabel: 'נתון כלשהו בין השנים (2015-2025)',
    blurb: '........',
    href: '/timeline/crime',
  },
  {
    id: 'education',
    label: 'חינוך',
    icon: '📚',
    color: '#C2D4F4',
    textColor: '#0f1e4a',
    accentColor: '#1a3ab0',
    stat: '92%',
    statLabel: 'ממוצע של משהו',
    blurb: '...',
    href: '/timeline/education',
  },
  {
    id: 'road-safety',
    label: 'בטיחות בדרכים',
    icon: '🛣️',
    color: '#F4EAC2',
    textColor: '#4a3500',
    accentColor: '#b07a00',
    stat: '-38%',
    statLabel: 'עוד נתון כלשהו',
    blurb: '...... ',
    href: '/timeline/road_safety',
  },
];


// Helper to format election countdown display
const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
    // What to show when the election starts!
        return <span className="election-started">Elections are live! 🗳️</span>;
    } else {
    // The actual countdown display
    return (
        <div className="countdown-display">
            <div className="time-block"><span>{days}</span><small>Days</small></div>
            <div className="time-block"><span>{hours}</span><small>Hrs</small></div>
            <div className="time-block"><span>{minutes}</span><small>Min</small></div>
            <div className="time-block"><span>{seconds}</span><small>Sec</small></div>
        </div>
    );
  }
};


/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const isNeg = String(target).startsWith('−');
    const numStr = String(target).replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    const suffix = String(target).replace(/[0-9.,−]/g, '');
    const prefix = isNeg ? '−' : '';
    const raf = (t) => {
      const elapsed = t - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const curr = Math.round(eased * num * 10) / 10;
      setValue(`${prefix}${curr}${suffix}`);
      if (progress < 1) requestAnimationFrame(raf);
      else setValue(target);
    };
    requestAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

/*  Topic card component  */
function TopicCard({ topic, index }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const animatedStat = useCountUp(topic.stat, 1600, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <a
      ref={ref}
      href={topic.href}
      className="topic-card"
      style={{
        '--card-bg': topic.color,
        '--card-text': topic.textColor,
        '--card-accent': topic.accentColor,
        transitionDelay: `${index * 80}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="topic-icon">{topic.icon}</div>
      <div className="topic-label">{topic.label}</div>
      <div className="topic-stat">{visible ? animatedStat : '—'}</div>
      <div className="topic-stat-label">{topic.statLabel}</div>
      <p className="topic-blurb">{topic.blurb}</p>
      <div className="topic-arrow" style={{ transform: hovered ? 'translateX(6px)' : 'none' }}>→</div>
    </a>
  );
}

/* ─── Scrolling fast-facts ticker ─── */
const FACTS = [
  '120 seats in the Knesset since 1949',
  '5 election cycles covered in this project',
  'Road fatalities dropped 38% over 10 years',
  '32 parties competed in the 25th Knesset elections',
  'Health spending grew 61% over the tracked period',
  'Israel held 5 elections between 2019 and 2022',
  '2 Knessets were dissolved before completing a full term',
];


/* ───  headline with letter-stagger ─── */
function Title() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  const words = ['KNESSET360°'];
  return (
    <h1 className="hero-title" aria-label="KNESSET360°">
      {words[0].split('').map((ch, i) => (
        <span
          key={i}
          className="hero-char"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transitionDelay: `${i * 40}ms`,
          }}
        >
          {ch}
        </span>
      ))}
    </h1>
  );
}



export default function Home() {
    const electionDate = new Date('2026-10-27T00:00:00');
    return (
        <div className="content-container">
          <div className="logo-container">
              <img src={buildingLogo} className="logo-layer static" alt="Knesset building" />
              <img src={innerRingLogo} className="logo-layer spin-counter" alt="" aria-hidden="true" />
              <img src={outerRingLogo} className="logo-layer spin-clock" alt="" aria-hidden="true" />
          </div>

          <Title />

          <p className="hero-tagline">
          עשור של נתונים, תובנות ומגמות על פעילות הכנסת
          </p>

          <div className="election-box">
            <p className="election-label">:הבחירות הבאות בעוד</p>
          <Countdown date={electionDate} renderer={renderer} />
          </div>

          <a href="/dashboard" className="cta-btn" style={{
            transition: 'opacity 0.7s 0.9s ease',
          }}>
            לדשבורד →
          </a>
          <a href="/dashboard" className="cta-btn" style={{
            transition: 'opacity 0.7s 0.9s ease',
          }}>
            לדף המפלגות →
          </a>

          <div className="scroll-hint" aria-hidden="true">
            <span className="scroll-dot" />
          </div>

        {/* Topics */}
        <section className="topics-section">
            <p className="section-eyebrow">סקירת הנושאים שלנו</p>
            <h2 className="section-heading">עשור של מדיניות: ארבע זוויות לניתוח ולהבנה</h2>
            <div className="topics-grid">
            {TOPICS.map((t, i) => <TopicCard key={t.id} topic={t} index={i} />)}
            </div>
        </section>
        </div>
    )
}