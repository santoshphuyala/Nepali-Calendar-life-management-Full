/**
 * ========================================
 * INDEXEDDB HANDLER v2.0 - FULLY FIXED
 * All Modules Database
 * Developer: Santosh Phuyal
 * ========================================
 */

console.log('✅ db.js loading...');

const DB_NAME = 'NepaliCalendarDB';
const DB_VERSION = 4; // ⚠️ INCREASED VERSION TO FORCE UPGRADE
let db;
let isDBReady = false;

/**
 * Initialize IndexedDB with proper error handling
 */
function initDB() {
    return new Promise((resolve, reject) => {
        console.log('🔄 Opening IndexedDB...');
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('❌ Database failed to open:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            isDBReady = true;
            console.log('✅ Database opened successfully');
            
            // Handle database errors
            db.onerror = (event) => {
                console.error('Database error:', event.target.error);
            };
            
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            console.log('🔄 Database upgrade in progress...');
            db = event.target.result;
            const oldVersion = event.oldVersion;
            const newVersion = event.newVersion;
            
            console.log(`📊 Upgrading from version ${oldVersion} to ${newVersion}`);

            // Helper function to create/recreate store
            const createStore = (storeName, keyPath, indexes) => {
                // Delete old store if exists
                if (db.objectStoreNames.contains(storeName)) {
                    console.log(`🗑️ Deleting old store: ${storeName}`);
                    db.deleteObjectStore(storeName);
                }
                
                // Create new store
                console.log(`✨ Creating store: ${storeName}`);
                const store = db.createObjectStore(storeName, { keyPath: keyPath || 'id', autoIncrement: true });
                
                // Create indexes
                if (indexes) {
                    indexes.forEach(index => {
                        console.log(`  ➕ Creating index: ${index.name}`);
                        store.createIndex(index.name, index.keyPath || index.name, index.options || { unique: false });
                    });
                }
                
                return store;
            };

            // Holidays
            createStore('holidays', 'id', [
                { name: 'date_bs' },
                { name: 'date_ad' },
                { name: 'type' }
            ]);

            // Income
            createStore('income', 'id', [
                { name: 'date_bs' },
                { name: 'category' },
                { name: 'currency' }
            ]);

            // Expenses
            createStore('expenses', 'id', [
                { name: 'date_bs' },
                { name: 'category' },
                { name: 'currency' }
            ]);

            // Notes
            createStore('notes', 'id', [
                { name: 'date_bs' },
                { name: 'isReminder' }
            ]);

            // Shopping
            createStore('shopping', 'id', [
                { name: 'status' },
                { name: 'category' }
            ]);

            // Budgets
            createStore('budgets', 'id', [
                { name: 'month' },
                { name: 'category' }
            ]);

            // Bills
            createStore('bills', 'id', [
                { name: 'dueDate' },
                { name: 'status' },
                { name: 'isRecurring' }
            ]);

            // Goals
            createStore('goals', 'id', [
                { name: 'status' },
                { name: 'targetDate' }
            ]);

            // Recurring
            createStore('recurring', 'id', [
                { name: 'type' },
                { name: 'frequency' },
                { name: 'isActive' }
            ]);

            // Insurance
            createStore('insurance', 'id', [
                { name: 'type' },
                { name: 'status' },
                { name: 'expiryDate' },
                { name: 'provider' }
            ]);

            // Vehicles
            createStore('vehicles', 'id', [
                { name: 'type' },
                { name: 'registrationNumber' }
            ]);

            // Vehicle Services
            createStore('vehicleServices', 'id', [
                { name: 'vehicleId' },
                { name: 'type' },
                { name: 'dueDate' }
            ]);

            // Subscriptions
            createStore('subscriptions', 'id', [
                { name: 'status' },
                { name: 'category' },
                { name: 'renewalDate' }
            ]);

            // Custom Types
            createStore('customTypes', 'id', [
                { name: 'name', options: { unique: true } }
            ]);

            // Custom Items
            createStore('customItems', 'id', [
                { name: 'typeId' }
            ]);

            console.log('✅ Database upgrade completed successfully');
        };

        request.onblocked = () => {
            console.warn('⚠️ Database upgrade blocked. Please close all other tabs with this app.');
            alert('Please close all other tabs with this app and reload this page.');
        };
    });
}

/**
 * Wait for database to be ready
 */
function waitForDB() {
    return new Promise((resolve, reject) => {
        if (isDBReady && db) {
            resolve(db);
            return;
        }
        
        const maxWait = 50; // 5 seconds
        let count = 0;
        
        const interval = setInterval(() => {
            if (isDBReady && db) {
                clearInterval(interval);
                resolve(db);
            } else if (count++ > maxWait) {
                clearInterval(interval);
                reject(new Error('Database timeout'));
            }
        }, 100);
    });
}

/**
 * Generic CRUD operations with error handling
 */
class DBManager {
    constructor(storeName) {
        this.storeName = storeName;
    }

    async ensureDB() {
        if (!isDBReady || !db) {
            await waitForDB();
        }
    }

    async add(data) {
        try {
            await this.ensureDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.add(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`Error adding to ${this.storeName}:`, error);
            throw error;
        }
    }

    async get(id) {
        try {
            await this.ensureDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`Error getting from ${this.storeName}:`, error);
            return null;
        }
    }

    async getAll() {
        try {
            await this.ensureDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`Error getting all from ${this.storeName}:`, error);
            return [];
        }
    }

    async update(data) {
        try {
            await this.ensureDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`Error updating ${this.storeName}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.ensureDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`Error deleting from ${this.storeName}:`, error);
            throw error;
        }
    }

    async getByIndex(indexName, value) {
        try {
            await this.ensureDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                
                // Check if index exists
                if (!store.indexNames.contains(indexName)) {
                    console.warn(`Index '${indexName}' not found in ${this.storeName}. Using fallback.`);
                    // Fallback: get all and filter manually
                    store.getAll().onsuccess = (event) => {
                        const all = event.target.result || [];
                        const filtered = all.filter(item => item[indexName] === value);
                        resolve(filtered);
                    };
                    return;
                }
                
                const index = store.index(indexName);
                const request = index.getAll(value);
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => {
                    console.error(`Index query error on ${this.storeName}.${indexName}:`, request.error);
                    resolve([]); // Return empty array instead of rejecting
                };
            });
        } catch (error) {
            console.error(`Error in getByIndex (${this.storeName}.${indexName}):`, error);
            return [];
        }
    }

    async clear() {
        try {
            await this.ensureDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`Error clearing ${this.storeName}:`, error);
            throw error;
        }
    }
}

// Initialize store managers
const holidayDB = new DBManager('holidays');
const incomeDB = new DBManager('income');
const expenseDB = new DBManager('expenses');
const noteDB = new DBManager('notes');
const shoppingDB = new DBManager('shopping');
const budgetDB = new DBManager('budgets');
const billDB = new DBManager('bills');
const goalDB = new DBManager('goals');
const recurringDB = new DBManager('recurring');
const insuranceDB = new DBManager('insurance');
const vehicleDB = new DBManager('vehicles');
const vehicleServiceDB = new DBManager('vehicleServices');
const subscriptionDB = new DBManager('subscriptions');
const customTypeDB = new DBManager('customTypes');
const customItemDB = new DBManager('customItems');

/**
 * Exchange rates
 */
let exchangeRates = {
    NPR: 1,
    USD: 0.0075,
    EUR: 0.0069,
    INR: 0.63
};

function loadExchangeRates() {
    const saved = localStorage.getItem('exchangeRates');
    if (saved) {
        try {
            exchangeRates = JSON.parse(saved);
        } catch (error) {
            console.error('Error loading exchange rates:', error);
        }
    }
}

function saveExchangeRates() {
    localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
}

function convertCurrency(amount, from, to) {
    if (from === to) return amount;
    const inNPR = amount / exchangeRates[from];
    return inNPR * exchangeRates[to];
}

/**
 * Get transactions for month - FIXED WITH SAFETY CHECKS
 */
async function getMonthlyTransactions(bsYear, bsMonth) {
    try {
        const allIncome = await incomeDB.getAll();
        const allExpenses = await expenseDB.getAll();

        const monthStr = `${bsYear}/${String(bsMonth).padStart(2, '0')}`;

        // CRITICAL FIX: Filter with null/undefined safety checks
        const income = allIncome.filter(item => {
            return item && 
                   item.date_bs && 
                   typeof item.date_bs === 'string' && 
                   item.date_bs.startsWith(monthStr);
        });
        
        const expenses = allExpenses.filter(item => {
            return item && 
                   item.date_bs && 
                   typeof item.date_bs === 'string' && 
                   item.date_bs.startsWith(monthStr);
        });

        return { income, expenses };
    } catch (error) {
        console.error('Error in getMonthlyTransactions:', error);
        return { income: [], expenses: [] };
    }
}

/**
 * Get monthly income with currency conversion
 */
async function getMonthlyIncome(bsYear, bsMonth, targetCurrency = 'NPR') {
    try {
        const { income } = await getMonthlyTransactions(bsYear, bsMonth);
        return income.reduce((sum, item) => {
            const amount = convertCurrency(parseFloat(item.amount) || 0, item.currency || 'NPR', targetCurrency);
            return sum + amount;
        }, 0);
    } catch (error) {
        console.error('Error in getMonthlyIncome:', error);
        return 0;
    }
}

/**
 * Get monthly expense with currency conversion
 */
async function getMonthlyExpense(bsYear, bsMonth, targetCurrency = 'NPR') {
    try {
        const { expenses } = await getMonthlyTransactions(bsYear, bsMonth);
        return expenses.reduce((sum, item) => {
            const amount = convertCurrency(parseFloat(item.amount) || 0, item.currency || 'NPR', targetCurrency);
            return sum + amount;
        }, 0);
    } catch (error) {
        console.error('Error in getMonthlyExpense:', error);
        return 0;
    }
}

/**
 * Get date data - WITH ERROR HANDLING
 */
async function getDateData(dateBs) {
    try {
        const holidays = await holidayDB.getByIndex('date_bs', dateBs);
        const income = await incomeDB.getByIndex('date_bs', dateBs);
        const expenses = await expenseDB.getByIndex('date_bs', dateBs);
        const notes = await noteDB.getByIndex('date_bs', dateBs);
        const bills = await billDB.getAll();
        const dueBills = bills.filter(bill => bill && bill.dueDate === dateBs && bill.status !== 'paid');

        return { 
            holidays: holidays || [], 
            income: income || [], 
            expenses: expenses || [], 
            notes: notes || [], 
            bills: dueBills || [] 
        };
    } catch (error) {
        console.error('Error in getDateData:', error);
        return { holidays: [], income: [], expenses: [], notes: [], bills: [] };
    }
}

/**
 * Get upcoming reminders
 */
async function getUpcomingReminders() {
    try {
        const allNotes = await noteDB.getAll();
        const today = getCurrentNepaliDate();
        const todayStr = formatBsDate(today.year, today.month, today.day);

        return allNotes.filter(note => {
            return note && note.isReminder && note.date_bs && note.date_bs >= todayStr;
        }).sort((a, b) => a.date_bs.localeCompare(b.date_bs)).slice(0, 5);
    } catch (error) {
        console.error('Error in getUpcomingReminders:', error);
        return [];
    }
}

/**
 * Get upcoming bills
 */
async function getUpcomingBills(days = 7) {
    try {
        const allBills = await billDB.getAll();
        const today = getCurrentNepaliDate();
        const todayStr = formatBsDate(today.year, today.month, today.day);

        return allBills.filter(bill => {
            if (!bill || bill.status === 'paid') return false;
            return bill.dueDate && bill.dueDate >= todayStr;
        }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
    } catch (error) {
        console.error('Error in getUpcomingBills:', error);
        return [];
    }
}

/**
 * Get budget for month
 */
async function getMonthBudget(bsYear, bsMonth) {
    try {
        const allBudgets = await budgetDB.getAll();
        const monthStr = `${bsYear}/${String(bsMonth).padStart(2, '0')}`;
        return allBudgets.filter(b => b && b.month === monthStr);
    } catch (error) {
        console.error('Error in getMonthBudget:', error);
        return [];
    }
}

/**
 * Reset Database - COMPLETE RESET
 */
async function resetDatabase() {
    return new Promise((resolve, reject) => {
        console.log('🗑️ Resetting database...');
        
        if (db) {
            db.close();
            db = null;
            isDBReady = false;
        }

        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        
        deleteRequest.onsuccess = () => {
            console.log('✅ Database deleted successfully');
            initDB().then(() => {
                console.log('✅ Database recreated');
                resolve();
            }).catch(reject);
        };
        
        deleteRequest.onerror = () => {
            console.error('❌ Failed to delete database');
            reject(deleteRequest.error);
        };
        
        deleteRequest.onblocked = () => {
            console.warn('⚠️ Database deletion blocked. Close all tabs.');
            alert('Please close all other tabs with this app and try again.');
            reject(new Error('Database deletion blocked'));
        };
    });
}

/**
 * Export all data
 */
async function exportAllData() {
    try {
        const data = {
            version: '2.0.0',
            exportDate: new Date().toISOString(),
            holidays: await holidayDB.getAll(),
            income: await incomeDB.getAll(),
            expenses: await expenseDB.getAll(),
            notes: await noteDB.getAll(),
            shopping: await shoppingDB.getAll(),
            budgets: await budgetDB.getAll(),
            bills: await billDB.getAll(),
            goals: await goalDB.getAll(),
            recurring: await recurringDB.getAll(),
            insurance: await insuranceDB.getAll(),
            vehicles: await vehicleDB.getAll(),
            vehicleServices: await vehicleServiceDB.getAll(),
            subscriptions: await subscriptionDB.getAll(),
            customTypes: await customTypeDB.getAll(),
            customItems: await customItemDB.getAll(),
            exchangeRates: exchangeRates
        };

        return JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error exporting data:', error);
        throw error;
    }
}

/**
 * Import all data
 */
async function importAllData(jsonData) {
    try {
        const data = JSON.parse(jsonData);

        await holidayDB.clear();
        await incomeDB.clear();
        await expenseDB.clear();
        await noteDB.clear();
        await shoppingDB.clear();
        await budgetDB.clear();
        await billDB.clear();
        await goalDB.clear();
        await recurringDB.clear();
        await insuranceDB.clear();
        await vehicleDB.clear();
        await vehicleServiceDB.clear();
        await subscriptionDB.clear();
        await customTypeDB.clear();
        await customItemDB.clear();

        for (const item of data.holidays || []) {
            delete item.id;
            await holidayDB.add(item);
        }
        for (const item of data.income || []) {
            delete item.id;
            await incomeDB.add(item);
        }
        for (const item of data.expenses || []) {
            delete item.id;
            await expenseDB.add(item);
        }
        for (const item of data.notes || []) {
            delete item.id;
            await noteDB.add(item);
        }
        for (const item of data.shopping || []) {
            delete item.id;
            await shoppingDB.add(item);
        }
        for (const item of data.budgets || []) {
            delete item.id;
            await budgetDB.add(item);
        }
        for (const item of data.bills || []) {
            delete item.id;
            await billDB.add(item);
        }
        for (const item of data.goals || []) {
            delete item.id;
            await goalDB.add(item);
        }
        for (const item of data.recurring || []) {
            delete item.id;
            await recurringDB.add(item);
        }
        for (const item of data.insurance || []) {
            delete item.id;
            await insuranceDB.add(item);
        }
        for (const item of data.vehicles || []) {
            delete item.id;
            await vehicleDB.add(item);
        }
        for (const item of data.vehicleServices || []) {
            delete item.id;
            await vehicleServiceDB.add(item);
        }
        for (const item of data.subscriptions || []) {
            delete item.id;
            await subscriptionDB.add(item);
        }
        for (const item of data.customTypes || []) {
            delete item.id;
            await customTypeDB.add(item);
        }
        for (const item of data.customItems || []) {
            delete item.id;
            await customItemDB.add(item);
        }

        if (data.exchangeRates) {
            exchangeRates = data.exchangeRates;
            saveExchangeRates();
        }

        return true;
    } catch (error) {
        console.error('Import error:', error);
        return false;
    }
}

/**
 * Add sample holidays
 */
async function addSampleHolidays() {
    const sampleHolidays = [
        { date_bs: '2082/01/01', date_ad: '2025-04-14', name: 'Naya Barsa (New Year)', type: 'public' },
        { date_bs: '2082/01/18', date_ad: '2025-05-01', name: 'Labour Day', type: 'public' },
        { date_bs: '2082/02/29', date_ad: '2025-06-13', name: 'Constitution Day', type: 'public' },
        { date_bs: '2082/04/15', date_ad: '2025-07-29', name: 'Janai Purnima', type: 'public' },
        { date_bs: '2082/05/03', date_ad: '2025-08-17', name: 'Krishna Janmashtami', type: 'public' },
        { date_bs: '2082/06/08', date_ad: '2025-09-24', name: 'Dashain', type: 'public' },
        { date_bs: '2082/07/15', date_ad: '2025-10-31', name: 'Tihar', type: 'public' },
        { date_bs: '2082/08/15', date_ad: '2025-11-30', name: 'Chhath', type: 'public' },
    ];

    for (const holiday of sampleHolidays) {
        try {
            await holidayDB.add(holiday);
        } catch (error) {
            console.warn('Holiday already exists or error:', error);
        }
    }
}

// Load exchange rates on init
loadExchangeRates();

console.log('✅ db.js loaded completely');