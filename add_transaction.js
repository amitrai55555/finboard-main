function showNotification(message, type) {
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.innerHTML = `<div class="notification-content"><i class="fas ${type==='success'?'fa-check-circle':'fa-exclamation-circle'}"></i><span>${message}</span></div>`;
    Object.assign(el.style, {position:'fixed',top:'20px',right:'20px',padding:'16px',borderRadius:'8px',background:'#fff',boxShadow:'0 4px 12px rgba(0,0,0,.15)',zIndex:'1000'});
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),3000);
}

document.getElementById('txDate').valueAsDate = new Date();

const switchIncome = document.getElementById('switchIncome');
const switchExpense = document.getElementById('switchExpense');
const txType = document.getElementById('txType');
const txCategory = document.getElementById('txCategory');

function setType(type) {
    txType.value = type;
    switchIncome.classList.toggle('active', type==='income');
    switchExpense.classList.toggle('active', type==='expense');
}

switchIncome.addEventListener('click', ()=> setType('income'));
switchExpense.addEventListener('click', ()=> setType('expense'));

document.getElementById('transactionForm').addEventListener('submit', function(e){
    e.preventDefault();
    try {
        const form = new FormData(this);
        const data = {
            type: form.get('type'),
            amount: parseFloat(form.get('amount')),
            date: form.get('date'),
            category: form.get('category'),
            account: form.get('account'),
            description: form.get('description')
        };

        if (isNaN(data.amount) || data.amount <= 0) throw new Error('Please enter a valid amount');
        if (!data.category) throw new Error('Please select a category');

        // Save to localStorage alongside existing lists
        if (data.type === 'income') {
            const incomes = JSON.parse(localStorage.getItem('incomes')||'[]');
            incomes.push({ id: Date.now(), amount: data.amount, date: data.date, type: data.category||'income', source: data.account, description: data.description });
            localStorage.setItem('incomes', JSON.stringify(incomes));
        } else {
            const expenses = JSON.parse(localStorage.getItem('expenses')||'[]');
            expenses.push({ id: Date.now(), amount: data.amount, date: data.date, category: data.category||'other', merchant: data.account, description: data.description });
            localStorage.setItem('expenses', JSON.stringify(expenses));
        }

        showNotification('Transaction added successfully!','success');
        setTimeout(()=>{ window.location.href = 'dashboard.html#transactions'; }, 1200);
    } catch(err){
        showNotification(err.message,'error');
    }
});
