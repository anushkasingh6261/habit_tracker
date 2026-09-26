const STORAGE_KEY = 'plot-habits-v1';
let habits = [];
try {
  habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch(e){ habits = []; }

function save(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); }
  catch(e){}
}

function dateKey(d){
  return d.toISOString().slice(0,10);
}

function last7(){
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    days.push(d);
  }
  return days;
}

function currentStreak(h){
  let streak = 0;
  let d = new Date();
  while(true){
    const key = dateKey(d);
    if(h.done && h.done[key]){
      streak++;
      d.setDate(d.getDate()-1);
    } else {
      break;
    }
  }
  return streak;
}

function render(){
  const list = document.getElementById('list');
  if(habits.length === 0){
    list.innerHTML = '<div class="empty">No habits yet — plant your first one above.</div>';
    return;
  }
  const days = last7();
  const dayLabels = days.map(d => d.toLocaleDateString(undefined,{weekday:'short'})[0]);
  const todayKey = dateKey(new Date());

  list.innerHTML = habits.map((h, hi) => {
    const streak = currentStreak(h);
    const cells = days.map((d,i) => {
      const key = dateKey(d);
      const done = h.done && h.done[key];
      const isToday = key === todayKey;
      return `<div>
        <div class="day ${done?'done':''} ${isToday?'today':''}" data-hi="${hi}" data-key="${key}">${done?'✓':''}</div>
        <div class="day-label">${dayLabels[i]}</div>
      </div>`;
    }).join('');
    return `<div class="habit">
      <div class="habit-top">
        <span class="habit-name">${escapeHtml(h.name)}</span>
        <span>
          <span class="streak">${streak > 0 ? streak + '-day streak' : 'no streak yet'}</span>
          <button class="remove" data-remove="${hi}">remove</button>
        </span>
      </div>
      <div class="days">${cells}</div>
    </div>`;
  }).join('');
}

function escapeHtml(s){
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

document.getElementById('addBtn').addEventListener('click', addHabit);
document.getElementById('newHabit').addEventListener('keydown', e => {
  if(e.key === 'Enter') addHabit();
});

function addHabit(){
  const input = document.getElementById('newHabit');
  const name = input.value.trim();
  if(!name) return;
  habits.push({name, done:{}});
  input.value = '';
  save();
  render();
}

document.getElementById('list').addEventListener('click', e => {
  const cell = e.target.closest('.day');
  if(cell){
    const hi = +cell.dataset.hi;
    const key = cell.dataset.key;
    const h = habits[hi];
    h.done = h.done || {};
    h.done[key] = !h.done[key];
    save();
    render();
    return;
  }
  const rm = e.target.closest('[data-remove]');
  if(rm){
    const hi = +rm.dataset.remove;
    habits.splice(hi,1);
    save();
    render();
  }
});

render();
