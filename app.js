/**
 * ========================================
 * NEPALI CALENDAR PWA - COMPLETE APP v2.0 FIXED
 * Developer: Santosh Phuyal
 * Email: xyz@gmail.com
 * Version: 2.0.0 - ERROR FREE
 * ========================================
 */

console.log('✅ app.js loading...');

// Global state
let currentBsYear, currentBsMonth, currentBsDay;
let currentView = 'calendar';
let currentCalendarView = 'month';
let selectedDate = null;
let defaultCurrency = 'NPR';

/**
 /**
 * ========================================
 * SHOW NOTE FORM
 * ========================================
 */
function showNoteForm(note = null) {
    const today = getCurrentNepaliDate();
    const todayBs = formatBsDate(today.year, today.month, today.day);
    
    const form = `
        <h2>${note ? '✏️ Edit Note' : '📝 Add Note'}</h2>
        <form id="noteForm" class="modal-form">
            <div class="form-group">
                <label>📅 Date (BS)</label>
                <input type="text" id="noteDateBs" value="${note?.date_bs || todayBs}" 
                       placeholder="YYYY/MM/DD" required>
            </div>
            
            <div class="form-group">
                <label>📝 Note Title</label>
                <input type="text" id="noteTitle" value="${note?.title || ''}" 
                       placeholder="Enter note title" required>
            </div>
            
            <div class="form-group">
                <label>📄 Description</label>
                <textarea id="noteDescription" rows="4" 
                          placeholder="Enter note details">${note?.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="noteIsReminder" ${note?.isReminder ? 'checked' : ''}>
                    🔔 Set as Reminder
                </label>
            </div>
            
            <div class="form-group">
                <label>🏷️ Category</label>
                <select id="noteCategory">
                    <option value="personal" ${note?.category === 'personal' ? 'selected' : ''}>Personal</option>
                    <option value="work" ${note?.category === 'work' ? 'selected' : ''}>Work</option>
                    <option value="finance" ${note?.category === 'finance' ? 'selected' : ''}>Finance</option>
                    <option value="health" ${note?.category === 'health' ? 'selected' : ''}>Health</option>
                    <option value="other" ${note?.category === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">💾 Save Note</button>
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;
    
    showModal(form);
    
    document.getElementById('noteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const noteData = {
            date_bs: document.getElementById('noteDateBs').value,
            title: document.getElementById('noteTitle').value,
            description: document.getElementById('noteDescription').value,
            isReminder: document.getElementById('noteIsReminder').checked,
            category: document.getElementById('noteCategory').value,
            createdAt: new Date().toISOString()
        };
        
        try {
            if (note?.id) {
                noteData.id = note.id;
                await noteDB.update(noteData);
                showNotification('✅ Note updated successfully!', 'success');
            } else {
                await noteDB.add(noteData);
                showNotification('✅ Note added successfully!', 'success');
            }
            
            closeModal();
            renderNotes(); // ✅ CORRECT function name
            renderCalendar(); // ✅ NO PARAMETERS
        } catch (error) {
            console.error('Error saving note:', error);
            showNotification('❌ Failed to save note', 'error');
        }
    });
}

/**
 * ========================================
 * SHOW HOLIDAY FORM
 * ========================================
 */
function showHolidayForm(holiday = null) {
    const today = getCurrentNepaliDate();
    const todayBs = formatBsDate(today.year, today.month, today.day);
    
    const form = `
        <h2>${holiday ? '✏️ Edit Holiday' : '🎉 Add Holiday'}</h2>
        <form id="holidayForm" class="modal-form">
            <div class="form-group">
                <label>📅 Date (BS)</label>
                <input type="text" id="holidayDateBs" value="${holiday?.date_bs || todayBs}" 
                       placeholder="YYYY/MM/DD" required>
            </div>
            
            <div class="form-group">
                <label>📅 Date (AD) - Optional</label>
                <input type="date" id="holidayDateAd" value="${holiday?.date_ad || ''}">
            </div>
            
            <div class="form-group">
                <label>🎉 Holiday Name</label>
                <input type="text" id="holidayName" value="${holiday?.name || ''}" 
                       placeholder="e.g., Dashain, Tihar" required>
            </div>
            
            <div class="form-group">
                <label>🏷️ Type</label>
                <select id="holidayType">
                    <option value="public" ${holiday?.type === 'public' ? 'selected' : ''}>Public Holiday</option>
                    <option value="festival" ${holiday?.type === 'festival' ? 'selected' : ''}>Festival</option>
                    <option value="cultural" ${holiday?.type === 'cultural' ? 'selected' : ''}>Cultural</option>
                    <option value="personal" ${holiday?.type === 'personal' ? 'selected' : ''}>Personal</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>📝 Description - Optional</label>
                <textarea id="holidayDescription" rows="3" 
                          placeholder="Enter details">${holiday?.description || ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">💾 Save Holiday</button>
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;
    
    showModal(form);
    
    document.getElementById('holidayForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const holidayData = {
            date_bs: document.getElementById('holidayDateBs').value,
            date_ad: document.getElementById('holidayDateAd').value || '',
            name: document.getElementById('holidayName').value,
            type: document.getElementById('holidayType').value,
            description: document.getElementById('holidayDescription').value
        };
        
        try {
            if (holiday?.id) {
                holidayData.id = holiday.id;
                await holidayDB.update(holidayData);
                showNotification('✅ Holiday updated successfully!', 'success');
            } else {
                await holidayDB.add(holidayData);
                showNotification('✅ Holiday added successfully!', 'success');
            }
            
            closeModal();
            renderHolidayList();
            renderCalendar(); // ✅ NO PARAMETERS
        } catch (error) {
            console.error('Error saving holiday:', error);
            showNotification('❌ Failed to save holiday', 'error');
        }
    });
}
/**
 * ========================================
 * SHOW RECURRING TRANSACTION FORM
 * ========================================
 */
function showRecurringForm(recurring = null) {
    const form = `
        <h2>${recurring ? '✏️ Edit Recurring Transaction' : '🔄 Add Recurring Transaction'}</h2>
        <form id="recurringForm" class="modal-form">
            <div class="form-group">
                <label>💸 Type</label>
                <select id="recurringType" required>
                    <option value="income" ${recurring?.type === 'income' ? 'selected' : ''}>Income</option>
                    <option value="expense" ${recurring?.type === 'expense' ? 'selected' : ''}>Expense</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>📝 Description</label>
                <input type="text" id="recurringDescription" value="${recurring?.description || ''}" 
                       placeholder="e.g., Monthly Salary, Rent" required>
            </div>
            
            <div class="form-group">
                <label>💰 Amount</label>
                <input type="number" id="recurringAmount" value="${recurring?.amount || ''}" 
                       placeholder="0.00" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label>💱 Currency</label>
                <select id="recurringCurrency">
                    <option value="NPR" ${recurring?.currency === 'NPR' ? 'selected' : ''}>NPR (रू)</option>
                    <option value="USD" ${recurring?.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                    <option value="EUR" ${recurring?.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                    <option value="INR" ${recurring?.currency === 'INR' ? 'selected' : ''}>INR (₹)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>🏷️ Category</label>
                <select id="recurringCategory">
                    <optgroup label="Income">
                        <option value="salary" ${recurring?.category === 'salary' ? 'selected' : ''}>Salary</option>
                        <option value="freelance" ${recurring?.category === 'freelance' ? 'selected' : ''}>Freelance</option>
                        <option value="investment" ${recurring?.category === 'investment' ? 'selected' : ''}>Investment</option>
                    </optgroup>
                    <optgroup label="Expense">
                        <option value="rent" ${recurring?.category === 'rent' ? 'selected' : ''}>Rent</option>
                        <option value="utilities" ${recurring?.category === 'utilities' ? 'selected' : ''}>Utilities</option>
                        <option value="food" ${recurring?.category === 'food' ? 'selected' : ''}>Food</option>
                        <option value="transport" ${recurring?.category === 'transport' ? 'selected' : ''}>Transport</option>
                        <option value="subscription" ${recurring?.category === 'subscription' ? 'selected' : ''}>Subscription</option>
                        <option value="other" ${recurring?.category === 'other' ? 'selected' : ''}>Other</option>
                    </optgroup>
                </select>
            </div>
            
            <div class="form-group">
                <label>🔄 Frequency</label>
                <select id="recurringFrequency" required>
                    <option value="daily" ${recurring?.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${recurring?.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${recurring?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="yearly" ${recurring?.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>📅 Start Date (BS)</label>
                <input type="text" id="recurringStartDate" value="${recurring?.startDate || ''}" 
                       placeholder="YYYY/MM/DD" required>
            </div>
            
            <div class="form-group">
                <label>📅 End Date (BS) - Optional</label>
                <input type="text" id="recurringEndDate" value="${recurring?.endDate || ''}" 
                       placeholder="YYYY/MM/DD">
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="recurringIsActive" ${recurring?.isActive !== false ? 'checked' : ''}>
                    ✅ Active
                </label>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">💾 Save Recurring</button>
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;
    
    showModal(form);
    
    document.getElementById('recurringForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recurringData = {
            type: document.getElementById('recurringType').value,
            description: document.getElementById('recurringDescription').value,
            amount: parseFloat(document.getElementById('recurringAmount').value),
            currency: document.getElementById('recurringCurrency').value,
            category: document.getElementById('recurringCategory').value,
            frequency: document.getElementById('recurringFrequency').value,
            startDate: document.getElementById('recurringStartDate').value,
            endDate: document.getElementById('recurringEndDate').value || null,
            isActive: document.getElementById('recurringIsActive').checked,
            createdAt: new Date().toISOString()
        };
        
        try {
            if (recurring?.id) {
                recurringData.id = recurring.id;
                await recurringDB.update(recurringData);
                showNotification('✅ Recurring transaction updated!', 'success');
            } else {
                await recurringDB.add(recurringData);
                showNotification('✅ Recurring transaction added!', 'success');
            }
            
            closeModal();
            renderRecurringList();
            renderTrackerList();
        } catch (error) {
            console.error('Error saving recurring transaction:', error);
            showNotification('❌ Failed to save recurring transaction', 'error');
        }
    });
}
/**
 * Render Notes List
 */
async function renderNotes() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;
    
    const notes = await noteDB.getAll();
    
    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-state">📝 No notes yet. Add your first note!</div>';
        return;
    }
    
    notesList.innerHTML = notes.sort((a, b) => b.date_bs.localeCompare(a.date_bs)).map(note => `
        <div class="note-item ${note.isReminder ? 'reminder' : ''}">
            <div class="note-header">
                <h4>${note.isReminder ? '🔔' : '📝'} ${note.title}</h4>
                <span class="note-date">${note.date_bs}</span>
            </div>
            <p class="note-description">${note.description || ''}</p>
            <div class="note-meta">
                <span class="category-badge">${note.category}</span>
            </div>
            <div class="note-actions">
                <button class="btn-icon" onclick="showNoteForm(${JSON.stringify(note).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-icon" onclick="deleteNote(${note.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

/**
 * Render Holiday List
 */
async function renderHolidayList() {
    const holidayList = document.getElementById('holidayList');
    if (!holidayList) return;
    
    const holidays = await holidayDB.getAll();
    
    if (holidays.length === 0) {
        holidayList.innerHTML = '<div class="empty-state">🎉 No holidays added yet.</div>';
        return;
    }
    
    holidayList.innerHTML = holidays.sort((a, b) => a.date_bs.localeCompare(b.date_bs)).map(holiday => `
        <div class="holiday-item ${holiday.type}">
            <div class="holiday-info">
                <strong>${holiday.name}</strong>
                <div class="holiday-dates">
                    <span>BS: ${holiday.date_bs}</span>
                    ${holiday.date_ad ? `<span>AD: ${holiday.date_ad}</span>` : ''}
                </div>
                <span class="holiday-type">${holiday.type}</span>
            </div>
            <div class="holiday-actions">
                <button class="btn-icon" onclick="showHolidayForm(${JSON.stringify(holiday).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-icon" onclick="deleteHoliday(${holiday.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

/**
 * Render Recurring List
 */
async function renderRecurringList() {
    const recurringList = document.getElementById('recurringList');
    if (!recurringList) return;
    
    const recurring = await recurringDB.getAll();
    const active = recurring.filter(r => r.isActive);
    
    if (active.length === 0) {
        recurringList.innerHTML = '<div class="empty-state">🔄 No recurring transactions.</div>';
        return;
    }
    
    recurringList.innerHTML = active.map(r => `
        <div class="recurring-item ${r.type}">
            <div class="recurring-info">
                <strong>${r.description}</strong>
                <div class="recurring-details">
                    <span>${r.currency} ${r.amount.toFixed(2)}</span>
                    <span>${r.frequency}</span>
                    <span>${r.category}</span>
                </div>
            </div>
            <div class="recurring-actions">
                <button class="btn-icon" onclick="showRecurringForm(${JSON.stringify(r).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-icon" onclick="deleteRecurring(${r.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

/**
 * Delete Functions
 */
async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    await noteDB.delete(id);
    showNotification('✅ Note deleted', 'success');
    renderNotes();
    renderCalendar(currentYear, currentMonth);
}

async function deleteHoliday(id) {
    if (!confirm('Delete this holiday?')) return;
    await holidayDB.delete(id);
    showNotification('✅ Holiday deleted', 'success');
    renderHolidayList();
    renderCalendar(currentYear, currentMonth);
}

async function deleteRecurring(id) {
    if (!confirm('Delete this recurring transaction?')) return;
    await recurringDB.delete(id);
    showNotification('✅ Recurring transaction deleted', 'success');
    renderRecurringList();
}


/**
 * ========================================
 * NOTIFICATION SYSTEM
 * ========================================
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style it
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
/**
 * ========================================
 * APP INITIALIZATION
 * ========================================
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Initializing Nepali Calendar App v2.0...');
        
        await initDB();
        console.log('✅ Database initialized');
        
        const holidays = await holidayDB.getAll();
        if (holidays.length === 0) {
            await addSampleHolidays();
            console.log('✅ Sample holidays added');
        }

        defaultCurrency = localStorage.getItem('defaultCurrency') || 'NPR';
        const currencySelect = document.getElementById('defaultCurrency');
        if (currencySelect) {
            currencySelect.value = defaultCurrency;
        }

        const today = getCurrentNepaliDate();
        currentBsYear = today.year;
        currentBsMonth = today.month;
        currentBsDay = today.day;

        console.log(`📅 Current BS Date: ${currentBsYear}/${currentBsMonth}/${currentBsDay}`);

        initializeHeader();
        initializeYearMonthSelectors();
        initializeEventListeners();
        
        currentCalendarView = 'month';
        
        document.querySelectorAll('.view-switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.calendarView === 'month');
        });
        document.querySelectorAll('.calendar-view-container').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById('monthView').classList.add('active');
        
        console.log('🎨 Rendering calendar...');
        renderCalendar(); // ✅ RENDER ONLY ONCE
        console.log('✅ Calendar rendered');
        
        // ❌ REMOVE THESE - They trigger additional renders
        // await updateMonthlySummary();
        // await updateAllCharts(currentBsYear, currentBsMonth);
        
        // ✅ USE THESE INSTEAD (async without await to prevent blocking)
        updateMonthlySummary().then(() => console.log('✅ Summary updated'));
        updateAllCharts(currentBsYear, currentBsMonth).then(() => console.log('✅ Charts updated'));

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.checked = true;
            }
        }

        await processRecurringTransactions();

        setTimeout(async () => {
            await checkUpcomingAlerts();
        }, 2000);

        console.log('✅ App initialized successfully!');

    } catch (error) {
        console.error('❌ App initialization error:', error);
        console.error('Error details:', error.stack);
        alert('Error initializing app: ' + error.message + '\n\nPlease make sure you are running this on a local server (http://localhost), not by opening the file directly.');
    }
});

/**
 * ========================================
 * HEADER INITIALIZATION
 * ========================================
 */
function initializeHeader() {
    const today = getCurrentNepaliDate();
    const adToday = new Date();
    
    document.getElementById('headerBSDate').textContent = 
        `BS: ${formatBsDate(today.year, today.month, today.day)} (${getNepaliMonthName(today.month)})`;
    
    document.getElementById('headerADDate').textContent = 
        `AD: ${adToday.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
}

/**
 * ========================================
 * YEAR/MONTH SELECTORS
 * ========================================
 */
function initializeYearMonthSelectors() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');

    yearSelect.innerHTML = '';
    monthSelect.innerHTML = '';

    for (let year = 2082; year <= 2092; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentBsYear) option.selected = true;
        yearSelect.appendChild(option);
    }

    NEPALI_MONTHS.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        if (index + 1 === currentBsMonth) option.selected = true;
        monthSelect.appendChild(option);
    });
}

/**
 * ========================================
 * EVENT LISTENERS
 * ========================================
 */
function initializeEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });

    // View switcher
    document.querySelectorAll('.view-switch-btn').forEach(btn => {
        btn.addEventListener('click', () => switchCalendarView(btn.dataset.calendarView));
    });

    // Calendar controls
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    document.getElementById('todayBtn').addEventListener('click', goToToday);
    document.getElementById('yearSelect').addEventListener('change', onYearMonthChange);
    document.getElementById('monthSelect').addEventListener('change', onYearMonthChange);

    // Tracker
    document.getElementById('addIncomeBtn').addEventListener('click', () => showIncomeExpenseForm('income'));
    document.getElementById('addExpenseBtn').addEventListener('click', () => showIncomeExpenseForm('expense'));
    document.getElementById('addRecurringBtn').addEventListener('click', () => showRecurringForm());
    document.getElementById('exportTrackerBtn').addEventListener('click', exportTransactions);
    document.getElementById('trackerFilter').addEventListener('change', renderTrackerList);
    document.getElementById('currencyFilter').addEventListener('change', renderTrackerList);

    // Budget
    document.getElementById('addBudgetBtn').addEventListener('click', () => showBudgetForm());

    // Bills
    document.getElementById('addBillBtn').addEventListener('click', () => showBillForm());
    document.querySelectorAll('#billsView .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#billsView .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderBillsList();
        });
    });

    // Goals
    document.getElementById('addGoalBtn').addEventListener('click', () => showGoalForm());

    // Insurance
    document.getElementById('addInsuranceBtn').addEventListener('click', () => showInsuranceForm());
    document.querySelectorAll('#insuranceView .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#insuranceView .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderInsuranceList();
        });
    });

    // Vehicle
    document.getElementById('addVehicleBtn').addEventListener('click', () => showVehicleForm());

    // Subscription
    document.getElementById('addSubscriptionBtn').addEventListener('click', () => showSubscriptionForm());
    document.querySelectorAll('#subscriptionView .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#subscriptionView .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderSubscriptionList();
        });
    });

    // Custom
    document.getElementById('addCustomTypeBtn').addEventListener('click', () => showCustomTypeForm());

    // Shopping
    document.getElementById('addShoppingBtn').addEventListener('click', () => showShoppingForm());
    document.querySelectorAll('#shoppingView .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#shoppingView .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderShoppingList();
        });
    });

    // Notes
    document.getElementById('addNoteBtn').addEventListener('click', () => showNoteForm());

    // Settings
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    document.getElementById('defaultCurrency').addEventListener('change', updateDefaultCurrency);
    document.getElementById('updateRatesBtn').addEventListener('click', updateExchangeRates);
    document.getElementById('calculateTaxBtn').addEventListener('click', calculateNepalTax);
    document.getElementById('addHolidayBtn').addEventListener('click', () => showHolidayForm());
    document.getElementById('importHolidayBtn').addEventListener('click', () => {
        document.getElementById('holidayFileInput').click();
    });
    document.getElementById('holidayFileInput').addEventListener('change', importHolidaysCSV);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('dataFileInput').click();
    });
    document.getElementById('dataFileInput').addEventListener('change', importData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);

    // FAB
    const fab = document.getElementById('fab');
    const fabButton = fab.querySelector('.fab-button');
    fabButton.addEventListener('click', () => fab.classList.toggle('active'));

    document.addEventListener('click', (e) => {
        if (!fab.contains(e.target)) {
            fab.classList.remove('active');
        }
    });

    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            fab.classList.remove('active');
            handleFabAction(action);
        });
    });

    // Modal
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });

    // Drawer
    document.querySelector('.drawer-close').addEventListener('click', closeDrawer);
}

/**
 * ========================================
 * VIEW SWITCHING
 * ========================================
 */
function switchView(viewName) {
    currentView = viewName;
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    switch(viewName) {
        case 'calendar':
            renderCalendar();
            updateMonthlySummary();
            updateAllCharts(currentBsYear, currentBsMonth);
            break;
        case 'tracker':
            renderTrackerList();
            renderRecurringList();
            break;
        case 'budget':
            updateBudgetOverview(currentBsYear, currentBsMonth);
            renderBudgetCategories(currentBsYear, currentBsMonth);
            renderBudgetChart(currentBsYear, currentBsMonth);
            break;
        case 'bills':
            renderBillsList();
            renderUpcomingBillsList();
            break;
        case 'goals':
            renderGoalsGrid();
            break;
        case 'insurance':
            renderInsuranceList();
            renderInsuranceStats();
            break;
        case 'vehicle':
            renderVehicleGrid();
            break;
        case 'subscription':
            renderSubscriptionList();
            renderSubscriptionSummary();
            break;
        case 'custom':
            renderCustomTypes();
            break;
        case 'shopping':
            renderShoppingList();
            break;
        case 'notes':
            renderNotesList();
            renderUpcomingReminders();
            break;
        case 'settings':
            renderHolidayList();
            break;
    }
}

/**
 * ========================================
 * CALENDAR VIEW SWITCHING
 * ========================================
 */
function switchCalendarView(viewType) {
    currentCalendarView = viewType;

    document.querySelectorAll('.view-switch-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.calendarView === viewType);
    });

    document.querySelectorAll('.calendar-view-container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(`${viewType}View`).classList.add('active');

    switch(viewType) {
        case 'month':
            renderCalendar();
            break;
        case 'week':
            renderWeekView();
            break;
        case 'day':
            renderDayView();
            break;
    }
}

/**
 * ========================================
 * CALENDAR RENDERING - FIXED (SYNCHRONOUS)
 * ========================================
 */
function renderCalendar() {
    try {
        if (currentCalendarView !== 'month') return;

        const grid = document.getElementById('calendarGrid');
        if (!grid) {
            console.error('❌ Calendar grid not found!');
            return;
        }

        // Clear old cells (keep first 7 headers)
        while (grid.children.length > 7) {
            grid.removeChild(grid.lastChild);
        }

        const daysInMonth = getDaysInBSMonth(currentBsYear, currentBsMonth);
        const firstDayAd = bsToAd(currentBsYear, currentBsMonth, 1);
        const firstDayOfWeek = firstDayAd.date.getDay();

        // Add empty cells
        for (let i = 0; i < firstDayOfWeek; i++) {
            const cell = createCalendarCell(null, true);
            grid.appendChild(cell);
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = createCalendarCell(day, false);
            grid.appendChild(cell);
        }

        console.log('✅ Calendar rendered successfully');

    } catch (error) {
        console.error('❌ Calendar render error:', error);
    }
}

/**
 * Create calendar cell - NON-ASYNC (FIXED)
 */
function createCalendarCell(day, isEmpty) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';

    if (isEmpty) {
        cell.classList.add('other-month');
        return cell;
    }

    const bsDateStr = formatBsDate(currentBsYear, currentBsMonth, day);
    const adDate = bsToAd(currentBsYear, currentBsMonth, day);

    // Check if today
    const today = getCurrentNepaliDate();
    if (currentBsYear === today.year && currentBsMonth === today.month && day === today.day) {
        cell.classList.add('today');
    }

    // Date numbers
    const dateNumber = document.createElement('div');
    dateNumber.className = 'date-number';
    dateNumber.textContent = day;
    cell.appendChild(dateNumber);

    const dateAd = document.createElement('div');
    dateAd.className = 'date-ad';
    dateAd.textContent = `${adDate.month}/${adDate.day}`;
    cell.appendChild(dateAd);

    // Load async data separately
    loadCellData(cell, bsDateStr);

    // Click event
    cell.addEventListener('click', () => {
        const adDateStr = formatAdDate(adDate.year, adDate.month, adDate.day);
        openDateDrawer(bsDateStr, adDateStr);
    });

    return cell;
}

/**
 * Load cell data asynchronously (SEPARATE FUNCTION)
 */
async function loadCellData(cell, bsDateStr) {
    try {
        const holidays = await holidayDB.getByIndex('date_bs', bsDateStr);
        if (holidays && holidays.length > 0) {
            const holidayLabel = document.createElement('div');
            holidayLabel.className = 'holiday-label';
            holidayLabel.textContent = holidays[0].name;
            cell.appendChild(holidayLabel);
        }

        const dateData = await getDateData(bsDateStr);
        const hasEvents = dateData.income.length > 0 || dateData.expenses.length > 0 || 
                          dateData.notes.length > 0 || dateData.bills.length > 0;

        if (hasEvents) {
            const indicator = document.createElement('div');
            indicator.className = 'event-indicator';
            
            if (dateData.income.length > 0) {
                const dot = document.createElement('div');
                dot.className = 'event-dot income';
                indicator.appendChild(dot);
            }
            if (dateData.expenses.length > 0) {
                const dot = document.createElement('div');
                dot.className = 'event-dot expense';
                indicator.appendChild(dot);
            }
            if (dateData.notes.length > 0) {
                const dot = document.createElement('div');
                dot.className = 'event-dot note';
                indicator.appendChild(dot);
            }
            if (dateData.bills.length > 0) {
                const dot = document.createElement('div');
                dot.className = 'event-dot shopping';
                indicator.appendChild(dot);
            }
            
            cell.appendChild(indicator);
        }
    } catch (error) {
        console.error('Error loading cell data:', error);
    }
}

/**
 * ========================================
 * WEEK VIEW
 * ========================================
 */
async function renderWeekView() {
    const grid = document.getElementById('weekGrid');
    grid.innerHTML = '';

    const today = getCurrentNepaliDate();
    const currentDate = bsToAd(currentBsYear, currentBsMonth, currentBsDay || today.day);
    const dayOfWeek = currentDate.date.getDay();

    const weekStart = new Date(currentDate.date);
    weekStart.setDate(weekStart.getDate() - dayOfWeek);

    grid.appendChild(createWeekTimeSlot(''));
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const bs = adToBs(date.getFullYear(), date.getMonth() + 1, date.getDate());
        
        const header = document.createElement('div');
        header.className = 'week-day-header';
        header.innerHTML = `
            <div class="date-number">${bs.day}</div>
            <div class="day-name">${getNepaliMonthName(bs.month).substring(0, 3)}</div>
        `;
        grid.appendChild(header);
    }

    const events = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const bs = adToBs(date.getFullYear(), date.getMonth() + 1, date.getDate());
        const bsDateStr = formatBsDate(bs.year, bs.month, bs.day);
        const dateData = await getDateData(bsDateStr);
        events.push(dateData);
    }

    grid.appendChild(createWeekTimeSlot('Events'));
    for (let i = 0; i < 7; i++) {
        const cell = document.createElement('div');
        cell.className = 'week-cell';
        
        const dateData = events[i];
        let html = '';
        
        dateData.income.forEach(item => {
            html += `<div class="week-event income">💵 ${item.category}: Rs. ${parseFloat(item.amount).toLocaleString()}</div>`;
        });
        dateData.expenses.forEach(item => {
            html += `<div class="week-event expense">💸 ${item.category}: Rs. ${parseFloat(item.amount).toLocaleString()}</div>`;
        });
        dateData.bills.forEach(item => {
            html += `<div class="week-event bill">💳 ${item.name}: Rs. ${parseFloat(item.amount).toLocaleString()}</div>`;
        });
        dateData.notes.forEach(item => {
            html += `<div class="week-event">📝 ${item.content.substring(0, 20)}...</div>`;
        });
        
        cell.innerHTML = html || '<span style="color: var(--text-secondary); font-size: 0.85rem;">No events</span>';
        grid.appendChild(cell);
    }
}

function createWeekTimeSlot(label) {
    const slot = document.createElement('div');
    slot.className = 'week-time-slot';
    slot.textContent = label;
    return slot;
}

/**
 * ========================================
 * DAY VIEW
 * ========================================
 */
async function renderDayView() {
    const container = document.getElementById('dayDetail');
    const today = getCurrentNepaliDate();
    const day = currentBsDay || today.day;
    
    const bsDateStr = formatBsDate(currentBsYear, currentBsMonth, day);
    const adDate = bsToAd(currentBsYear, currentBsMonth, day);
    const dateData = await getDateData(bsDateStr);

    let html = `
        <div class="day-detail-header">
            <div class="day-detail-date">${day}</div>
            <div class="day-detail-month">${getNepaliMonthName(currentBsMonth)} ${currentBsYear}</div>
            <div class="day-detail-month">${adDate.month}/${adDate.day}/${adDate.year} AD</div>
        </div>
    `;

    if (dateData.holidays.length > 0) {
        html += `<div class="day-events-section"><h4 style="color: var(--danger-color);">🎉 Holidays</h4>`;
        dateData.holidays.forEach(holiday => {
            html += `<div class="day-event-item">${holiday.name}</div>`;
        });
        html += `</div>`;
    }

    if (dateData.income.length > 0) {
        html += `<div class="day-events-section"><h4 style="color: var(--secondary-color);">💵 Income</h4>`;
        dateData.income.forEach(item => {
            html += `
                <div class="day-event-item" style="border-left-color: var(--secondary-color);">
                    <strong>${item.category}</strong><br>
                    ${item.description || ''}<br>
                    <span style="font-size: 1.2rem; color: var(--secondary-color);">Rs. ${parseFloat(item.amount).toLocaleString()}</span>
                </div>`;
        });
        html += `</div>`;
    }

    if (dateData.expenses.length > 0) {
        html += `<div class="day-events-section"><h4 style="color: var(--danger-color);">💸 Expenses</h4>`;
        dateData.expenses.forEach(item => {
            html += `
                <div class="day-event-item" style="border-left-color: var(--danger-color);">
                    <strong>${item.category}</strong><br>
                    ${item.description || ''}<br>
                    <span style="font-size: 1.2rem; color: var(--danger-color);">Rs. ${parseFloat(item.amount).toLocaleString()}</span>
                </div>`;
        });
        html += `</div>`;
    }

    if (dateData.bills.length > 0) {
        html += `<div class="day-events-section"><h4 style="color: var(--warning-color);">💳 Bills Due</h4>`;
        dateData.bills.forEach(item => {
            html += `
                <div class="day-event-item" style="border-left-color: var(--warning-color);">
                    <strong>${item.name}</strong><br>
                    <span style="font-size: 1.2rem; color: var(--warning-color);">Rs. ${parseFloat(item.amount).toLocaleString()}</span>
                </div>`;
        });
        html += `</div>`;
    }

    if (dateData.notes.length > 0) {
        html += `<div class="day-events-section"><h4>📝 Notes & Reminders</h4>`;
        dateData.notes.forEach(item => {
            html += `
                <div class="day-event-item">
                    ${item.content}
                    ${item.isReminder ? '<br><span style="color: var(--warning-color);">🔔 Reminder</span>' : ''}
                </div>`;
        });
        html += `</div>`;
    }

    if (dateData.income.length === 0 && dateData.expenses.length === 0 && 
        dateData.bills.length === 0 && dateData.notes.length === 0 && dateData.holidays.length === 0) {
        html += `<div class="day-events-section">
            <p style="text-align: center; color: var(--text-secondary);">No events for this day</p>
        </div>`;
    }

    container.innerHTML = html;
}

/**
 * ========================================
 * CALENDAR NAVIGATION
 * ========================================
 */
function changeMonth(delta) {
    currentBsMonth += delta;

    if (currentBsMonth > 12) {
        currentBsMonth = 1;
        currentBsYear++;
    } else if (currentBsMonth < 1) {
        currentBsMonth = 12;
        currentBsYear--;
    }

    if (currentBsYear < 2082) {
        currentBsYear = 2082;
        currentBsMonth = 1;
    } else if (currentBsYear > 2092) {
        currentBsYear = 2092;
        currentBsMonth = 12;
    }

    document.getElementById('yearSelect').value = currentBsYear;
    document.getElementById('monthSelect').value = currentBsMonth;

    if (currentCalendarView === 'month') {
        renderCalendar();
    } else if (currentCalendarView === 'week') {
        renderWeekView();
    }
    
    updateMonthlySummary();
    updateAllCharts(currentBsYear, currentBsMonth);
}

function goToToday() {
    const today = getCurrentNepaliDate();
    currentBsYear = today.year;
    currentBsMonth = today.month;
    currentBsDay = today.day;

    document.getElementById('yearSelect').value = currentBsYear;
    document.getElementById('monthSelect').value = currentBsMonth;

    if (currentCalendarView === 'month') {
        renderCalendar();
    } else if (currentCalendarView === 'week') {
        renderWeekView();
    } else if (currentCalendarView === 'day') {
        renderDayView();
    }

    updateMonthlySummary();
    updateAllCharts(currentBsYear, currentBsMonth);
}

function onYearMonthChange() {
    currentBsYear = parseInt(document.getElementById('yearSelect').value);
    currentBsMonth = parseInt(document.getElementById('monthSelect').value);
    
    if (currentCalendarView === 'month') {
        renderCalendar();
    } else if (currentCalendarView === 'week') {
        renderWeekView();
    }
    
    updateMonthlySummary();
    updateAllCharts(currentBsYear, currentBsMonth);
}

/**
 * ========================================
 * MONTHLY SUMMARY
 * ========================================
 */
async function updateMonthlySummary() {
    try {
        const income = await getMonthlyIncome(currentBsYear, currentBsMonth);
        const expense = await getMonthlyExpense(currentBsYear, currentBsMonth);
        const savings = income - expense;

        const budgets = await getMonthBudget(currentBsYear, currentBsMonth);
        const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
        const budgetRemaining = totalBudget - expense;

        document.getElementById('monthlyIncome').textContent = `Rs. ${income.toLocaleString()}`;
        document.getElementById('monthlyExpense').textContent = `Rs. ${expense.toLocaleString()}`;
        document.getElementById('monthlySavings').textContent = `Rs. ${savings.toLocaleString()}`;
        document.getElementById('budgetRemaining').textContent = `Rs. ${budgetRemaining.toLocaleString()}`;
    } catch (error) {
        console.error('Error updating summary:', error);
    }
}

/**
 * ========================================
 * DATE DRAWER
 * ========================================
 */
async function openDateDrawer(bsDate, adDate) {
    try {
        selectedDate = bsDate;
        const drawer = document.getElementById('dateDrawer');
        const title = document.getElementById('drawerTitle');
        const body = document.getElementById('drawerBody');

        title.textContent = `${bsDate} (${adDate})`;

        const data = await getDateData(bsDate);

        const insurances = await insuranceDB.getAll();
        const insuranceRenewals = insurances.filter(ins => ins.expiryDate === bsDate);

        const services = await vehicleServiceDB.getAll();
        const vehicleServices = services.filter(svc => svc.date === bsDate || svc.nextDue === bsDate);

        const subscriptions = await subscriptionDB.getAll();
        const subRenewals = subscriptions.filter(sub => sub.renewalDate === bsDate);

        let html = `
            <div class="drawer-section">
                <h4>💰 Transactions</h4>
                <button class="btn-primary" onclick="showIncomeExpenseForm('income', '${bsDate}')">+ Income</button>
                <button class="btn-danger" onclick="showIncomeExpenseForm('expense', '${bsDate}')">+ Expense</button>
                <div style="margin-top: 1rem;">
        `;

        if (data.income.length > 0 || data.expenses.length > 0) {
            [...data.income.map(i => ({...i, type: 'income'})), ...data.expenses.map(e => ({...e, type: 'expense'}))].forEach(item => {
                const currencySymbol = getCurrencySymbol(item.currency || 'NPR');
                html += `
                    <div class="tracker-item ${item.type}" style="margin-bottom: 0.5rem;">
                        <div class="item-details">
                            <div class="item-category">${item.category}</div>
                            <div class="item-description">${item.description || ''}</div>
                        </div>
                        <div class="item-amount ${item.type}">${currencySymbol} ${parseFloat(item.amount).toLocaleString()}</div>
                    </div>
                `;
            });
        } else {
            html += '<p style="color: var(--text-secondary);">No transactions</p>';
        }

        html += `</div></div>`;

        if (data.bills.length > 0) {
            html += `<div class="drawer-section"><h4>💳 Bills Due</h4>`;
            data.bills.forEach(bill => {
                html += `
                    <div class="bill-item" style="margin-bottom: 0.5rem;">
                        <div class="bill-info">
                            <div class="bill-name">${bill.name}</div>
                        </div>
                        <div class="bill-amount">Rs. ${parseFloat(bill.amount).toLocaleString()}</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (insuranceRenewals.length > 0) {
            html += `<div class="drawer-section"><h4>🛡️ Insurance Renewals</h4>`;
            insuranceRenewals.forEach(ins => {
                html += `<p>• ${ins.name} (${ins.provider})</p>`;
            });
            html += '</div>';
        }

        if (subRenewals.length > 0) {
            html += `<div class="drawer-section"><h4>📺 Subscription Renewals</h4>`;
            subRenewals.forEach(sub => {
                html += `<p>• ${sub.name} - Rs. ${parseFloat(sub.cost).toLocaleString()}</p>`;
            });
            html += '</div>';
        }

        if (vehicleServices.length > 0) {
            html += `<div class="drawer-section"><h4>🚗 Vehicle Services</h4>`;
            vehicleServices.forEach(svc => {
                html += `<p>• ${svc.type} - Rs. ${parseFloat(svc.cost).toLocaleString()}</p>`;
            });
            html += '</div>';
        }

        html += `
            <div class="drawer-section">
                <h4>📝 Notes</h4>
                <button class="btn-primary" onclick="showNoteForm('${bsDate}')">+ Note</button>
                <div style="margin-top: 1rem;">
        `;

        if (data.notes.length > 0) {
            data.notes.forEach(note => {
                html += `
                    <div class="note-item ${note.isReminder ? 'reminder' : ''}" style="margin-bottom: 0.5rem;">
                        <div class="item-details">
                            <div class="item-description">${note.content}</div>
                            ${note.isReminder ? '<span style="color: var(--warning-color); font-size: 0.85rem;">🔔 Reminder</span>' : ''}
                        </div>
                        <button class="icon-btn" onclick="deleteNote(${note.id})">🗑️</button>
                    </div>
                `;
            });
        } else {
            html += '<p style="color: var(--text-secondary);">No notes</p>';
        }

        html += '</div></div>';

        body.innerHTML = html;
        drawer.classList.add('active');
    } catch (error) {
        console.error('Error opening drawer:', error);
    }
}

function closeDrawer() {
    document.getElementById('dateDrawer').classList.remove('active');
}

/**
 * ========================================
 * INCOME/EXPENSE FORMS
 * ========================================
 */
function showIncomeExpenseForm(type, date = null) {
    const today = getCurrentNepaliDate();
    const defaultDate = date || formatBsDate(today.year, today.month, today.day);

    const html = `
        <h2>Add ${type === 'income' ? 'Income' : 'Expense'}</h2>
        <form id="transactionForm">
            <div class="form-group">
                <label>Date (BS)</label>
                <input type="text" id="transDate" value="${defaultDate}" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="transCategory" required>
                    ${type === 'income' ? `
                        <option>Salary</option>
                        <option>Business</option>
                        <option>Investment</option>
                        <option>Freelance</option>
                        <option>Other</option>
                    ` : `
                        <option>Food</option>
                        <option>Transport</option>
                        <option>Shopping</option>
                        <option>Bills</option>
                        <option>Healthcare</option>
                        <option>Entertainment</option>
                        <option>Education</option>
                        <option>Other</option>
                    `}
                </select>
            </div>
            <div class="form-group">
                <label>Currency</label>
                <select id="transCurrency">
                    <option value="NPR" ${defaultCurrency === 'NPR' ? 'selected' : ''}>NPR (रू)</option>
                    <option value="USD" ${defaultCurrency === 'USD' ? 'selected' : ''}>USD ($)</option>
                    <option value="EUR" ${defaultCurrency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                    <option value="INR" ${defaultCurrency === 'INR' ? 'selected' : ''}>INR (₹)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="transAmount" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="transDescription"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('transactionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            date_bs: document.getElementById('transDate').value,
            category: document.getElementById('transCategory').value,
            currency: document.getElementById('transCurrency').value,
            amount: parseFloat(document.getElementById('transAmount').value),
            description: document.getElementById('transDescription').value,
            createdAt: new Date().toISOString()
        };

        try {
            if (type === 'income') {
                await incomeDB.add(data);
            } else {
                await expenseDB.add(data);
            }

            closeModal();
            renderCalendar();
            updateMonthlySummary();
            updateAllCharts(currentBsYear, currentBsMonth);
            if (currentView === 'tracker') renderTrackerList();
            if (currentView === 'budget') {
                await updateBudgetOverview(currentBsYear, currentBsMonth);
                await renderBudgetCategories(currentBsYear, currentBsMonth);
                await renderBudgetChart(currentBsYear, currentBsMonth);
            }
            alert(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error saving transaction. Please try again.');
        }
    });
}

function getCurrencySymbol(currency) {
    const symbols = {
        NPR: 'रू',
        USD: '$',
        EUR: '€',
        INR: '₹'
    };
    return symbols[currency] || currency;
}

// Continue with remaining functions...
// Due to character limit, I'll provide the rest in separate files

/**
 * ========================================
 * PLACEHOLDER FUNCTIONS (Refer to other module files)
 * These are called from other modules
 * ========================================
 */

/**
 * ========================================
 * RECURRING TRANSACTIONS
 * ========================================
 */
function showRecurringForm(recurring = null) {
    const today = getCurrentNepaliDate();
    const defaultDate = formatBsDate(today.year, today.month, today.day);

    const html = `
        <h2>${recurring ? 'Edit' : 'Add'} Recurring Transaction</h2>
        <form id="recurringForm">
            <div class="form-group">
                <label>Type</label>
                <select id="recurringType" required>
                    <option value="income" ${recurring && recurring.type === 'income' ? 'selected' : ''}>Income</option>
                    <option value="expense" ${recurring && recurring.type === 'expense' ? 'selected' : ''}>Expense</option>
                </select>
            </div>
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="recurringCategory" value="${recurring ? recurring.category : ''}" required>
            </div>
            <div class="form-group">
                <label>Amount (NPR)</label>
                <input type="number" id="recurringAmount" value="${recurring ? recurring.amount : ''}" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" id="recurringDescription" value="${recurring ? recurring.description : ''}">
            </div>
            <div class="form-group">
                <label>Frequency</label>
                <select id="recurringFrequency" required>
                    <option value="daily" ${recurring && recurring.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${recurring && recurring.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${recurring && recurring.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="yearly" ${recurring && recurring.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                </select>
            </div>
            <div class="form-group">
                <label>Start Date (BS)</label>
                <input type="text" id="recurringStartDate" value="${recurring ? recurring.startDate : defaultDate}" required>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="recurringActive" ${!recurring || recurring.isActive ? 'checked' : ''}>
                    <span>Active</span>
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('recurringForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            type: document.getElementById('recurringType').value,
            category: document.getElementById('recurringCategory').value,
            amount: parseFloat(document.getElementById('recurringAmount').value),
            description: document.getElementById('recurringDescription').value,
            frequency: document.getElementById('recurringFrequency').value,
            startDate: document.getElementById('recurringStartDate').value,
            isActive: document.getElementById('recurringActive').checked,
            lastProcessed: recurring ? recurring.lastProcessed : null,
            createdAt: recurring ? recurring.createdAt : new Date().toISOString()
        };

        try {
            if (recurring) {
                data.id = recurring.id;
                await recurringDB.update(data);
            } else {
                await recurringDB.add(data);
            }

            closeModal();
            if (currentView === 'tracker') renderRecurringList();
            alert('Recurring transaction saved!');
        } catch (error) {
            console.error('Error saving recurring transaction:', error);
            alert('Error saving recurring transaction.');
        }
    });
}

async function renderRecurringList() {
    const container = document.getElementById('recurringList');
    const recurring = await recurringDB.getAll();

    if (recurring.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No recurring transactions</p>';
        return;
    }

    container.innerHTML = recurring.map(item => `
        <div class="tracker-item ${item.type}" style="margin-bottom: 0.5rem;">
            <div class="item-details">
                <div class="item-category">${item.category} <span class="recurring-badge">🔄 ${item.frequency}</span></div>
                <div class="item-description">${item.description || ''}</div>
                <div class="item-date">Started: ${item.startDate} | ${item.isActive ? '✅ Active' : '⏸ Inactive'}</div>
            </div>
            <div class="item-amount ${item.type}">Rs. ${parseFloat(item.amount).toLocaleString()}</div>
            <div class="item-actions">
                <button class="icon-btn" onclick='showRecurringForm(${JSON.stringify(item).replace(/'/g, "&apos;")})'>✏️</button>
                <button class="icon-btn" onclick="deleteRecurring(${item.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function deleteRecurring(id) {
    if (!confirm('Delete this recurring transaction?')) return;
    try {
        await recurringDB.delete(id);
        renderRecurringList();
    } catch (error) {
        console.error('Error deleting recurring:', error);
    }
}

async function processRecurringTransactions() {
    const recurring = await recurringDB.getAll();
    const today = getCurrentNepaliDate();
    const todayStr = formatBsDate(today.year, today.month, today.day);

    for (const item of recurring) {
        if (!item.isActive) continue;

        const lastProcessed = item.lastProcessed || item.startDate;
        const shouldProcess = shouldProcessRecurring(lastProcessed, item.frequency, todayStr);

        if (shouldProcess) {
            const transData = {
                date_bs: todayStr,
                category: item.category,
                amount: item.amount,
                currency: 'NPR',
                description: `${item.description} (Recurring)`,
                source: 'recurring',
                createdAt: new Date().toISOString()
            };

            if (item.type === 'income') {
                await incomeDB.add(transData);
            } else {
                await expenseDB.add(transData);
            }

            item.lastProcessed = todayStr;
            await recurringDB.update(item);
        }
    }
}

function shouldProcessRecurring(lastDate, frequency, currentDate) {
    const [lastY, lastM, lastD] = lastDate.split('/').map(Number);
    const [currY, currM, currD] = currentDate.split('/').map(Number);

    switch(frequency) {
        case 'daily':
            return currentDate !== lastDate;
        case 'weekly':
            const lastAd = bsToAd(lastY, lastM, lastD);
            const currAd = bsToAd(currY, currM, currD);
            const daysDiff = Math.floor((currAd.date - lastAd.date) / (1000 * 60 * 60 * 24));
            return daysDiff >= 7;
        case 'monthly':
            return currM !== lastM || currY !== lastY;
        case 'yearly':
            return currY !== lastY;
        default:
            return false;
    }
}

/**
 * ========================================
 * TRACKER LIST
 * ========================================
 */
async function renderTrackerList() {
    const list = document.getElementById('trackerList');
    const filter = document.getElementById('trackerFilter').value;
    const currencyFilter = document.getElementById('currencyFilter').value;

    const allIncome = await incomeDB.getAll();
    const allExpenses = await expenseDB.getAll();

    let items = [];
    if (filter === 'all' || filter === 'income') {
        items = items.concat(allIncome.map(item => ({ ...item, type: 'income' })));
    }
    if (filter === 'all' || filter === 'expense') {
        items = items.concat(allExpenses.map(item => ({ ...item, type: 'expense' })));
    }

    // Filter by currency
    if (currencyFilter !== 'NPR') {
        items = items.filter(item => item.currency === currencyFilter);
    }

    // Sort by date (newest first)
    items.sort((a, b) => b.date_bs.localeCompare(a.date_bs));

    if (items.length === 0) {
        list.innerHTML = '<div class="loading">No transactions found</div>';
        return;
    }

    list.innerHTML = items.map(item => {
        const currencySymbol = getCurrencySymbol(item.currency || 'NPR');
        const amountInNPR = convertCurrency(parseFloat(item.amount), item.currency || 'NPR', 'NPR');
        
        return `
            <div class="tracker-item ${item.type}">
                <div class="item-details">
                    <div class="item-category">${item.category}</div>
                    <div class="item-description">${item.description || ''}</div>
                    <div class="item-date">${item.date_bs}</div>
                </div>
                <div>
                    <div class="item-amount ${item.type}">
                        ${currencySymbol} ${parseFloat(item.amount).toLocaleString()}
                        ${item.currency !== 'NPR' ? `<span class="currency-badge">≈ रू ${amountInNPR.toLocaleString()}</span>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="icon-btn" onclick="deleteTransaction('${item.type}', ${item.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

async function deleteTransaction(type, id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        if (type === 'income') {
            await incomeDB.delete(id);
        } else {
            await expenseDB.delete(id);
        }

        renderTrackerList();
        renderCalendar();
        updateMonthlySummary();
        updateAllCharts(currentBsYear, currentBsMonth);
        if (currentView === 'budget') {
            await updateBudgetOverview(currentBsYear, currentBsMonth);
            await renderBudgetCategories(currentBsYear, currentBsMonth);
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction.');
    }
}

async function exportTransactions() {
    const allIncome = await incomeDB.getAll();
    const allExpenses = await expenseDB.getAll();

    const csv = [
        ['Type', 'Date (BS)', 'Category', 'Description', 'Amount', 'Currency'],
        ...allIncome.map(item => ['Income', item.date_bs, item.category, item.description, item.amount, item.currency || 'NPR']),
        ...allExpenses.map(item => ['Expense', item.date_bs, item.category, item.description, item.amount, item.currency || 'NPR'])
    ].map(row => row.join(',')).join('\n');

    downloadFile(csv, 'transactions.csv', 'text/csv');
}

/**
 * ========================================
 * SHOPPING LIST
 * ========================================
 */
function showShoppingForm(item = null) {
    const html = `
        <h2>${item ? 'Edit' : 'Add'} Shopping Item</h2>
        <form id="shoppingForm">
            <div class="form-group">
                <label>Item Name</label>
                <input type="text" id="itemName" value="${item ? item.name : ''}" required>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="text" id="itemQuantity" value="${item ? item.quantity : ''}">
            </div>
            <div class="form-group">
                <label>Expected Price (Rs.)</label>
                <input type="number" id="itemPrice" step="0.01" value="${item ? item.expectedPrice : ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('shoppingForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('itemName').value,
            quantity: document.getElementById('itemQuantity').value,
            expectedPrice: parseFloat(document.getElementById('itemPrice').value) || 0,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        try {
            if (item) {
                data.id = item.id;
                await shoppingDB.update(data);
            } else {
                await shoppingDB.add(data);
            }

            closeModal();
            renderShoppingList();
            alert('Shopping item saved!');
        } catch (error) {
            console.error('Error saving shopping item:', error);
            alert('Error saving item.');
        }
    });
}

async function renderShoppingList() {
    const list = document.getElementById('shoppingList');
    const activeFilter = document.querySelector('#shoppingView .filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'pending';

    const allItems = await shoppingDB.getAll();
    let items = allItems;

    if (filter !== 'all') {
        items = allItems.filter(item => item.status === filter);
    }

    if (items.length === 0) {
        list.innerHTML = '<div class="loading">No items found</div>';
        return;
    }

    list.innerHTML = items.map(item => `
        <div class="shopping-item ${item.status}">
            <input type="checkbox" class="checkbox-custom" ${item.status === 'purchased' ? 'checked' : ''} 
                   onchange="toggleShoppingStatus(${item.id}, this.checked)">
            <div class="item-details" style="flex: 1;">
                <div class="item-description">${item.name}</div>
                <div class="item-date">Qty: ${item.quantity || 'N/A'} | Expected: Rs. ${item.expectedPrice.toLocaleString()}</div>
                ${item.actualPrice ? `<div class="item-date">Actual: Rs. ${item.actualPrice.toLocaleString()}</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="icon-btn" onclick='showShoppingForm(${JSON.stringify(item).replace(/'/g, "&apos;")})'>✏️</button>
                <button class="icon-btn" onclick="deleteShoppingItem(${item.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function toggleShoppingStatus(id, isPurchased) {
    const item = await shoppingDB.get(id);

    if (isPurchased) {
        const actualPrice = prompt('Enter actual purchase price (Rs.):', item.expectedPrice);
        if (actualPrice === null) {
            renderShoppingList();
            return;
        }

        item.status = 'purchased';
        item.actualPrice = parseFloat(actualPrice) || item.expectedPrice;
        item.purchasedAt = new Date().toISOString();

        const today = getCurrentNepaliDate();
        await expenseDB.add({
            date_bs: formatBsDate(today.year, today.month, today.day),
            category: 'Shopping',
            amount: item.actualPrice,
            currency: 'NPR',
            description: `Purchased: ${item.name}`,
            source: 'shopping_list',
            createdAt: new Date().toISOString()
        });

    } else {
        item.status = 'pending';
        delete item.actualPrice;
        delete item.purchasedAt;
    }

    await shoppingDB.update(item);
    renderShoppingList();
    updateMonthlySummary();
    renderCalendar();
}

async function deleteShoppingItem(id) {
    if (!confirm('Delete this item?')) return;

    try {
        await shoppingDB.delete(id);
        renderShoppingList();
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}


/**
 * ========================================
 * NOTES & REMINDERS
 * ========================================
 */
function showNoteForm(date = null) {
    const today = getCurrentNepaliDate();
    const defaultDate = date || formatBsDate(today.year, today.month, today.day);

    const html = `
        <h2>Add Note</h2>
        <form id="noteForm">
            <div class="form-group">
                <label>Date (BS)</label>
                <input type="text" id="noteDate" value="${defaultDate}" required>
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea id="noteContent" required></textarea>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="noteIsReminder">
                    <span>Set as Reminder</span>
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('noteForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            date_bs: document.getElementById('noteDate').value,
            content: document.getElementById('noteContent').value,
            isReminder: document.getElementById('noteIsReminder').checked,
            createdAt: new Date().toISOString()
        };

        try {
            await noteDB.add(data);
            closeModal();
            renderCalendar();
            if (currentView === 'notes') {
                renderNotesList();
                renderUpcomingReminders();
            }
            alert('Note saved!');
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Error saving note.');
        }
    });
}

async function renderNotesList() {
    const list = document.getElementById('notesList');
    const allNotes = await noteDB.getAll();
    
    const notes = allNotes.sort((a, b) => b.date_bs.localeCompare(a.date_bs));

    if (notes.length === 0) {
        list.innerHTML = '<div class="loading">No notes found</div>';
        return;
    }

    list.innerHTML = notes.map(note => `
        <div class="note-item ${note.isReminder ? 'reminder' : ''}">
            <div class="item-details">
                <div class="item-description">${note.content}</div>
                <div class="item-date">${note.date_bs} ${note.isReminder ? '🔔' : ''}</div>
            </div>
            <div class="item-actions">
                <button class="icon-btn" onclick="deleteNote(${note.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function renderUpcomingReminders() {
    const container = document.getElementById('remindersList');
    const reminders = await getUpcomingReminders();

    if (reminders.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No upcoming reminders</p>';
        return;
    }

    container.innerHTML = reminders.map(note => `
        <div class="note-item reminder" style="margin-bottom: 0.5rem;">
            <div class="item-details">
                <div class="item-description">${note.content}</div>
                <div class="item-date">${note.date_bs}</div>
            </div>
        </div>
    `).join('');
}

async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;

    try {
        await noteDB.delete(id);
        renderNotesList();
        renderUpcomingReminders();
        renderCalendar();
        closeDrawer();
    } catch (error) {
        console.error('Error deleting note:', error);
    }
}


/**
 * ========================================
 * HOLIDAYS
 * ========================================
 */
function showHolidayForm(holiday = null) {
    const html = `
        <h2>${holiday ? 'Edit' : 'Add'} Holiday</h2>
        <form id="holidayForm">
            <div class="form-group">
                <label>Date (BS)</label>
                <input type="text" id="holidayDateBs" value="${holiday ? holiday.date_bs : ''}" required>
            </div>
            <div class="form-group">
                <label>Date (AD)</label>
                <input type="date" id="holidayDateAd" value="${holiday ? holiday.date_ad : ''}" required>
            </div>
            <div class="form-group">
                <label>Holiday Name</label>
                <input type="text" id="holidayName" value="${holiday ? holiday.name : ''}" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="holidayType">
                    <option value="public" ${holiday && holiday.type === 'public' ? 'selected' : ''}>Public</option>
                    <option value="festival" ${holiday && holiday.type === 'festival' ? 'selected' : ''}>Festival</option>
                    <option value="other" ${holiday && holiday.type === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('holidayForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            date_bs: document.getElementById('holidayDateBs').value,
            date_ad: document.getElementById('holidayDateAd').value,
            name: document.getElementById('holidayName').value,
            type: document.getElementById('holidayType').value
        };

        try {
            if (holiday) {
                data.id = holiday.id;
                await holidayDB.update(data);
            } else {
                await holidayDB.add(data);
            }

            closeModal();
            renderHolidayList();
            renderCalendar();
            alert('Holiday saved!');
        } catch (error) {
            console.error('Error saving holiday:', error);
            alert('Error saving holiday.');
        }
    });
}

async function renderHolidayList() {
    const list = document.getElementById('holidayList');
    const holidays = await holidayDB.getAll();

    if (holidays.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary);">No holidays</p>';
        return;
    }

    list.innerHTML = holidays.sort((a, b) => a.date_bs.localeCompare(b.date_bs)).map(holiday => `
        <div class="holiday-item">
            <div>
                <strong>${holiday.name}</strong><br>
                <small>${holiday.date_bs} (${holiday.date_ad})</small>
            </div>
            <div>
                <button class="icon-btn" onclick='showHolidayForm(${JSON.stringify(holiday).replace(/'/g, "&apos;")})'>✏️</button>
                <button class="icon-btn" onclick="deleteHoliday(${holiday.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function deleteHoliday(id) {
    if (!confirm('Delete this holiday?')) return;

    try {
        await holidayDB.delete(id);
        renderHolidayList();
        renderCalendar();
    } catch (error) {
        console.error('Error deleting holiday:', error);
    }
}

async function importHolidaysCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            
            const dataLines = lines[0].includes('date_bs') ? lines.slice(1) : lines;

            let count = 0;
            for (const line of dataLines) {
                const [date_bs, date_ad, name, type] = line.split(',').map(s => s.trim());
                if (date_bs && date_ad && name) {
                    await holidayDB.add({
                        date_bs,
                        date_ad,
                        name,
                        type: type || 'public'
                    });
                    count++;
                }
            }

            alert(`${count} holidays imported successfully!`);
            renderHolidayList();
            renderCalendar();
        } catch (error) {
            console.error('CSV import error:', error);
            alert('Error importing CSV. Please check the format.');
        }
    };

    reader.readAsText(file);
    event.target.value = '';
}

// Settings
function toggleDarkMode(e) {
    if (e.target.checked) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
}

function updateDefaultCurrency(e) {
    defaultCurrency = e.target.value;
    localStorage.setItem('defaultCurrency', defaultCurrency);
    alert('Currency updated!');
}

function updateExchangeRates() {
    exchangeRates = {
        NPR: 1,
        USD: 0.0075,
        EUR: 0.0069,
        INR: 0.63
    };
    saveExchangeRates();
    alert('Exchange rates updated!');
}

// Helper function to format date for filename
function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Data Management
async function exportData() {
    const json = await exportAllData();
    const filename = `backup-${getFormattedDate()}.json`;
    downloadFile(json, filename, 'application/json');
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            const result = await importDataWithDuplicateCheck(importedData);
            
            alert(`Import completed!\nAdded: ${result.added}\nSkipped (duplicates): ${result.skipped}`);
            
            if (result.added > 0) {
                location.reload();
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Import failed! Please check the file format.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Import with duplicate checking
async function importDataWithDuplicateCheck(importedData) {
    let added = 0;
    let skipped = 0;

    // Helper function to check if item exists
    async function addIfNotExists(db, items, idField = 'id') {
        if (!items || !Array.isArray(items)) return { added: 0, skipped: 0 };
        
        let localAdded = 0;
        let localSkipped = 0;
        
        for (const item of items) {
            try {
                // Check if item already exists
                const existing = await db.get(item[idField]);
                
                if (!existing) {
                    await db.add(item);
                    localAdded++;
                } else {
                    localSkipped++;
                }
            } catch (error) {
                console.error(`Error adding item:`, error);
                localSkipped++;
            }
        }
        
        return { added: localAdded, skipped: localSkipped };
    }

    // Import each database
    const databases = [
        { db: holidayDB, data: importedData.holidays },
        { db: incomeDB, data: importedData.income },
        { db: expenseDB, data: importedData.expenses },
        { db: noteDB, data: importedData.notes },
        { db: shoppingDB, data: importedData.shopping },
        { db: budgetDB, data: importedData.budgets },
        { db: billDB, data: importedData.bills },
        { db: goalDB, data: importedData.goals },
        { db: recurringDB, data: importedData.recurring },
        { db: insuranceDB, data: importedData.insurance },
        { db: vehicleDB, data: importedData.vehicles },
        { db: vehicleServiceDB, data: importedData.vehicleServices },
        { db: subscriptionDB, data: importedData.subscriptions },
        { db: customTypeDB, data: importedData.customTypes },
        { db: customItemDB, data: importedData.customItems }
    ];

    for (const { db, data } of databases) {
        const result = await addIfNotExists(db, data);
        added += result.added;
        skipped += result.skipped;
    }

    return { added, skipped };
}

// Alternative: Import with user choice
async function importDataWithOptions(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importMode = confirm(
                'Click OK to MERGE (skip duplicates)\nClick Cancel to REPLACE all data'
            );
            
            if (importMode) {
                // Merge mode - skip duplicates
                const importedData = JSON.parse(e.target.result);
                const result = await importDataWithDuplicateCheck(importedData);
                alert(`Merge completed!\nAdded: ${result.added}\nSkipped: ${result.skipped}`);
                if (result.added > 0) location.reload();
            } else {
                // Replace mode - original behavior
                const success = await importAllData(e.target.result);
                if (success) {
                    alert('Data replaced successfully!');
                    location.reload();
                } else {
                    alert('Import failed!');
                }
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Import failed! Please check the file format.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

async function clearAllData() {
    if (!confirm('Delete ALL data?')) return;
    if (!confirm('Really sure? This cannot be undone!')) return;
    
    try {
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
        
        alert('All data cleared successfully!');
        location.reload();
    } catch (error) {
        console.error('Clear data error:', error);
        alert('Error clearing data. Please try again.');
    }
}
/**
 * ========================================
 * ALERTS & NOTIFICATIONS
 * ========================================
 */
async function checkUpcomingAlerts() {
    const today = getCurrentNepaliDate();
    const todayStr = formatBsDate(today.year, today.month, today.day);
    const in7Days = addDaysToBsDate(todayStr, 7);

    let alerts = [];

    // Check insurance expiring soon
    const insurances = await insuranceDB.getAll();
    const expiringInsurance = insurances.filter(ins => 
        ins.status === 'active' && 
        ins.expiryDate >= todayStr && 
        ins.expiryDate <= in7Days
    );

    expiringInsurance.forEach(ins => {
        alerts.push(`🛡️ Insurance "${ins.name}" expiring on ${ins.expiryDate}`);
    });

    // Check bills due soon
    const bills = await billDB.getAll();
    const dueBills = bills.filter(bill =>
        bill.status !== 'paid' &&
        bill.dueDate >= todayStr &&
        bill.dueDate <= in7Days
    );

    dueBills.forEach(bill => {
        alerts.push(`💳 Bill "${bill.name}" due on ${bill.dueDate}`);
    });

    // Check subscriptions renewing soon
    const subscriptions = await subscriptionDB.getAll();
    const renewingSubs = subscriptions.filter(sub =>
        sub.status === 'active' &&
        sub.renewalDate >= todayStr &&
        sub.renewalDate <= in7Days
    );

    renewingSubs.forEach(sub => {
        alerts.push(`📺 Subscription "${sub.name}" renewing on ${sub.renewalDate}`);
    });

    // Log alerts
    if (alerts.length > 0) {
        console.log('🔔 Upcoming Alerts:', alerts);
    }

    return alerts;
}

function addDaysToBsDate(bsDateStr, days) {
    const [year, month, day] = bsDateStr.split('/').map(Number);
    const adDate = bsToAd(year, month, day);
    adDate.date.setDate(adDate.date.getDate() + days);
    const newBs = adToBs(adDate.date.getFullYear(), adDate.date.getMonth() + 1, adDate.date.getDate());
    return formatBsDate(newBs.year, newBs.month, newBs.day);
}

// FAB
function handleFabAction(action) {
    switch(action) {
        case 'income':
            showIncomeExpenseForm('income');
            break;
        case 'expense':
            showIncomeExpenseForm('expense');
            break;
        case 'note':
            showNoteForm();
            break;
        case 'shopping':
            showShoppingForm();
            break;
        case 'bill':
            showBillForm();
            break;
        case 'goal':
            showGoalForm();
            break;
        case 'insurance':
            showInsuranceForm();
            break;
        case 'vehicle':
            showVehicleForm();
            break;
        case 'subscription':
            showSubscriptionForm();
            break;
    }
}

// UI Helpers
function showModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Make functions global
window.showIncomeExpenseForm = showIncomeExpenseForm;
window.showRecurringForm = showRecurringForm;
window.showShoppingForm = showShoppingForm;
window.showNoteForm = showNoteForm;
window.showHolidayForm = showHolidayForm;
window.showBudgetForm = showBudgetForm;
window.showBillForm = showBillForm;
window.showGoalForm = showGoalForm;
window.showInsuranceForm = showInsuranceForm;
window.showVehicleForm = showVehicleForm;
window.showSubscriptionForm = showSubscriptionForm;
window.showCustomTypeForm = showCustomTypeForm;
window.closeModal = closeModal;
window.closeDrawer = closeDrawer;
window.deleteTransaction = deleteTransaction;
window.deleteRecurring = deleteRecurring;
window.deleteShoppingItem = deleteShoppingItem;
window.deleteNote = deleteNote;
window.deleteHoliday = deleteHoliday;
window.deleteBill = deleteBill;
window.deleteGoal = deleteGoal;
window.deleteInsurance = deleteInsurance;
window.deleteVehicle = deleteVehicle;
window.deleteSubscription = deleteSubscription;
window.deleteCustomType = deleteCustomType;
window.deleteCustomItem = deleteCustomItem;
window.toggleShoppingStatus = toggleShoppingStatus;
window.markBillPaid = markBillPaid;
window.addToGoal = addToGoal;
window.viewInsuranceDetails = viewInsuranceDetails;
window.showServiceHistory = showServiceHistory;
window.addServiceRecord = addServiceRecord;
window.deleteService = deleteService;
window.addFuelExpense = addFuelExpense;
window.updateMileage = updateMileage;
window.renewSubscription = renewSubscription;
window.selectCustomType = selectCustomType;
window.showCustomItemForm = showCustomItemForm;
window.calculateNepalTax = calculateNepalTax;

console.log('✅ app.js loaded completely');