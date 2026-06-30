export const STATUS_COLORS = {
    104: '#3b82f6', // (Started - הונחה על שולחן הכנסת לדיון מוקדם)            = Blue
    106: '#2f00ff', // (Decide commitee - בוועדת הכנסת לקביעת הוועדה המטפלת)   = Dark Blue
    108: '#dbbc0b', // (Passed first step - הכנה לקריאה ראשונה)                 = Mustard
    109: '#bba218', // אושרה בוועדה לקריאה ראשונה
    111: '#706e61ff', // לדיון במליאה לקראת הקריאה הראשונה                     = Gray
    113: '#40c320', // (Passed second step - הכנה לקריאה שנייה ושלישית)         = Green
    114: '#39a01f', // לדיון במליאה לקראת קריאה שנייה-שלישית
    118: '#106b31', // (Passed - התקבלה בקריאה שלישית)                          = Forest Green
    122: '#640cca', // (Merged with another bill - מוזגה עם הצעת חוק אחרת)      = Purple
    124: '#b71adb', // (Moved to daily meeting - הוסבה להצעה לסדר היום)         = Pink
    141: '#d61777', // הונחה על שולחן הכנסת לקריאה ראשונה                      = Majenta
    130: '#f5740b', // הונחה על שולחן הכנסת לקריאה שנייה-שלישית                = Dark Orange
    150: '#0bbfbf', // (In Committee for the first step - במליאה לדיון מוקדם)   = Light Blue
    177: '#d62a2a', // (Stopped - נעצרה)                                         = Red
    
};

export const STATUS_DESC = {
    104: "הונחה על שולחן הכנסת לדיון מוקדם",
    106: "בוועדת הכנסת לקביעת הוועדה המטפלת",
    108: "הכנה לקריאה ראשונה",
    109: "אושרה בוועדה לקריאה ראשונה",
    111: "לדיון במליאה לקראת הקריאה הראשונה",
    113: "הכנה לקריאה שנייה ושלישית",
    114: "לדיון במליאה לקראת קריאה שנייה-שלישית",
    118: "התקבלה בקריאה שלישית",
    122: "מוזגה עם הצעת חוק אחרת",
    124: "הוסבה להצעה לסדר היום",
    130: "הונחה על שולחן הכנסת לקריאה שנייה-שלישית",
    141: "הונחה על שולחן הכנסת לקריאה ראשונה",
    150: "במליאה לדיון מוקדם",
    177: "נעצרה"
};

export const STATUS_COLORS_SHORT = {
  'עברו': '#327e51ff',    // muted green
  'בתהליך': '#446ea8ff', // muted blue
  'נעצרו': '#cb5858ff',   // muted red
  'אחר': '#7B8794'      // muted gray
};

export const getShortStatus = (sId, knessetNum) => {
    return sId === 118 ? 'עברו' :
        (sId === 177 || sId === 122 || sId === 124) ? 'נעצרו' : 
        (sId === 104 || sId === 106 || sId === 108 || sId === 109 ||sId === 111 ||
         sId === 113 || sId === 114 || sId === 130 || sId === 141 || sId === 150) ? knessetNum < 25 ? 'נעצרו' : 'בתהליך' : 'אחר';
};


export const BILL_TYPE_CONFIG = {
    53: {
        name: 'פרטית',
        totalSteps: 6,
        className: 'private',
        statusMap: [[104, 150], [108, 109, 106], 141, 113, [130, 114], 118] 
    },
    54: {
        name: 'ממשלתית',
        totalSteps: 4,
        className: 'gov',
        statusMap: [[104, 141], 113, 130, 118]
    },
    55: {
        name: 'ועדה',
        totalSteps: 5,
        className: 'committee',
        statusMap: [108, 302, 303, 304, 305]
    }
};

// הוסבה להצעת חוק אחרת, הוסרה מסדר יום, נעצרה
const REJECTIONS = [122, 124, 177];

// Quick helper to check if a status means the bill was rejected/removed
export const isRejectedStatus = (statusId) => {
    return REJECTIONS.includes(statusId);
};


// Helper to check if the current bill's status matches a specific step in the statusMap
export const getActiveStepIndex = (type, currentStatusId) => {
    const config = BILL_TYPE_CONFIG[type];
    if (!config || !config.statusMap || !currentStatusId) return 0;
    
    return config.statusMap.findIndex(step => {
        if (Array.isArray(step)) {
            return step.includes(Number(currentStatusId));
        }
        return Number(step) === Number(currentStatusId);
    });
};


export const POSTPONEMENT_COLORS = {
    2511: '#1F77B4',
    3012: '#FF7F0E',
    2507: '#2CA02C',
    41:   '#7F7F7F',
    2512: '#BCBD22',
    3013: '#17BECF',
    2509: '#E45756',
    2505: '#D62728',
    3112: '#9467BD',
    3087: '#59A14F',
    1065: '#AF7AA1',
    3010: '#4E79A7',
    2510: '#EDC948',
    3086: '#9C9C9C'
}

export const POSTPONEMENT_DESC = {
    2511:	'חזרת חה"כ המציע לפני דיון מוקדם',
    3012:	'חה"כ המציע התפטר',
    2507:	'לא התקבלה בקריאה ראשונה',
    41:     'כהונת חה"כ פסקה בשל חידוש חברות ח"כ אחר',
    2512:	'חזרת חה"כ המציע אחרי דיון מוקדם',
    3013:	'חה"כ המציע מונה לתפקיד בממשלה',
    2509:	'לא התקבלה בקריאה שנייה',
    2505:	'הסרה מסדר יום בדיון מוקדם',
    3112:	'לא הושג הרוב הדרוש',
    3087:	'הצעת החוק לא נדונה',
    2505:	'הסרה מסדר יום בדיון מוקדם',
    1065:	'חזרת הממשלה מהצעת החוק',
    3010:	'מונה למשרה המנויה בסעיף 7 לחוק-יסוד: הכנסת',
    2510:	'לא התקבלה בקריאה שלישית',
    3086:	'לא הושג הרוב הדרוש - הצעת חוק תקציבית'
};

