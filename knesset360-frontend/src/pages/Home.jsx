import { useEffect, useRef, useState } from 'react';
import Countdown from 'react-countdown';
import buildingLogo from '../assets/building.svg';
import innerRingLogo from '../assets/inner-ring.svg';
import outerRingLogo from '../assets/outer-ring.svg';

import backgroundImg from '/banners/knesset2.jpg'

import './Home.css';

const TOPICS = [
  {
    id: 'health',
    label: 'בריאות ורפואה ציבורית',
    icon: '🏥',
    color: '#eff6ff',
    textColor: '#1e3a8a',
    accentColor: '#3b82f6',
    stat: '150',
    statLabel: 'מדדי בריאות לאורך 5 כנסות',
    blurb: 'ניתוח תקציבי, זמני המתנה בפריפריה וחקיקה רפואית שפתחו את שערי המערכת.',
    href: '/timeline/health',
  },
  {
    id: 'crime',
    label: 'ביטחון פנים ופשיעה',
    icon: '⚖️',
    color: '#fef2f2',
    textColor: '#991b1b',
    accentColor: '#ef4444',
    stat: '150',
    statLabel: 'נתון כלשהו בין השנים (2015-2025)',
    blurb: 'סקירת חוקי ענישה, תקציבי שיטור ומדדי פשיעה בחברה הישראלית.',
    href: '/timeline/crime',
  },
  {
    id: 'education',
    label: 'חינוך',
    icon: '📚',
    color: '#f0fdf4',
    textColor: '#166534',
    accentColor: '#22c55e',
    stat: '92%',
    statLabel: 'ממוצע השקעה פר תלמיד',
    blurb: 'רפורמות בחינוך, חלוקת משאבים אופקית והשפעת חוקי יסוד על מערכת הלמידה.',
    href: '/timeline/education',
  },
  {
    id: 'road-safety',
    label: 'בטיחות בדרכים ותשתיות',
    icon: '🛣️',
    color: '#fffbeb',
    textColor: '#92400e',
    accentColor: '#f59e0b',
    stat: '-38%',
    statLabel: 'שינוי בתאונות הדרכים',
    blurb: 'הקצאות לתשתיות לאומיות, דיוני ועדות הכלכלה ומדדי אכיפה בכבישים.',
    href: '/timeline/road_safety',
  },
];

const FACTS = [
  '120 חברי כנסת משרתים במשכן מאז קום המדינה בשנת 1949',
  '5 מחזורי בחירות רצופים נותחו והוזנו במסגרת הפרויקט',
  'עלייה במספר תאונות הדרכים הקטלניות לאורך עשור',
  '32 מפלגות שונות התמודדו באופן רשמי על מושבים בכנסת ה-25',
  'ההוצאה הממשלתית לבריאות צמחה ב-61% לאורך תקופת המעקב',
  'מדינת ישראל קיימה 5 מערכות בחירות סוערות בין 2019 ל-2022',
];

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    return <span className="election-started">מערכת הבחירות החלה! 🗳️</span>;
  } else {
    return (
      <div className="countdown-display" dir="ltr">
        <div className="time-block"><span>{days}</span><small>ימים</small></div>
        <div className="time-block"><span>{hours}</span><small>שעות</small></div>
        <div className="time-block"><span>{minutes}</span><small>דקות</small></div>
        <div className="time-block"><span>{seconds}</span><small>שניות</small></div>
      </div>
    );
  }
};

function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const isNeg = String(target).startsWith('-');
    const numStr = String(target).replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    const suffix = String(target).replace(/[0-9.,-]/g, '');
    const prefix = isNeg ? '-' : '';
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

function TopicCard({ topic, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const animatedStat = useCountUp(topic.stat, 1600, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 1 }
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
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${index * 100}ms`
      }}
    >
      <div className="topic-card-accent-bar" />
      <div className="topic-card-header">
        <span className="topic-icon">{topic.icon}</span>
        <h3 className="topic-label">{topic.label}</h3>
      </div>
      <div className="topic-stat">{visible ? animatedStat : '—'}</div>
      <div className="topic-stat-label">{topic.statLabel}</div>
      <p className="topic-blurb">{topic.blurb}</p>
      <div className="topic-arrow-circle">
        <span className="arrow-text">סקירת נתונים</span>
        <span className="arrow-sym">←</span>
      </div>
    </a>
  );
}

function Title() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);
  return (
    <h1 className="hero-title" aria-label="KNESSET 360" dir="ltr">
      {'KNESSET360°'.split('').map((ch, i) => (
        <span
          key={i}
          className="hero-char"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: `${i * 35}ms`,
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
  const belowFoldRef = useRef(null);

  const handleScrollDown = () => {
    belowFoldRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-wrapper">
      <div className="ticker-wrap" dir="rtl">
        <div className="ticker-label">מבט מהיר למשכן</div>
        <div className="ticker-track">
          <div className="ticker-inner">
            {FACTS.concat(FACTS).map((fact, idx) => (
              <span key={idx} className="ticker-item">{fact}</span>
            ))}
          </div>
        </div>
      </div>

      <section className="hero-section" style={{ backgroundImage: `url(${backgroundImg})` }}>
        <div className="hero-overlay"></div>
        
        <div className="hero-bg-grid" />
        
        <div className="hero-container">

          <div className="group-title">
            <div className="logo-container">
              <img src={buildingLogo} className="logo-layer static" alt="Knesset building" />
              <img src={innerRingLogo} className="logo-layer spin-counter" alt="" aria-hidden="true" />
              <img src={outerRingLogo} className="logo-layer spin-clock" alt="" aria-hidden="true" />
            </div>
            <Title />
          </div>
          

          <p className="hero-tagline">
            עשור של נתונים, תובנות ומגמות על פעילות הכנסת והחלטות הממשלה
          </p>

          <div className="election-box">
            <p className="election-label">:הבחירות הבאות בעוד</p>
            <Countdown date={electionDate} renderer={renderer} />
          </div>

          <div className="cta-button-group">
            <a href="/dashboard" className="cta-btn secondary-btn">
              לדף המפלגות
            </a>
            <a href="/dashboard" className="cta-btn primary-btn">
              לדשבורד המרכזי ←
            </a>
          </div>
        </div>

        <button 
          className="scroll-hint-trigger" 
          onClick={handleScrollDown}
          aria-label="גלול מטה לסקירת המדיניות"
        >
          <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      <div ref={belowFoldRef} className="below-the-fold-content">
        
        <section className="topics-section" dir="rtl">
          <div className="section-header-block">
            <p className="section-eyebrow">סקירת מדדי מדיניות</p>
            <h2 className="section-heading">עשור של חקיקה: ארבע זוויות לניתוח וסקירה</h2>
            <div className="header-divider" />
          </div>
          <div className="topics-grid">
            {TOPICS.map((t, i) => <TopicCard key={t.id} topic={t} index={i} />)}
          </div>
        </section>

        <section className="callout-section">
          <div className="callout-inner">
            <p className="callout-eyebrow">היקף פרויקט הנתונים</p>
            <h2 className="callout-heading">תשובות המבוססות על נתוני המקור<br />קבלו את התמונה המלאה.</h2>
            <p className="callout-body">
              עקבנו אחר כל הצעות החוקים, הצבעות מליאה ופרוטוקולי ועדות ומליאות החל מהכנסת ה-20 ועד היום, תוך הצלבה עם שינויים בשטח ומדדים אובייקטיביים.
            </p>
            <div className="callout-stats">
              <div className="callout-stat"><span>12+</span><small>מקורות מידע</small></div>
              <div className="callout-stat"><span>4</span><small>תחומי ליבה</small></div>
              <div className="callout-stat"><span>5</span><small>תקופות כנסת</small></div>
              <div className="callout-stat"><span>10+</span><small>שנות פעילות</small></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}