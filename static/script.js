document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    fetchReminders();
});

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendar.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += `<div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendar.innerHTML += `<div class="day ${day === today ? 'today' : ''}" onclick="showReminders('${dateStr}')">${day}</div>`;
    }
}

function fetchReminders() {
    fetch('/get_reminders')
        .then(res => res.json())
        .then(data => {
            window.allReminders = data;
        });
}

function showReminders(date) {
    const container = document.getElementById('reminders-list');
    const items = window.allReminders[date] || [];
    container.innerHTML = `<h3>Reminders for ${date}</h3>`;
    if (items.length === 0) {
        container.innerHTML += `<p>No reminders.</p>`;
    } else {
        items.forEach(text => {
            container.innerHTML += `
                <div class="reminder">
                    ${text}
                    <button onclick="deleteReminder('${date}', '${text}')">Delete</button>
                </div>`;
        });
    }
}

function addReminder() {
    const date = document.getElementById('reminder-date').value;
    const text = document.getElementById('reminder-text').value;
    if (!date || !text) return alert('Fill both fields');

    fetch('/add_reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, text })
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              fetchReminders();
              showReminders(date);
              document.getElementById('reminder-text').value = '';
          }
      });
}

function deleteReminder(date, text) {
    fetch('/delete_reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, text })
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              fetchReminders();
              showReminders(date);
          }
      });
}
