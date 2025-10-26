/**
 * ========================================
 * NEPALI CALENDAR BS ↔ AD CONVERSION
 * Developer: Santosh Phuyal
 * ========================================
 */
console.log('✅ conversion.js loaded');

// Days in each Nepali month for years 2082-2092
const BS_CALENDAR_DATA = {
    2082: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 365 days
    2083: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 366 days
    2084: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 365 days
    2085: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 365 days
    2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 365 days
    2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 366 days
    2088: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 365 days
    2089: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 365 days
    2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 366 days
    2091: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 365 days
    2092: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]  // 365 days
};

// Reference date: 2082/01/01 BS = 2025/04/14 AD
const BS_AD_REFERENCE = {
    bsYear: 2082,
    bsMonth: 1,
    bsDay: 1,
    adDate: new Date(2025, 3, 14) // April 14, 2025
};

// Nepali month names
const NEPALI_MONTHS = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

/**
 * Get total days in a BS year
 */
function getTotalDaysInBSYear(year) {
    if (!BS_CALENDAR_DATA[year]) return 365;
    return BS_CALENDAR_DATA[year].reduce((a, b) => a + b, 0);
}

/**
 * Get days in a specific BS month
 */
function getDaysInBSMonth(year, month) {
    if (!BS_CALENDAR_DATA[year]) return 30;
    return BS_CALENDAR_DATA[year][month - 1] || 30;
}

/**
 * Convert BS date to AD date
 */
function bsToAd(bsYear, bsMonth, bsDay) {
    let daysDiff = 0;
    
    // Calculate days from reference BS date
    if (bsYear > BS_AD_REFERENCE.bsYear) {
        // Add remaining days in reference year
        for (let m = BS_AD_REFERENCE.bsMonth; m <= 12; m++) {
            if (m === BS_AD_REFERENCE.bsMonth) {
                daysDiff += getDaysInBSMonth(BS_AD_REFERENCE.bsYear, m) - BS_AD_REFERENCE.bsDay;
            } else {
                daysDiff += getDaysInBSMonth(BS_AD_REFERENCE.bsYear, m);
            }
        }
        
        // Add days for years in between
        for (let y = BS_AD_REFERENCE.bsYear + 1; y < bsYear; y++) {
            daysDiff += getTotalDaysInBSYear(y);
        }
        
        // Add days in current year
        for (let m = 1; m < bsMonth; m++) {
            daysDiff += getDaysInBSMonth(bsYear, m);
        }
        daysDiff += bsDay;
        
    } else if (bsYear === BS_AD_REFERENCE.bsYear) {
        if (bsMonth > BS_AD_REFERENCE.bsMonth) {
            for (let m = BS_AD_REFERENCE.bsMonth; m < bsMonth; m++) {
                if (m === BS_AD_REFERENCE.bsMonth) {
                    daysDiff += getDaysInBSMonth(bsYear, m) - BS_AD_REFERENCE.bsDay;
                } else {
                    daysDiff += getDaysInBSMonth(bsYear, m);
                }
            }
            daysDiff += bsDay;
        } else if (bsMonth === BS_AD_REFERENCE.bsMonth) {
            daysDiff = bsDay - BS_AD_REFERENCE.bsDay;
        }
    }
    
    // Calculate AD date
    const adDate = new Date(BS_AD_REFERENCE.adDate);
    adDate.setDate(adDate.getDate() + daysDiff);
    
    return {
        year: adDate.getFullYear(),
        month: adDate.getMonth() + 1,
        day: adDate.getDate(),
        date: adDate
    };
}

/**
 * Convert AD date to BS date
 */
function adToBs(adYear, adMonth, adDay) {
    const targetDate = new Date(adYear, adMonth - 1, adDay);
    const refDate = new Date(BS_AD_REFERENCE.adDate);
    
    // Calculate difference in days
    const diffTime = targetDate - refDate;
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let bsYear = BS_AD_REFERENCE.bsYear;
    let bsMonth = BS_AD_REFERENCE.bsMonth;
    let bsDay = BS_AD_REFERENCE.bsDay;
    
    if (diffDays >= 0) {
        // Forward calculation
        bsDay += diffDays;
        
        while (bsDay > getDaysInBSMonth(bsYear, bsMonth)) {
            bsDay -= getDaysInBSMonth(bsYear, bsMonth);
            bsMonth++;
            
            if (bsMonth > 12) {
                bsMonth = 1;
                bsYear++;
            }
        }
    } else {
        // Backward calculation
        bsDay += diffDays;
        
        while (bsDay <= 0) {
            bsMonth--;
            if (bsMonth < 1) {
                bsMonth = 12;
                bsYear--;
            }
            bsDay += getDaysInBSMonth(bsYear, bsMonth);
        }
    }
    
    return {
        year: bsYear,
        month: bsMonth,
        day: bsDay
    };
}

/**
 * Get current Nepali date
 */
function getCurrentNepaliDate() {
    const today = new Date();
    return adToBs(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

/**
 * Format BS date as string
 */
function formatBsDate(bsYear, bsMonth, bsDay) {
    return `${bsYear}/${String(bsMonth).padStart(2, '0')}/${String(bsDay).padStart(2, '0')}`;
}

/**
 * Format AD date as string
 */
function formatAdDate(adYear, adMonth, adDay) {
    return `${adYear}-${String(adMonth).padStart(2, '0')}-${String(adDay).padStart(2, '0')}`;
}

/**
 * Get Nepali month name
 */
function getNepaliMonthName(month) {
    return NEPALI_MONTHS[month - 1] || '';
}

/**
 * Validate BS date
 */
function isValidBsDate(year, month, day) {
    if (!BS_CALENDAR_DATA[year]) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > getDaysInBSMonth(year, month)) return false;
    return true;
}