import React, { useEffect, useState } from 'react';
import './About.css';
import uniLogo from '/bgu_logo.svg';

const GOALS = [
  { 
    title: 'שקיפות שלטונית', 
    desc: 'הנגשת נתוני כנסת מורכבים ופרוטוקולים ארוכים לציבור הרחב בצורה ברורה, ויזואלית ונגישה במקום אחד.', 
    icon: '👁️' 
  },
  { 
    title: 'אובייקטיביות מבוססת נתונים', 
    desc: 'הפרויקט אינו מביע דעה פוליטית. אנו מנתחים עשרות אלפי שורות של הצעות חוק והצבעות בעזרת אלגוריתמים מתקדמים ללא משוא פנים.', 
    icon: '⚖️' 
  },
  { 
    title: 'מעקב ארוך טווח', 
    desc: 'מעקב אחר השפעות, מגמות ודפוסי הצבעה על פני כנסות שלמות, המספק הבנה עמוקה מעבר לכותרות העיתונים היומיות.', 
    icon: '⏳' 
  },
];

const DATA_SOURCES = [
  { name: 'הלמ"ס', nameEn: 'Central Bureau of Statistics', icon: '📈' },
  { name: 'מאגר המידע הממשלתי', nameEn: 'Data.gov.il', icon: '🗄️' },
  { name: 'משרד החינוך', nameEn: 'Ministry of Education', icon: '🎓' },
  { name: 'משרד הבריאות', nameEn: 'Ministry of Health', icon: '🏥' },
  { name: 'משטרת ישראל', nameEn: 'Police Reports', icon: '🚓' },
  { name: 'Knesset OData API', nameEn: 'Knesset Open Data', icon: '🏛️' },
];

const TECH_STACK = [
  { name: 'React', role: 'Frontend UI', icon: '⚛️', color: '#61DAFB' },
  { name: 'FastAPI', role: 'Backend API', icon: '⚡', color: '#009688' },
  { name: 'Elasticsearch', role: 'Search & Aggregations', icon: '🔍', color: '#005571' },
  { name: 'PostgreSQL', role: 'Relational Database', icon: '🐘', color: '#336791' },
  { name: 'Python & NLP', role: 'Data Processing', icon: '🐍', color: '#FFD43B' },
];

const PIPELINE_STEPS = [
  { name: 'איסוף נתונים', desc: 'שאיבת נתונים גולמיים ממאגרי הכנסת (API), ממשל זמין ופרוטוקולים פתוחים.', icon: '📥' },
  { name: 'עיבוד וניתוח', desc: 'ניקוי הנתונים, זיהוי דוברים, וניתוח טקסטואלי מורכב לסיווג נושאים.', icon: '⚙️' },
  { name: 'הנגשה ויזואלית', desc: 'הצגת הנתונים באמצעות חיתוכים, לוחות בקרה וגרפים אינטראקטיביים לציבור הרחב.', icon: '📊' }
];

export default function About() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="about-wrapper" dir="rtl">
      
      <div 
        className="vision-background-wrapper"
        style={{ backgroundImage: "url('/banners/background1.jpg')" }}
      >
        <div className="vision-background-overlay"></div>

        {/* ── Hero Header ── */}
        <section className="about-hero transparent-section">
          <div className={`about-hero-content ${isVisible ? 'fade-in-up' : ''}`}>
            <p className="hero-eyebrow">על הפרויקט</p>
            <h1 className="about-title">KNESSET360°</h1>
            <p className="about-subtitle">
              פלטפורמת נתונים פתוחה למעקב, ניתוח והנגשת המידע הפרלמנטרי בישראל.
            </p>
          </div>
        </section>

        {/* ── Who We Are ── */}
        <section className="about-section transparent-section" >
          <div className="section-container layout-split">
            <div className="split-text">
              <h2 className="section-title">מי אנחנו?</h2>
              <div className="title-divider"></div>
              <p className="section-body">
                פרויקט <strong>Knesset360</strong> נולד מתוך צורך אזרחי בסיסי: להבין באמת מה קורה בכנסת. 
                אנו שתי סטודנטיות למדעי המחשב באוניברסיטת בן גוריון, וכחלק מפרויקט הגמר שלנו, החלטנו לקחת את הר המידע הגולמי — הצעות חוק, 
                הצבעות, דיוני ועדות ופרוטוקולים — ולהפוך אותו למידע צלול, שקוף ונגיש לכל אזרח.
              </p>
              <p className="section-body">
                אנו מאמינות שדמוקרטיה חזקה נשענת על ציבור מעורב, וציבור מעורב זקוק לגישה לנתונים אובייקטיביים, 
                ונקיים, המוצגים בצורה חזותית וברורה.
              </p>
            </div>
            <div className="split-visual">
               <div className="vision-card">
                 <span className="vision-quote">״מידע פתוח הוא החמצן של הדמוקרטיה.״</span>
               </div>
            </div>
          </div>
        </section>

        {/* ── Our Goals ── */}
        <section className="about-section transparent-section">
          <div className="section-container">
            <h2 className="section-title center-text">המטרות שלנו</h2>
            <div className="goals-grid">
              {GOALS.map((goal, idx) => (
                <div key={idx} className="goal-card">
                  <div className="goal-icon">{goal.icon}</div>
                  <h3 className="goal-title">{goal.title}</h3>
                  <p className="goal-desc">{goal.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div> 

      <section className="about-section dark-section">
        <div className="section-container">
          <h2 className="section-title center-text" style={{color: '#fff'}}>איך הנתונים שלנו עובדים?</h2>
          <p className="section-subtitle center-text" style={{color: '#38bdf8'}}>
            הנתונים שלנו מגיעים ישירות ממקורות רשמיים, ועוברים תהליך עיבוד קפדני.
          </p>
          
          <div className="pipeline-container">
            {PIPELINE_STEPS.map((step, idx) => (
              <React.Fragment key={idx}>
                <div key={idx} className="pipeline-step">
                    <div className="pipeline-icon">{step.icon}</div>
                        <h4 className="pipeline-title">{step.name}</h4>
                        <span className="pipeline-desc">{step.desc}</span>
                </div>
                {/* Add connector arrow between steps */}
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className="pipeline-connector">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section gray-section">
        <div className="section-container">
          <h2 className="section-title center-text">מקורות המידע שלנו</h2>
          <p className="section-subtitle center-text">
            אנו שואבים, מצליבים ומאמתים נתונים ממגוון מאגרים רשמיים ופתוחים.
          </p>
          <div className="sources-grid">
            {DATA_SOURCES.map((source, idx) => (
              <div key={idx} className="source-card">
                <div className="source-icon">{source.icon}</div>
                <div className="source-info">
                  <h4 className="source-name">{source.name}</h4>
                  <span className="source-name-en">{source.nameEn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="about-section dark-section">
        <div className="section-container">
          <p className="hero-eyebrow center-text" style={{color: '#38bdf8'}}>ארכיטקטורה</p>
          <h2 className="section-title center-text" style={{color: '#fff'}}>הטכנולוגיות שלנו</h2>
          
          <div className="tech-grid">
            {TECH_STACK.map((tech, idx) => (
              <div key={idx} className="tech-card">
                <div className="tech-icon">{tech.icon}</div>
                <div className="tech-info">
                  <h4 className="tech-name">{tech.name}</h4>
                  <span className="tech-role">{tech.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Source & GitHub ── */}
      <section className="about-section light-section cta-section">
        <div className="section-container center-text">
          <h2 className="section-title">קוד פתוח ושיתופי פעולה</h2>
          <p className="section-body mx-auto">
            פרויקט דרש מאמץ רב, אך אנו מאמינות שמידע ציבורי צריך להישאר בידי הציבור. <br></br>
            כל הקוד שמאחורי הפלטפורמה זמין בקוד פתוח. אתם מוזמנים לתרום, לשפר ולהשתמש בו.
          </p>
          <a href="https://github.com/your-repo-link" target="_blank" rel="noreferrer" className="github-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="github-icon">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            צפו בקוד המקור ב-GitHub
          </a>
        </div>
      </section>
      
      <section className="about-section dark-section cta-section">
        <div className="section-container center-text" >
          <h2 className="section-title" style={{color: '#fff'}}>תודות</h2>
          <p className="section-body mx-auto" style={{color: '#fff'}}>
            אנו מודות לאוניברסיטת בן גוריון ובפרט למנחה שלנו, פרופסור ניב גלבוע, על הנחיה צמודה ושוטפת לאורך שנת פרויקט הגמר.
          </p>
          
          <div className="thanks-images-container" style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
            <img src={uniLogo} alt="Ben Gurion University Logo" style={{ height: '70px', objectFit: 'contain' }} />
          </div>

          <div className="data-disclaimer-box" style={{ marginTop: '50px', padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#fff', fontWeight: '700', fontSize: '1.2rem' }}>⚠️ הבהרה לגבי מקורות המידע והנתונים</h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.7', textAlign: 'justify' }}>
              הנתונים והמדדים המוצגים בפלטפורמה זו נאספים, מתורגמים ומסוכמים באופן אוטומטי מתוך מאגרי מידע ממשלתיים ופרלמנטריים פתוחים (צד שלישי). הפרויקט משמש ככלי להנגשה ויזואלית וסטטיסטית בלבד, ואינו מפעיל תהליכי אימות, ביקורת או וולידציה עצמאיים על נכונותם או שלמותם של נתוני המקור הגולמיים. לפיכך, מנהלי הפרויקט אינם נושאים באחריות לכל שגיאה, השמטה, אי-דיוק או שינוי שבוצעו במאגרים הרשמיים המקוריים.
            </p>
          </div>
          
        </div>
      </section>
    </div>
  );
}