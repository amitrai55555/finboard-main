function showTab(tabName, event) {
    // Hide all tab contents
    document.querySelectorAll('.report-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback: find the button by tabName
        const btn = document.querySelector(`.tab-btn[onclick*="showTab('${tabName}'"]`);
        if (btn) btn.classList.add('active');
    }

    // Load data based on selected tab
    if (tabName === 'monthly') {
        loadMonthlyReport();
    } else if (tabName === 'annual') {
        loadAnnualReport();
        loadAnnualChart();
    }
}

// Helper to format category name (e.g., "SALARY" -> "Salary")
function formatCategory(category) {
    if (!category) return 'Other';
    // Handle cases like "FOOD_AND_DINING" -> "Food And Dining"
    return category
        .toLowerCase()
        .split(/[_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Load monthly report data
async function loadMonthlyReport() {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Get incomes and expenses for current month
        let incomes = await dataService.getIncome(false);
        let expenses = await dataService.getExpenses(false);

        // Debug: Log received data
        console.log('Raw Incomes:', incomes);
        console.log('Raw Expenses:', expenses);

        // Unwrap response if wrapped in 'data' or 'content' (common in Spring Boot/Axios)
        if (incomes && !Array.isArray(incomes) && Array.isArray(incomes.content)) incomes = incomes.content;
        else if (incomes && !Array.isArray(incomes) && Array.isArray(incomes.data)) incomes = incomes.data;

        if (expenses && !Array.isArray(expenses) && Array.isArray(expenses.content)) expenses = expenses.content;
        else if (expenses && !Array.isArray(expenses) && Array.isArray(expenses.data)) expenses = expenses.data;

        const currentIncomes = filterByMonth(incomes, currentMonth, currentYear);
        const currentExpenses = filterByMonth(expenses, currentMonth, currentYear);

        console.log('Filtered Incomes (Month ' + currentMonth + '/' + currentYear + '):', currentIncomes);
        console.log('Filtered Expenses (Month ' + currentMonth + '/' + currentYear + '):', currentExpenses);


        // Calculate totals
        const totalIncome = sumAmount(currentIncomes);
        const totalExpense = sumAmount(currentExpenses);
        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100) : 0;

        // Update summary metrics
        document.getElementById('monthly-total-income').textContent = `₹${totalIncome.toLocaleString()}`;
        document.getElementById('monthly-total-expenses').textContent = `₹${totalExpense.toLocaleString()}`;
        document.getElementById('monthly-net-savings').textContent = `₹${netSavings.toLocaleString()}`;
        document.getElementById('monthly-savings-rate').textContent = `${savingsRate.toFixed(1)}%`;

        // Update income breakdown
        const incomeBreakdown = document.getElementById('monthly-income-breakdown');
        const incomeCategories = {};
        currentIncomes.forEach(income => {
            const rawCategory = income.category || 'Other';
            const category = formatCategory(rawCategory);
            incomeCategories[category] = (incomeCategories[category] || 0) + Number(income.amount);
        });

        let incomeBreakdownHTML = '';
        const sortedIncomeCategories = Object.entries(incomeCategories).sort((a, b) => b[1] - a[1]); // Sort by amount descending

        sortedIncomeCategories.forEach(([category, amount]) => {
            incomeBreakdownHTML += `
                <div class="summary-metric">
                    <span class="metric-label">${category}</span>
                    <span class="incomeMetric-value">₹${amount.toLocaleString()}</span>
                </div>
            `;
        });
        incomeBreakdown.innerHTML = incomeBreakdownHTML || '<div class="summary-metric"><span class="metric-label">No income data</span></div>';

        // Update expense breakdown
        const expenseBreakdown = document.getElementById('monthly-expense-breakdown');
        const expenseCategories = {};
        currentExpenses.forEach(expense => {
            const rawCategory = expense.category || 'Other';
            const category = formatCategory(rawCategory);
            expenseCategories[category] = (expenseCategories[category] || 0) + Number(expense.amount);
        });

        let expenseBreakdownHTML = '';
        const sortedExpenseCategories = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1]);

        sortedExpenseCategories.forEach(([category, amount]) => {
            expenseBreakdownHTML += `
                <div class="summary-metric">
                    <span class="metric-label">${category}</span>
                    <span class="expenseMetric-value">₹${amount.toLocaleString()}</span>
                </div>
            `;
        });
        expenseBreakdown.innerHTML = expenseBreakdownHTML || '<div class="summary-metric"><span class="metric-label">No expense data</span></div>';

        // Update category tables
        const incomeTable = document.getElementById('monthly-income-categories');
        let incomeTableHTML = '';
        sortedIncomeCategories.forEach(([category, amount]) => {
            // Calculate percentage of total
            const percent = totalIncome > 0 ? (amount / totalIncome * 100).toFixed(1) + '%' : '0%';

            incomeTableHTML += `
                <div class="table-row">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">₹${amount.toLocaleString()}</span>
                    <span class="category-change">${percent}</span>
                </div>
            `;
        });
        incomeTable.innerHTML = incomeTableHTML || '<div class="table-row"><span class="category-name">No data</span><span class="category-amount">-</span><span class="category-change">-</span></div>';

        const expenseTable = document.getElementById('monthly-expense-categories');
        let expenseTableHTML = '';
        sortedExpenseCategories.forEach(([category, amount]) => {
            // Calculate percentage of total
            const percent = totalExpense > 0 ? (amount / totalExpense * 100).toFixed(1) + '%' : '0%';

            expenseTableHTML += `
                <div class="table-row">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">₹${amount.toLocaleString()}</span>
                    <span class="category-change">${percent}</span>
                </div>
            `;
        });
        expenseTable.innerHTML = expenseTableHTML || '<div class="table-row"><span class="category-name">No data</span><span class="category-amount">-</span><span class="category-change">-</span></div>';

    } catch (error) {
        console.error('Error loading monthly report:', error);
        // Show error messages
        document.getElementById('monthly-total-income').textContent = 'Error';
        document.getElementById('monthly-total-expenses').textContent = 'Error';
        document.getElementById('monthly-net-savings').textContent = 'Error';
        document.getElementById('monthly-savings-rate').textContent = 'Error';
    }
}

// Load annual report data
async function loadAnnualReport() {
    try {
        const currentYear = new Date().getFullYear();

        // Get incomes and expenses for current year
        let incomes = await dataService.getIncome(false);
        let expenses = await dataService.getExpenses(false);

        // Debug: Log received data  
        console.log('Annual Report - Raw Incomes:', incomes);
        console.log('Annual Report - Raw Expenses:', expenses);

        // Unwrap response if wrapped in 'data' or 'content' (common in Spring Boot/Axios)
        if (incomes && !Array.isArray(incomes) && Array.isArray(incomes.content)) incomes = incomes.content;
        else if (incomes && !Array.isArray(incomes) && Array.isArray(incomes.data)) incomes = incomes.data;

        if (expenses && !Array.isArray(expenses) && Array.isArray(expenses.content)) expenses = expenses.content;
        else if (expenses && !Array.isArray(expenses) && Array.isArray(expenses.data)) expenses = expenses.data;

        const currentYearIncomes = filterByYear(incomes, currentYear);
        const currentYearExpenses = filterByYear(expenses, currentYear);
        const prevYearIncomes = filterByYear(incomes, currentYear - 1);
        const prevYearExpenses = filterByYear(expenses, currentYear - 1);

        // Calculate totals
        const totalIncome = sumAmount(currentYearIncomes);
        const totalExpense = sumAmount(currentYearExpenses);
        const prevTotalIncome = sumAmount(prevYearIncomes);
        const prevTotalExpense = sumAmount(prevYearExpenses);

        const incomeGrowth = calculateChange(totalIncome, prevTotalIncome);
        const expenseGrowth = calculateChange(totalExpense, prevTotalExpense);
        const savingsGrowth = calculateChange(totalIncome - totalExpense, prevTotalIncome - prevTotalExpense);

        // Update annual overview
        document.getElementById('annual-total-income').textContent = `₹${totalIncome.toLocaleString()}`;
        document.getElementById('annual-total-expenses').textContent = `₹${totalExpense.toLocaleString()}`;
        document.getElementById('annual-net-savings').textContent = `₹${(totalIncome - totalExpense).toLocaleString()}`;
        document.getElementById('annual-savings-rate').textContent = `${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%`;

        // Update year-over-year growth
        document.getElementById('annual-income-growth').textContent = incomeGrowth;
        document.getElementById('annual-expense-growth').textContent = expenseGrowth;
        document.getElementById('annual-savings-growth').textContent = savingsGrowth;
        document.getElementById('annual-investment-returns').textContent = 'N/A'; // Placeholder

        // Update category analysis
        const incomeCategories = {};
        currentYearIncomes.forEach(income => {
            const rawCategory = income.category || 'Other';
            const category = formatCategory(rawCategory);
            incomeCategories[category] = (incomeCategories[category] || 0) + Number(income.amount);
        });

        const expenseCategories = {};
        currentYearExpenses.forEach(expense => {
            const rawCategory = expense.category || 'Other';
            const category = formatCategory(rawCategory);
            expenseCategories[category] = (expenseCategories[category] || 0) + Number(expense.amount);
        });

        const sortedIncomeCategories = Object.entries(incomeCategories).sort((a, b) => b[1] - a[1]);
        const sortedExpenseCategories = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1]);

        const incomeSourcesTable = document.getElementById('annual-income-sources');
        let incomeSourcesHTML = '';
        sortedIncomeCategories.forEach(([category, amount]) => {
            const percent = totalIncome > 0 ? (amount / totalIncome * 100).toFixed(1) + '%' : '0%';
            incomeSourcesHTML += `
                <div class="table-row">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">₹${amount.toLocaleString()}</span>
                    <span class="category-change">${percent}</span>
                </div>
            `;
        });
        incomeSourcesTable.innerHTML = incomeSourcesHTML || '<div class="table-row"><span class="category-name">No data</span><span class="category-amount">-</span><span class="category-change">-</span></div>';

        const expenseCategoriesTable = document.getElementById('annual-expense-categories');
        let expenseCategoriesHTML = '';
        sortedExpenseCategories.forEach(([category, amount]) => {
            const percent = totalExpense > 0 ? (amount / totalExpense * 100).toFixed(1) + '%' : '0%';
            expenseCategoriesHTML += `
                <div class="table-row">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">₹${amount.toLocaleString()}</span>
                    <span class="category-change">${percent}</span>
                </div>
            `;
        });
        expenseCategoriesTable.innerHTML = expenseCategoriesHTML || '<div class="table-row"><span class="category-name">No data</span><span class="category-amount">-</span><span class="category-change">-</span></div>';

    } catch (error) {
        console.error('Error loading annual report:', error);
        // Show error messages
        document.getElementById('annual-total-income').textContent = 'Error';
        document.getElementById('annual-total-expenses').textContent = 'Error';
        document.getElementById('annual-net-savings').textContent = 'Error';
        document.getElementById('annual-savings-rate').textContent = 'Error';
    }
}

// Initialize with monthly tab active
document.addEventListener('DOMContentLoaded', function () {
    showTab('monthly');
});

// Load and render the annual chart
async function loadAnnualChart() {
    console.log('Loading annual chart...');

    const chartBarsContainer = document.querySelector('.annual-chart-bars');
    if (!chartBarsContainer) {
        console.error('Annual chart container .annual-chart-bars not found!');
        return;
    }

    // Clear existing chart bars
    chartBarsContainer.innerHTML = '';

    // Prepare months for last 12 months
    const monthlyData = {};
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentDate.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = { income: 0, expense: 0 };
    }

    let hasData = false;

    // Try to use backend monthly trends (aggregated data)
    try {
        if (typeof dataService !== 'undefined' && dataService.getMonthlyTrends) {
            const trends = await dataService.getMonthlyTrends(false, 12);
            if (trends && trends.income && trends.expenses) {
                Object.keys(trends.income).forEach(key => {
                    const incomeAmount = Number(trends.income[key]);
                    const expenseAmount = Number(trends.expenses[key]);
                    if (Number.isFinite(incomeAmount) && Number.isFinite(expenseAmount)) {
                        if (monthlyData.hasOwnProperty(key)) {
                            monthlyData[key].income = incomeAmount;
                            monthlyData[key].expense = expenseAmount;
                            if (incomeAmount > 0 || expenseAmount > 0) hasData = true;
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Falling back to raw data for annual chart:', e);
    }

    // Fallback: aggregate client-side from raw incomes and expenses if API trends not available
    if (!hasData) {
        try {
            const [incomes, expenses] = await Promise.all([
                dataService.getIncome(false),
                dataService.getExpenses(false)
            ]);

            if (Array.isArray(incomes)) {
                incomes.forEach(income => {
                    if (!income || !income.date) return;
                    const incomeDate = parseDate(income.date);
                    const amountNumber = Number(income.amount);
                    if (!incomeDate || Number.isNaN(incomeDate.getTime()) || !Number.isFinite(amountNumber)) return;
                    const monthKey = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData.hasOwnProperty(monthKey)) {
                        monthlyData[monthKey].income += amountNumber;
                        if (amountNumber > 0) hasData = true;
                    }
                });
            }

            if (Array.isArray(expenses)) {
                expenses.forEach(expense => {
                    if (!expense || !expense.date) return;
                    const expenseDate = parseDate(expense.date);
                    const amountNumber = Number(expense.amount);
                    if (!expenseDate || Number.isNaN(expenseDate.getTime()) || !Number.isFinite(amountNumber)) return;
                    const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData.hasOwnProperty(monthKey)) {
                        monthlyData[monthKey].expense += amountNumber;
                        if (amountNumber > 0) hasData = true;
                    }
                });
            }
        } catch (e) {
            console.warn('Could not load raw data for annual chart:', e);
        }
    }

    // Find max value for scaling
    const allValues = Object.values(monthlyData).flatMap(data => [data.income, data.expense]);
    const maxValue = Math.max(...allValues, 1);

    const monthKeys = Object.keys(monthlyData).sort();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    monthKeys.forEach(monthKey => {
        const data = monthlyData[monthKey];
        const monthDate = new Date(monthKey + '-01');
        const monthLabel = monthNames[monthDate.getMonth()];

        // Create income bar
        const incomeBar = document.createElement('div');
        incomeBar.className = 'annual-chart-bar income-bar';
        const incomeHeight = Math.max((data.income / maxValue) * 180, 5); // Minimum 5px for visibility, max 180px to leave space for labels
        incomeBar.style.height = `${incomeHeight}px`;
        incomeBar.style.backgroundColor = '#10B981'; // Green for income
        incomeBar.style.width = '30px';
        incomeBar.style.borderRadius = '4px 4px 0 0';
        incomeBar.style.position = 'relative';

        incomeBar.addEventListener('mouseenter', function () {
            const rect = this.getBoundingClientRect();
            const tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            tooltip.innerHTML = `₹${data.income.toLocaleString()}`;
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                pointer-events: none;
                z-index: 1000;
                top: ${rect.top - 40}px;
                left: ${rect.left + rect.width / 2}px;
                transform: translateX(-50%);
            `;
            document.body.appendChild(tooltip);

            this.addEventListener('mouseleave', function () {
                if (tooltip.parentNode) {
                    tooltip.remove();
                }
            }, { once: true });
        });

        // Create expense bar
        const expenseBar = document.createElement('div');
        expenseBar.className = 'annual-chart-bar expense-bar';
        const expenseHeight = Math.max((data.expense / maxValue) * 180, 5); // Minimum 5px for visibility, max 180px to leave space for labels
        expenseBar.style.height = `${expenseHeight}px`;
        expenseBar.style.backgroundColor = '#EF4444'; // Red for expense
        expenseBar.style.width = '30px';
        expenseBar.style.borderRadius = '4px 4px 0 0';
        expenseBar.style.position = 'relative';

        expenseBar.addEventListener('mouseenter', function () {
            const rect = this.getBoundingClientRect();
            const tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            tooltip.innerHTML = `₹${data.expense.toLocaleString()}`;
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                pointer-events: none;
                z-index: 1000;
                top: ${rect.top - 40}px;
                left: ${rect.left + rect.width / 2}px;
                transform: translateX(-50%);
            `;
            document.body.appendChild(tooltip);

            this.addEventListener('mouseleave', function () {
                if (tooltip.parentNode) {
                    tooltip.remove();
                }
            }, { once: true });
        });

        // Create month container
        const monthContainer = document.createElement('div');
        monthContainer.className = 'month-bar-container';
        monthContainer.style.position = 'relative';
        monthContainer.style.flex = '1';
        monthContainer.style.height = '200px';
        monthContainer.style.display = 'flex';
        monthContainer.style.justifyContent = 'center';
        monthContainer.style.alignItems = 'flex-end';

        // Create a bar group container for side-by-side bars
        const barGroup = document.createElement('div');
        barGroup.style.position = 'relative';
        barGroup.style.display = 'flex';
        barGroup.style.flexDirection = 'row';
        barGroup.style.alignItems = 'flex-end';
        barGroup.style.gap = '2px';

        barGroup.appendChild(incomeBar);
        barGroup.appendChild(expenseBar);

        monthContainer.appendChild(barGroup);

        chartBarsContainer.appendChild(monthContainer);
    });

    console.log('Annual chart updated:', monthlyData, '| Bars created:', chartBarsContainer.children.length);
}

// --- Export Functionality ---

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Bonus', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Insurance', 'Other'];

async function handleExport(type, btn) {
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    try {
        if (typeof window.dataService === 'undefined') {
            throw new Error('Data service is not initialized. Please refresh the page.');
        }

        // Check active tab
        const monthlyTab = document.getElementById('monthly');
        const isMonthly = monthlyTab && monthlyTab.classList.contains('active');

        // Get selected date
        const monthInput = document.querySelector('input[type="month"]') || document.getElementById('reportMonth');
        const yearInput = document.getElementById('reportYear');

        const now = new Date();
        let selectedMonth = now.getMonth();
        let selectedYear = now.getFullYear();

        if (monthInput && monthInput.value) {
            const parts = monthInput.value.split('-');
            if (parts.length === 2) {
                selectedYear = parseInt(parts[0]);
                selectedMonth = parseInt(parts[1]) - 1;
            }
        } else if (yearInput && yearInput.value) {
            selectedYear = parseInt(yearInput.value);
        }

        const reportData = await generateReportData(isMonthly, selectedMonth, selectedYear);

        // Determine filename
        const extension = type === 'pdf' ? 'pdf' : (type === 'excel' ? 'csv' : 'csv');
        const filename = `Financial_Report_${selectedYear}${isMonthly ? '_' + getMonthName(selectedMonth) : ''}.${extension}`;

        if (type === 'pdf') {
            // Generate PDF using jsPDF with tables
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(`Financial Report - ${isMonthly ? getMonthName(selectedMonth) + ' ' + selectedYear : selectedYear}`, 14, 20);

            let yPosition = 30;

            // Parse CSV data and create tables
            const sections = parseCSVForPDF(reportData);

            sections.forEach(section => {
                if (section.title) {
                    // Add section title
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(section.title, 14, yPosition);
                    yPosition += 10;
                }

                if (section.data && section.data.length > 0) {
                    // Create table
                    doc.autoTable({
                        startY: yPosition,
                        head: [section.headers],
                        body: section.data,
                        theme: 'grid',
                        styles: {
                            fontSize: 8,
                            cellPadding: 3,
                        },
                        headStyles: {
                            fillColor: [41, 128, 185], // Blue header
                            textColor: 255,
                            fontStyle: 'bold',
                        },
                        alternateRowStyles: {
                            fillColor: [245, 245, 245], // Light gray for alternate rows
                        },
                        margin: { top: 10 },
                        columnStyles: {
                            0: { cellWidth: 40 }, // First column wider for labels
                        },
                    });

                    yPosition = doc.lastAutoTable.finalY + 15;
                }
            });

            // Download the PDF
            doc.save(filename);
        } else if (type === 'excel') {
            // Generate Excel file with enhanced formatting
            const sections = parseCSVForPDF(reportData);
            const workbook = XLSX.utils.book_new();

            sections.forEach((section, sectionIndex) => {
                if (section.title && section.data && section.data.length > 0) {
                    const ws = XLSX.utils.aoa_to_sheet([]);

                    // Add title with styling
                    XLSX.utils.sheet_add_aoa(ws, [[section.title]], { origin: 'A1' });
                    if (!ws['!merges']) ws['!merges'] = [];
                    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: section.headers.length - 1 } });

                    // Add headers with styling
                    XLSX.utils.sheet_add_aoa(ws, [section.headers], { origin: 'A3' });

                    // Add data
                    XLSX.utils.sheet_add_aoa(ws, section.data, { origin: 'A4' });

                    // Set column widths
                    const colWidths = section.headers.map((header, index) => ({
                        wch: index === 0 ? 25 : Math.max(15, header.length + 2)
                    }));
                    ws['!cols'] = colWidths;

                    // Add basic styling (limited in browser XLSX)
                    // Title row styling
                    if (!ws['!rows']) ws['!rows'] = [];
                    ws['!rows'][0] = { hpt: 20, hpx: 20 }; // Row height

                    // Header row styling
                    ws['!rows'][2] = { hpt: 18, hpx: 18 };

                    // Add to workbook with truncated sheet name
                    const sheetName = section.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 31) || `Sheet${sectionIndex + 1}`;
                    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
                }
            });

            // Download the Excel file
            XLSX.writeFile(workbook, filename);
        } else {
            // Enhanced CSV export with better formatting
            const sections = parseCSVForPDF(reportData);
            let csvContent = '';

            sections.forEach(section => {
                if (section.title) {
                    csvContent += `${section.title}\n`;
                    csvContent += `${section.headers.join(',')}\n`;
                    section.data.forEach(row => {
                        csvContent += `${row.join(',')}\n`;
                    });
                    csvContent += '\n';
                }
            });

            downloadCSV(csvContent, filename);
        }

    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to generate report: ' + (error.message || 'Unknown error'));
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

async function generateReportData(isMonthly, month, year) {
    const incomes = await dataService.getIncome(false);
    const expenses = await dataService.getExpenses(false);

    let csvContent = '';

    if (isMonthly) {
        // Current Month Data
        const currentIncomes = filterByMonth(incomes, month, year);
        const currentExpenses = filterByMonth(expenses, month, year);

        // Previous Month Data
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth < 0) { prevMonth = 11; prevYear = year - 1; }
        const prevIncomes = filterByMonth(incomes, prevMonth, prevYear);
        const prevExpenses = filterByMonth(expenses, prevMonth, prevYear);

        const totalIncome = sumAmount(currentIncomes);
        const totalExpense = sumAmount(currentExpenses);

        csvContent += `Monthly Financial Report - ${getMonthName(month)} ${year}\n\n`;
        csvContent += `Summary\n`;
        csvContent += `Metric,Amount\n`;
        csvContent += `Total Income,${totalIncome.toFixed(2)}\n`;
        csvContent += `Total Expense,${totalExpense.toFixed(2)}\n`;
        csvContent += `Net Savings,${(totalIncome - totalExpense).toFixed(2)}\n\n`;

        csvContent += `Category Breakdown\n`;
        csvContent += `Category,Type,Current Month,Previous Month,Change (%)\n`;

        INCOME_CATEGORIES.forEach(cat => {
            const curr = sumByCategory(currentIncomes, cat);
            const prev = sumByCategory(prevIncomes, cat);
            csvContent += `${cat},Income,${curr.toFixed(2)},${prev.toFixed(2)},${calculateChange(curr, prev)}\n`;
        });

        EXPENSE_CATEGORIES.forEach(cat => {
            const curr = sumByCategory(currentExpenses, cat);
            const prev = sumByCategory(prevExpenses, cat);
            csvContent += `${cat},Expense,${curr.toFixed(2)},${prev.toFixed(2)},${calculateChange(curr, prev)}\n`;
        });

    } else {
        // Annual Data
        const currentIncomes = filterByYear(incomes, year);
        const currentExpenses = filterByYear(expenses, year);
        const prevIncomes = filterByYear(incomes, year - 1);
        const prevExpenses = filterByYear(expenses, year - 1);

        const totalIncome = sumAmount(currentIncomes);
        const totalExpense = sumAmount(currentExpenses);
        const prevTotalIncome = sumAmount(prevIncomes);
        const prevTotalExpense = sumAmount(prevExpenses);

        csvContent += `Annual Financial Report - ${year}\n\n`;
        csvContent += `Yearly Comparison\n`;
        csvContent += `Type,${year},${year - 1},Change (%)\n`;
        csvContent += `Total Income,${totalIncome.toFixed(2)},${prevTotalIncome.toFixed(2)},${calculateChange(totalIncome, prevTotalIncome)}\n`;
        csvContent += `Total Expense,${totalExpense.toFixed(2)},${prevTotalExpense.toFixed(2)},${calculateChange(totalExpense, prevTotalExpense)}\n\n`;

        csvContent += `Category Breakdown (Yearly)\n`;
        csvContent += `Category,Type,${year},${year - 1},Change (%)\n`;

        INCOME_CATEGORIES.forEach(cat => {
            const curr = sumByCategory(currentIncomes, cat);
            const prev = sumByCategory(prevIncomes, cat);
            csvContent += `${cat},Income,${curr.toFixed(2)},${prev.toFixed(2)},${calculateChange(curr, prev)}\n`;
        });

        EXPENSE_CATEGORIES.forEach(cat => {
            const curr = sumByCategory(currentExpenses, cat);
            const prev = sumByCategory(prevExpenses, cat);
            csvContent += `${cat},Expense,${curr.toFixed(2)},${prev.toFixed(2)},${calculateChange(curr, prev)}\n`;
        });
        csvContent += `\n`;

        // Monthly Category Breakdown with Year-over-Year Comparison
        for (let m = 0; m < 12; m++) {
            const mIncomes = filterByMonth(currentIncomes, m, year);
            const mExpenses = filterByMonth(currentExpenses, m, year);
            const prevMIncomes = filterByMonth(prevIncomes, m, year - 1);
            const prevMExpenses = filterByMonth(prevExpenses, m, year - 1);

            csvContent += `\n${getMonthName(m)} ${year} Category Breakdown\n`;
            csvContent += `Category,Type,${year},${year - 1},Change (%)\n`;

            INCOME_CATEGORIES.forEach(cat => {
                const curr = sumByCategory(mIncomes, cat);
                const prev = sumByCategory(prevMIncomes, cat);
                csvContent += `${cat},Income,${curr.toFixed(2)},${prev.toFixed(2)},${calculateChange(curr, prev)}\n`;
            });

            EXPENSE_CATEGORIES.forEach(cat => {
                const curr = sumByCategory(mExpenses, cat);
                const prev = sumByCategory(prevMExpenses, cat);
                csvContent += `${cat},Expense,${curr.toFixed(2)},${prev.toFixed(2)},${calculateChange(curr, prev)}\n`;
            });
        }
    }

    return csvContent;
}

function filterByMonth(items, month, year) {
    if (!Array.isArray(items)) return [];
    return items.filter(item => {
        const d = parseDate(item.date);
        return d && d.getMonth() === month && d.getFullYear() === year;
    });
}

function filterByYear(items, year) {
    if (!Array.isArray(items)) return [];
    return items.filter(item => {
        const d = parseDate(item.date);
        return d && d.getFullYear() === year;
    });
}

// Helper to robustly parse dates (handles "YYYY-MM-DD" string and [YYYY, MM, DD] array)
function parseDate(dateInput) {
    if (!dateInput) return null;

    // Handle Java LocalDate array format [2024, 1, 31]
    if (Array.isArray(dateInput)) {
        // Javascript Date month is 0-indexed (0=Jan, 11=Dec)
        // Java LocalDate array is usually 1-indexed for month? 
        // Standard Spring Boot serialization for LocalDate is [year, month, day] where month is 1-12
        return new Date(dateInput[0], dateInput[1] - 1, dateInput[2]);
    }

    // Handle Timestamp (number)
    if (typeof dateInput === 'number') {
        return new Date(dateInput);
    }

    // Handle String
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
        console.warn('Invalid date encountered:', dateInput);
        return null;
    }
    return d;
}

function sumAmount(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

function sumByCategory(items, category) {
    if (!Array.isArray(items)) return 0;
    return items
        .filter(item => (item.category || '').toLowerCase() === category.toLowerCase())
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

function calculateChange(current, previous) {
    if (previous === 0) return current === 0 ? '0%' : '100%';
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(2) + '%';
}

function getMonthName(monthIndex) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
}

function parseCSVForPDF(csvContent) {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    const sections = [];
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is a section title (doesn't contain commas or is a known title)
        if (!line.includes(',') || line.includes('Report') || line.includes('Summary') || line.includes('Breakdown') || line.includes('Comparison')) {
            if (currentSection && currentSection.data.length > 0) {
                sections.push(currentSection);
            }
            currentSection = {
                title: line,
                headers: [],
                data: []
            };
        } else if (currentSection) {
            const cells = line.split(',').map(cell => cell.trim());

            // If headers are empty, this is the header row
            if (currentSection.headers.length === 0) {
                currentSection.headers = cells;
            } else {
                // This is data row
                currentSection.data.push(cells);
            }
        }
    }

    // Add the last section
    if (currentSection && currentSection.data.length > 0) {
        sections.push(currentSection);
    }

    return sections;
}

function downloadCSV(content, filename) {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
