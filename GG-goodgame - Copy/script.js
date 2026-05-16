// ========== YEAR ==========
document.getElementById('year').textContent = new Date().getFullYear();

// ========== SPECS COLLAPSIBLE ==========
function toggleSpecs(btn) {
  const dl = btn.previousElementSibling;
  const hidden = dl.querySelectorAll('.specs-more');
  const isOpen = btn.dataset.open === '1';
  hidden.forEach(el => { el.hidden = isOpen; });
  btn.dataset.open = isOpen ? '0' : '1';
  btn.textContent = isOpen ? '... მეტი' : '↑ ნაკლები';
}

// ========== MOBILE NAV ==========
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger?.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ========== ACTIVE NAV ON SCROLL ==========
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  sections.forEach(sec => {
    if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
      navLinkEls.forEach(l => l.classList.toggle('active', l.dataset.section === sec.id));
    }
  });
});

// ========== MULTI-STEP BOOKING ==========
const BK_DEVICES = {
  'pc-std':  { name: 'PC',            sub: 'საერთო სივრცე', base: 5,  fixedPrices: {} },
  'ps5-std': { name: 'PlayStation 5', sub: 'საერთო სივრცე', base: 5,  fixedPrices: {} },
  'pc-vip':  { name: 'VIP PC',        sub: 'VIP ოთახი',   base: 7,  fixedPrices: { 5: 30 } },
  'ps5-vip': { name: 'PS5 VIP',       sub: 'VIP ოთახი',   base: 10, fixedPrices: {} }
};

const PS5_VIP_MODES = {
  '1v1': { label: '1v1', base: 10, fixedPrices: { 3: 25 } },
  '2v2': { label: '2v2', base: 15, fixedPrices: { 3: 40 } }
};

const PS5_STD_MODES = {
  '1v1': { label: '1v1', base: 5,  fixedPrices: {} },
  '2v2': { label: '2v2', base: 10, fixedPrices: {} }
};

const BK_HOURS = [
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00','23:00',
  '00:00','01:00','02:00','03:00','04:00','05:00'
];

const GROUP_OPTIONS = [1,2,3,4,5,6,7,8,9,10];

function isEveningSlot(timeIdx) {
  return timeIdx >= 6 && timeIdx <= 11;
}

let bk = { dev: 'pc-std', hours: 1, time: null, date: '', vipMode: null, ps5StdMode: null, groupSize: null, pcCount: null };

function isPs5Vip() { return bk.dev === 'ps5-vip'; }
function isPs5Std() { return bk.dev === 'ps5-std'; }
function isPc() { return bk.dev === 'pc-std' || bk.dev === 'pc-vip'; }

function bkDevData() {
  if (bk.dev === 'ps5-vip' && bk.vipMode) {
    const m = PS5_VIP_MODES[bk.vipMode];
    return { name: 'PS5 VIP ' + m.label, sub: 'VIP ოთახი • ' + m.label, base: m.base, fixedPrices: m.fixedPrices };
  }
  if (bk.dev === 'ps5-std' && bk.ps5StdMode) {
    const m = PS5_STD_MODES[bk.ps5StdMode];
    return { name: 'PlayStation 5 ' + m.label, sub: 'საერთო სივრცე • ' + m.label, base: m.base, fixedPrices: m.fixedPrices };
  }
  return BK_DEVICES[bk.dev];
}

function hasGroupDiscount() {
  return isPs5Vip() && bk.groupSize >= 10 && bk.time !== null && isEveningSlot(bk.time);
}

function bkCalcPrice(h) {
  if (hasGroupDiscount()) return 18 * h;
  const d = bkDevData();
  let unitPrice;
  if (d.fixedPrices[h] !== undefined) {
    unitPrice = d.fixedPrices[h];
  } else {
    unitPrice = d.base * h;
  }
  const count = (isPc() && bk.pcCount) ? bk.pcCount : 1;
  return unitPrice * count;
}

function bkMaxHours() {
  if (bk.time === null) return 18;
  return 18 - bk.time;
}

function bkSetStdStepBar(n) {
  document.querySelectorAll('#bkStepsStd .bk-step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.toggle('active', sn === n);
    s.classList.toggle('done', sn < n);
  });
}
function bkSetPs5StdStepBar(n) {
  document.querySelectorAll('#bkStepsPs5Std .bk-step').forEach(s => {
    const sn = parseInt(s.dataset.pstep);
    s.classList.toggle('active', sn === n);
    s.classList.toggle('done', sn < n);
  });
}
function bkSetVipStepBar(n) {
  document.querySelectorAll('#bkStepsVip .bk-step').forEach(s => {
    const sn = parseInt(s.dataset.vstep);
    s.classList.toggle('active', sn === n);
    s.classList.toggle('done', sn < n);
  });
}
function bkSwitchStepBars(mode) {
  document.getElementById('bkStepsStd').style.display     = mode === 'pc'      ? 'flex' : 'none';
  document.getElementById('bkStepsPs5Std').style.display  = mode === 'ps5std'  ? 'flex' : 'none';
  document.getElementById('bkStepsVip').style.display     = mode === 'vip'     ? 'flex' : 'none';
}
function bkGoPanel(id) {
  document.querySelectorAll('.bk-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function bkSelDev(el) {
  document.querySelectorAll('[data-dev]').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  bk.dev = el.dataset.dev;
  bk.hours = 1;
  bk.vipMode = null;
  bk.ps5StdMode = null;
  bk.groupSize = null;
  bk.pcCount = null;
  const modeWrap    = document.getElementById('bkVipModeWrap');
  const stdModeWrap = document.getElementById('bkPs5StdModeWrap');
  if (bk.dev === 'ps5-vip') {
    modeWrap.style.display = 'block';
    stdModeWrap.style.display = 'none';
    document.querySelectorAll('#bkVipModeWrap .bk-vip-mode-btn').forEach(b => b.classList.remove('sel'));
    document.getElementById('bkVipModeErr').style.display = 'none';
  } else if (bk.dev === 'ps5-std') {
    modeWrap.style.display = 'none';
    stdModeWrap.style.display = 'block';
    document.querySelectorAll('#bkPs5StdModeWrap .bk-vip-mode-btn').forEach(b => b.classList.remove('sel'));
    document.getElementById('bkPs5StdModeErr').style.display = 'none';
  } else {
    modeWrap.style.display = 'none';
    stdModeWrap.style.display = 'none';
  }
  bkRefreshDur();
}

function bkGoNext1() {
  if (bk.dev === 'ps5-vip') {
    if (!bk.vipMode) { document.getElementById('bkVipModeErr').style.display = 'block'; return; }
    bkSwitchStepBars('vip');
    bkBuildGroupGrid();
    bkGoPanel('bkP1b');
    bkSetVipStepBar(2);
  } else if (isPc()) {
    bkSwitchStepBars('pc');
    bk.pcCount = null;
    bkBuildPcCountGrid();
    bkGoPanel('bkP1c');
    bkSetStdStepBar(2);
  } else {
    if (!bk.ps5StdMode) { document.getElementById('bkPs5StdModeErr').style.display = 'block'; return; }
    bkSwitchStepBars('ps5std');
    bkGoPanel('bkP2');
    bkSetPs5StdStepBar(2);
    bkUpdateGroupHint();
    bkBuildTimeGrid();
  }
}

function bkSelVipMode(el, mode) {
  document.querySelectorAll('#bkVipModeWrap .bk-vip-mode-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  bk.vipMode = mode;
  document.getElementById('bkVipModeErr').style.display = 'none';
  bkRefreshDur();
}

function bkSelPs5StdMode(el, mode) {
  document.querySelectorAll('#bkPs5StdModeWrap .bk-vip-mode-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  bk.ps5StdMode = mode;
  document.getElementById('bkPs5StdModeErr').style.display = 'none';
  bkRefreshDur();
}

function bkPcMaxCount() {
  return bk.dev === 'pc-vip' ? 10 : 6;
}
function bkBuildPcCountGrid() {
  const max = bkPcMaxCount();
  const opts = Array.from({length: max}, (_, i) => i + 1);
  const g = document.getElementById('bkPcCountGrid');
  g.innerHTML = opts.map(n => `<div class="bk-group-btn${bk.pcCount === n ? ' sel' : ''}" onclick="bkSelPcCount(this,${n})">${n}</div>`).join('');
}
function bkSelPcCount(el, n) {
  document.querySelectorAll('#bkPcCountGrid .bk-group-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  bk.pcCount = n;
  document.getElementById('bkPcCountErr').style.display = 'none';
}
function bkGoPcCount() {
  if (!bk.pcCount) { document.getElementById('bkPcCountErr').style.display = 'block'; return; }
  bkGoPanel('bkP2');
  bkSetStdStepBar(3);
  bkUpdateGroupHint();
  bkBuildTimeGrid();
}

function bkBuildGroupGrid() {
  const g = document.getElementById('bkGroupGrid');
  g.innerHTML = GROUP_OPTIONS.map(n => `<div class="bk-group-btn${bk.groupSize === n ? ' sel' : ''}" onclick="bkSelGroup(this,${n})">${n}</div>`).join('');
}
function bkSelGroup(el, n) {
  document.querySelectorAll('.bk-group-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  bk.groupSize = n;
  document.getElementById('bkGroupErr').style.display = 'none';
}
function bkGoGroup() {
  if (!bk.groupSize) { document.getElementById('bkGroupErr').style.display = 'block'; return; }
  bkGoPanel('bkP2');
  bkSetVipStepBar(3);
  bkUpdateGroupHint();
  bkBuildTimeGrid();
}

function bkUpdateGroupHint() {
  const hint = document.getElementById('bkGroupHint');
  hint.style.display = (isPs5Vip() && bk.groupSize >= 10) ? 'block' : 'none';
}
function bkTimeBack() {
  if (isPs5Vip()) {
    bkGoPanel('bkP1b');
    bkSetVipStepBar(2);
  } else if (isPc()) {
    bkGoPanel('bkP1c');
    bkSetStdStepBar(2);
  } else {
    bkGoPanel('bkP1');
    bkSwitchStepBars('ps5std');
    bkSetPs5StdStepBar(1);
  }
}
function bkBuildTimeGrid() {
  const g = document.getElementById('bkTimeGrid');
  g.innerHTML = BK_HOURS.map((h, i) => `<div class="bk-time-slot${bk.time === i ? ' sel' : ''}" onclick="bkSelTime(this,${i})">${h}</div>`).join('');
}
function bkSelTime(el, idx) {
  document.querySelectorAll('.bk-time-slot').forEach(s => s.classList.remove('sel'));
  el.classList.add('sel');
  bk.time = idx;
  document.getElementById('bkTimeErr').style.display = 'none';
  const max = bkMaxHours();
  if (bk.hours > max) bk.hours = max;
  bkRefreshDur();
}

function bkAdjHours(delta) {
  const max = bkMaxHours();
  let h = bk.hours + delta;
  if (h < 1) h = 1;
  if (h > max) h = max;
  bk.hours = h;
  document.getElementById('bkHourNum').textContent = h;
  document.getElementById('bkHourPrice').textContent = bkCalcPrice(h) + ' ₾';
}
function bkRefreshDur() {
  const max = bkMaxHours();
  if (bk.hours > max) bk.hours = max;
  const num = document.getElementById('bkHourNum');
  const price = document.getElementById('bkHourPrice');
  if (num) num.textContent = bk.hours;
  if (price) price.textContent = bkCalcPrice(bk.hours) + ' ₾';
  const hint = document.getElementById('bkHourMax');
  if (hint) hint.textContent = 'მაქს. ' + max + ' სთ';
}

function bkGo(n) {
  if (n === 3) {
    if (bk.time === null) { document.getElementById('bkTimeErr').style.display = 'block'; return; }
    document.getElementById('bkTimeErr').style.display = 'none';
  }
  if (n === 4) {
    bk.hours = parseInt(document.getElementById('bkHourNum').textContent) || 1;
    const d = bkDevData();
    document.getElementById('bkSumDev').textContent = d.name + ' — ' + d.sub;
    document.getElementById('bkSumDur').textContent = bk.hours + ' საათი';
    document.getElementById('bkSumDT').textContent = bkFormatDate(bk.date) + ' • ' + BK_HOURS[bk.time];
    document.getElementById('bkSumTotal').textContent = bkCalcPrice(bk.hours) + ' ₾';
    if (isPs5Vip() && bk.groupSize) {
      document.getElementById('bkSumGroupRow').style.display = 'flex';
      document.getElementById('bkSumGroup').textContent = bk.groupSize + ' კაცი';
    } else {
      document.getElementById('bkSumGroupRow').style.display = 'none';
    }
    if (isPc() && bk.pcCount) {
      document.getElementById('bkSumPcCountRow').style.display = 'flex';
      document.getElementById('bkSumPcCount').textContent = bk.pcCount + ' ერთეული';
    } else {
      document.getElementById('bkSumPcCountRow').style.display = 'none';
    }
  }
  bkGoPanel('bkP' + n);
  if (isPs5Vip()) {
    const vipMap = { 2: 3, 3: 4, 4: 5 };
    if (vipMap[n]) bkSetVipStepBar(vipMap[n]);
  } else if (isPc()) {
    const pcMap = { 2: 3, 3: 4, 4: 5 };
    if (pcMap[n]) bkSetStdStepBar(pcMap[n]);
  } else {
    const ps5Map = { 2: 2, 3: 3, 4: 4 };
    if (ps5Map[n]) bkSetPs5StdStepBar(ps5Map[n]);
  }
  if (n === 3) bkRefreshDur();
}

function bkFormatDate(d) {
  if (!d) return '—';
  const [y, m, dd] = d.split('-');
  const mo = ['იან','თებ','მარ','აპრ','მაი','ივნ','ივლ','აგვ','სექ','ოქტ','ნოე','დეკ'];
  return `${parseInt(dd)} ${mo[parseInt(m) - 1]} ${y}`;
}

// ========== GOOGLE SHEETS — DOUBLE BOOKING PREVENTION ==========
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbEB09USnNe9Go1WAob5ExzXs_H1EMVMPZPA1zWj9Pi4tKvhbmvOOuk8We8bM5Rt-J/exec';

function jsonp(params, timeoutMs) {
  timeoutMs = timeoutMs || 10000;
  return new Promise(function(resolve, reject) {
    var cbName = '_gs_cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    var script = document.createElement('script');
    var done = false;

    function cleanup() {
      done = true;
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[cbName] = function(data) {
      cleanup();
      resolve(data);
    };

    var timer = setTimeout(function() {
      if (!done) { cleanup(); reject(new Error('timeout — Apps Script გვიანობს')); }
    }, timeoutMs);

    script.onerror = function() {
      clearTimeout(timer);
      cleanup();
      reject(new Error('script load error'));
    };

    var qs = new URLSearchParams(Object.assign({}, params, { callback: cbName })).toString();
    script.src = GOOGLE_SCRIPT_URL + '?' + qs;
    document.head.appendChild(script);
  });
}

async function bkPay() {
  const name = document.getElementById('bkName').value.trim();
  if (!name) { document.getElementById('bkNameErr').style.display = 'block'; return; }
  document.getElementById('bkNameErr').style.display = 'none';

  const phone = document.getElementById('bkPhone').value.trim();
  const phoneDigits = phone.replace(/\D/g, '');
  if (!phone || phoneDigits.length < 9) { document.getElementById('bkPhoneErr').style.display = 'block'; return; }
  document.getElementById('bkPhoneErr').style.display = 'none';

  const d = bkDevData();
  const total = bkCalcPrice(bk.hours);
  const timeStr = BK_HOURS[bk.time];
  const pcCount = (isPc() && bk.pcCount) ? bk.pcCount : 1;

  let deviceName = d.name;
  if (isPc() && bk.pcCount) deviceName += ` (${bk.pcCount} PC)`;
  if (isPs5Vip() && bk.groupSize) deviceName += ` (${bk.groupSize} კაცი)`;

  const payBtn = document.querySelector('#bkP4 .btn-neon');
  const originalText = payBtn.textContent;
  payBtn.textContent = '⏳ მოწმდება...';
  payBtn.disabled = true;

  try {
    console.log('Checking availability...', { device: deviceName, date: bk.date, time: timeStr, hours: bk.hours, pcCount });

    const checkResult = await jsonp({
      action: 'check',
      device: deviceName,
      date: bk.date,
      time: timeStr,
      hours: bk.hours,
      pcCount: pcCount
    });

    console.log('CHECK RESULT:', JSON.stringify(checkResult));

    if (!checkResult.ok) {
      alert('❌ ' + (checkResult.message || 'ეს დრო უკვე დაჯავშნულია. გთხოვთ სხვა დრო ან თარიღი აირჩიოთ.'));
      return;
    }

    payBtn.textContent = '💾 ინახება...';

    const saveResult = await jsonp({
      action: 'book',
      name: name,
      phone: phone,
      device: deviceName,
      date: bk.date,
      time: timeStr,
      hours: bk.hours,
      total: total,
      pcCount: pcCount
    });

    console.log('SAVE RESULT:', JSON.stringify(saveResult));

    if (!saveResult.ok) {
      alert('❌ ' + (saveResult.message || 'ჯავშანი ვერ შეინახა — სლოტი დაიკავა. სცადეთ სხვა დრო.'));
    } else {
      alert(`✅ ჯავშანი წარმატებით შეინახა!\n\n${name}\n${phone}\n${deviceName}\n${bk.date} ${timeStr}\n${bk.hours} საათი\nსულ: ${total} ₾`);
    }

  } catch (err) {
    console.error('BOOKING ERROR:', err);
    alert('❌ კავშირის შეცდომა: ' + err.message);
  } finally {
    payBtn.textContent = originalText;
    payBtn.disabled = false;
  }
}

// ========== INIT BOOKING ==========
(function initBooking() {
  const di = document.getElementById('bkDate');
  const today = new Date().toISOString().split('T')[0];
  di.min = today;
  di.value = today;
  bk.date = today;
  di.addEventListener('change', e => { bk.date = e.target.value; });
  bkRefreshDur();
  bkBuildTimeGrid();
  bkSwitchStepBars('pc');
  bkSetStdStepBar(1);
})();
