// ============================================================
//  กระปุกมหัศจรรย์ — Google Apps Script API
//  Deploy as Web App: Execute as Me, Anyone can access
// ============================================================

// account = ชื่อธนาคาร (ใช้กับ bank และ BANK_ONLY เท่านั้น)
var TX_HEADERS = ['tx_id','kid_id','type','amount','note','timestamp','balance_after','account'];

// เพิ่มยอดกระปุก (นอกนั้นหักออก ยกเว้น BANK_ONLY ที่ไม่แตะกระปุกเลย) — frontend มีชุดเดียวกันใน src/lib/tx.js
var BALANCE_PLUS = ['deposit', 'daily', 'bonus', 'loan'];
var BANK_ONLY = ['bank_interest', 'bank_external']; // ดอกเบี้ย + เงินจากข้างนอกเข้าบัญชีตรง (ไม่เคยผ่านกระปุก)

// ── setupSheet ── รันครั้งเดียวเพื่อสร้าง headers + ข้อมูลเริ่มต้น ──
function setupSheet() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  var ss = SpreadsheetApp.openById(id);

  function initSheet(name, headers, rows) {
    var sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    sh.clearContents();
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (rows.length > 0) {
      sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
  }

  initSheet('kids',
    ['kid_id','name','avatar','daily_amount','last_daily_date','loan_limit'],
    [
      ['tae',  'Tae',  'tae.jpg',  20, '2026-01-01', 200],
      ['taey', 'Taey', 'taey.jpg', 20, '2026-01-01', 200],
    ]
  );

  initSheet('transactions', TX_HEADERS, []);

  initSheet('goals',
    ['goal_id','kid_id','name','target_amount','emoji'],
    [
      ['g1', 'tae',  'เลโก้ชุดใหม่', 2000, '🏗️'],
      ['g2', 'taey', 'ตุ๊กตา',       1500, '🧸'],
    ]
  );

  initSheet('loans',
    ['loan_id','kid_id','amount','remaining','due_date','status'],
    []
  );

  Logger.log('✅ Setup complete!');
}

// ── resetAndSeed ── ล้าง transactions + รีเซ็ต daily date + ใส่ 200 บาทเริ่มต้น ──
function resetAndSeed() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  var ss = SpreadsheetApp.openById(id);

  // ล้าง transactions ทั้งหมด แล้วใส่ headers ใหม่
  var txSh = ss.getSheetByName('transactions');
  txSh.clearContents();
  txSh.getRange(1, 1, 1, TX_HEADERS.length).setValues([TX_HEADERS]);

  // ใส่เงินเริ่มต้น 200 บาท
  var now = new Date().toISOString();
  txSh.appendRow([Utilities.getUuid(), 'tae',  'deposit', 200, 'เงินก้นถัง', now, 200]);
  txSh.appendRow([Utilities.getUuid(), 'taey', 'deposit', 200, 'เงินก้นถัง', now, 200]);

  // รีเซ็ต last_daily_date เป็นวันนี้ (ไม่ให้ daily วิ่งซ้ำ)
  var todayStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  var kidsSh = ss.getSheetByName('kids');
  var kidRows = kidsSh.getDataRange().getValues();
  var kidHeaders = kidRows[0];
  for (var i = 1; i < kidRows.length; i++) {
    kidsSh.getRange(i + 1, kidHeaders.indexOf('last_daily_date') + 1).setValue(todayStr);
  }

  Logger.log('✅ resetAndSeed done! ยอดเงินเริ่มต้น 200 บาท / คน');
}

function getSheet(name) {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return SpreadsheetApp.openById(id).getSheetByName(name);
}

// ชีตเดิมมี 7 คอลัมน์ — เติม header ที่ขาดก่อนเขียนแถวที่ยาวขึ้น
// (ค่าในคอลัมน์ที่ไม่มีชื่อ getTransactions/getKid จะมองไม่เห็น)
function ensureTxHeaders_(sheet) {
  var width = Math.max(sheet.getLastColumn(), TX_HEADERS.length);
  var current = sheet.getRange(1, 1, 1, width).getValues()[0];
  for (var c = 0; c < TX_HEADERS.length; c++) {
    if (current[c] === TX_HEADERS[c]) continue;
    if (current[c] === '') { sheet.getRange(1, c + 1).setValue(TX_HEADERS[c]); continue; }
    throw new Error('transactions header mismatch at column ' + (c + 1) + ': ' + current[c]);
  }
}

// ── migrateBankRows ── รันครั้งเดียวจาก editor
// แถว "ฝากscb" ที่เคยบันทึกเป็น withdraw → bank / SCB (ยอดกระปุกไม่เปลี่ยน เพราะหักออกเหมือนกัน) · รันซ้ำได้ ไม่แก้ซ้ำ
function migrateBankRows() {
  var sheet = getSheet('transactions');
  ensureTxHeaders_(sheet);
  var rows = sheet.getDataRange().getValues();
  var h = rows[0];
  var typeCol = h.indexOf('type'), noteCol = h.indexOf('note'), acctCol = h.indexOf('account');
  var n = 0;
  for (var i = 1; i < rows.length; i++) {
    var note = String(rows[i][noteCol]).replace(/\s+/g, '').toLowerCase();
    if (rows[i][typeCol] !== 'withdraw' || note !== 'ฝากscb') continue;
    sheet.getRange(i + 1, typeCol + 1).setValue('bank');
    sheet.getRange(i + 1, acctCol + 1).setValue('SCB');
    n++;
  }
  Logger.log('migrateBankRows: แก้ ' + n + ' แถว');
}

// Handle CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function jsonOk(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonErr(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── dailyJob ── triggered by Apps Script time-driven trigger at 5am ──
function dailyJob() {
  ['tae', 'taey'].forEach(function(kid_id) {
    try { _checkDailyInner(kid_id); } catch(e) { Logger.log('dailyJob error ' + kid_id + ': ' + e.message); }
  });
}

// ── GET router (handles everything — no CORS preflight) ─────
function doGet(e) {
  try {
    var p = e.parameter;
    switch (p.action) {
      case 'getAll':          return jsonOk(getAll(p.kid_id, Number(p.days) || 30));
      case 'getKid':          return jsonOk(getKid(p.kid_id));
      case 'getTransactions': return jsonOk(getTransactions(p.kid_id, Number(p.days) || 30));
      case 'getGoals':        return jsonOk(getGoals(p.kid_id));
      case 'addTransaction':  return jsonOk(addTransaction({ kid_id: p.kid_id, type: String(p.type), amount: Number(p.amount), note: p.note || '', account: p.account || '', date: p.date || '' }));
      case 'checkDaily':      return jsonOk(checkDaily(p.kid_id));
      case 'setGoal':         return jsonOk(setGoal({ kid_id: p.kid_id, goal_id: p.goal_id, name: p.name, target_amount: p.target_amount, emoji: p.emoji }));
      default:                return jsonErr('Unknown action: ' + p.action);
    }
  } catch (err) {
    return jsonErr(err.message);
  }
}

// ── getAll ── 1 call แทน 3 ────────────────────────────────
function getAll(kid_id, days) {
  var kid = getKid(kid_id);
  var transactions = getTransactions(kid_id, days);
  var goals = getGoals(kid_id);
  return { kid: kid, transactions: transactions, goals: goals };
}

// ── getKid ───────────────────────────────────────────────────
function getKid(kid_id) {
  var sheet = getSheet('kids');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var kidRow = null;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf('kid_id')] === kid_id) {
      kidRow = rows[i];
      break;
    }
  }
  if (!kidRow) throw new Error('Kid not found: ' + kid_id);

  var kid = {};
  headers.forEach(function(h, j) { kid[h] = kidRow[j]; });

  // Compute balance from transactions
  var txSheet = getSheet('transactions');
  var txRows = txSheet.getDataRange().getValues();
  var txHeaders = txRows[0];
  var balance = 0;
  var bankTotal = 0; // ยอดในธนาคารทั้งหมด (ฝาก + ดอกเบี้ย) — ออกจากกระปุกแล้ว แต่ยังเป็นเงินออม
  var bankBy = {};   // แยกตามชื่อธนาคาร
  var accountIdx = txHeaders.indexOf('account');
  var streak = 0;
  var dailyDates = [];

  for (var i = 1; i < txRows.length; i++) {
    var row = txRows[i];
    var rowKid = row[txHeaders.indexOf('kid_id')];
    if (rowKid !== kid_id) continue;
    var type = row[txHeaders.indexOf('type')];
    var amount = Number(row[txHeaders.indexOf('amount')]);
    if (BALANCE_PLUS.indexOf(type) !== -1) balance += amount;
    else if (BANK_ONLY.indexOf(type) === -1) balance -= amount;
    if (type === 'bank' || BANK_ONLY.indexOf(type) !== -1) {
      var acct = (accountIdx === -1 ? '' : String(row[accountIdx]).trim()) || 'ธนาคาร';
      bankTotal += amount;
      bankBy[acct] = (bankBy[acct] || 0) + amount;
    }
    if (type === 'daily' || type === 'deposit') {
      var ts = row[txHeaders.indexOf('timestamp')];
      dailyDates.push(String(ts).slice(0, 10));
    }
  }

  // Compute streak
  dailyDates = dailyDates.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort().reverse();
  var today = new Date();
  var streakCount = 0;
  for (var d = 0; d < dailyDates.length; d++) {
    var expected = new Date(today);
    expected.setDate(expected.getDate() - d);
    var exp = Utilities.formatDate(expected, 'Asia/Bangkok', 'yyyy-MM-dd');
    if (dailyDates[d] === exp) streakCount++;
    else break;
  }

  // Active loans
  var loanSheet = getSheet('loans');
  var loanRows = loanSheet.getDataRange().getValues();
  var loanHeaders = loanRows[0];
  var loans = [];
  for (var i = 1; i < loanRows.length; i++) {
    if (loanRows[i][loanHeaders.indexOf('kid_id')] === kid_id &&
        loanRows[i][loanHeaders.indexOf('status')] === 'active') {
      var loan = {};
      loanHeaders.forEach(function(h, j) { loan[h] = loanRows[i][j]; });
      loans.push(loan);
    }
  }

  kid.balance = balance;
  kid.bank_total = Math.round(bankTotal * 100) / 100;
  kid.banks = Object.keys(bankBy).map(function(name) {
    return { name: name, total: Math.round(bankBy[name] * 100) / 100 };
  });
  kid.streak = streakCount;
  kid.loans = loans;
  return kid;
}

// ── getTransactions ──────────────────────────────────────────
function getTransactions(kid_id, days) {
  var sheet = getSheet('transactions');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  var results = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf('kid_id')] !== kid_id) continue;
    var ts = new Date(rows[i][headers.indexOf('timestamp')]);
    if (ts < cutoff) continue;
    var tx = {};
    headers.forEach(function(h, j) { tx[h] = rows[i][j]; });
    results.push(tx);
  }
  return results.reverse();
}

// ── getGoals ─────────────────────────────────────────────────
function getGoals(kid_id) {
  var sheet = getSheet('goals');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var results = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][headers.indexOf('kid_id')] !== kid_id) continue;
    var g = {};
    headers.forEach(function(h, j) { g[h] = rows[i][j]; });
    results.push(g);
  }
  return results;
}

// ── addTransaction ───────────────────────────────────────────
function addTransaction(body) {
  var kid_id = body.kid_id;
  var type   = body.type;
  var amount = Number(body.amount);
  var note   = body.note || '';
  var account = String(body.account || '').trim();
  var isBankType = type === 'bank' || BANK_ONLY.indexOf(type) !== -1;

  // Compute current balance
  var kidData = getKid(kid_id);
  var balance = kidData.balance;

  // Validation
  if (['withdraw', 'loan_repay', 'bank'].indexOf(type) !== -1 && amount > balance)
    throw new Error('Insufficient balance');
  if (isBankType && !account) throw new Error('Missing bank account');
  if (isBankType && !(amount > 0)) throw new Error('Invalid amount');
  if (type === 'loan') {
    var loanRemaining = kidData.loans.reduce(function(s, l) { return s + Number(l.remaining); }, 0);
    if (loanRemaining + amount > Number(kidData.loan_limit || 200))
      throw new Error('Loan limit exceeded');
  }

  var newBalance = balance;
  if (BALANCE_PLUS.indexOf(type) !== -1) newBalance += amount;
  else if (BANK_ONLY.indexOf(type) === -1) newBalance -= amount;

  var tx_id = Utilities.getUuid();
  var timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mm:ss+07:00");
  // BANK_ONLY ลงวันที่ที่เข้าบัญชีจริงได้ (ย้อนหลังได้ ห้ามล่วงหน้า) — ไม่แตะกระปุก จึงไม่ทำให้ balance_after ย้อนหลังผิด
  if (BANK_ONLY.indexOf(type) !== -1 && body.date) {
    var today = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date) || body.date > today) throw new Error('Invalid date');
    timestamp = body.date + 'T12:00:00+07:00';
  }
  var sheet = getSheet('transactions');
  ensureTxHeaders_(sheet);
  sheet.appendRow([tx_id, kid_id, type, amount, note, timestamp, newBalance, isBankType ? account : '']);

  // If loan_repay, update loans remaining
  if (type === 'loan_repay') {
    var loanSheet = getSheet('loans');
    var loanRows = loanSheet.getDataRange().getValues();
    var loanHeaders = loanRows[0];
    var toRepay = amount;
    for (var i = 1; i < loanRows.length && toRepay > 0; i++) {
      if (loanRows[i][loanHeaders.indexOf('kid_id')] === kid_id &&
          loanRows[i][loanHeaders.indexOf('status')] === 'active') {
        var rem = Number(loanRows[i][loanHeaders.indexOf('remaining')]);
        var pay = Math.min(rem, toRepay);
        var newRem = rem - pay;
        loanSheet.getRange(i + 1, loanHeaders.indexOf('remaining') + 1).setValue(newRem);
        if (newRem === 0) {
          loanSheet.getRange(i + 1, loanHeaders.indexOf('status') + 1).setValue('paid');
        }
        toRepay -= pay;
      }
    }
  }

  // If loan, add to loans sheet
  if (type === 'loan') {
    var loanSheet = getSheet('loans');
    var loan_id = Utilities.getUuid();
    var dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    loanSheet.appendRow([loan_id, kid_id, amount, amount, Utilities.formatDate(dueDate, 'Asia/Bangkok', 'yyyy-MM-dd'), 'active']);
  }

  return { success: true, tx_id: tx_id, balance_after: newBalance };
}

// ── checkDaily ───────────────────────────────────────────────
function checkDaily(kid_id) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { added: false };
  try { return _checkDailyInner(kid_id); } finally { lock.releaseLock(); }
}

function _checkDailyInner(kid_id) {
  var todayStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');

  // Check transactions directly — more reliable than last_daily_date field
  var txSheet = getSheet('transactions');
  var txRows = txSheet.getDataRange().getValues();
  var txHeaders = txRows[0];
  var kidIdx = txHeaders.indexOf('kid_id');
  var typeIdx = txHeaders.indexOf('type');
  var tsIdx = txHeaders.indexOf('timestamp');
  for (var i = 1; i < txRows.length; i++) {
    if (txRows[i][kidIdx] !== kid_id) continue;
    if (txRows[i][typeIdx] !== 'daily') continue;
    var tsRaw = txRows[i][tsIdx];
    var tsBkk = (tsRaw instanceof Date)
      ? Utilities.formatDate(tsRaw, 'Asia/Bangkok', 'yyyy-MM-dd')
      : Utilities.formatDate(new Date(String(tsRaw)), 'Asia/Bangkok', 'yyyy-MM-dd');
    if (tsBkk === todayStr) return { added: false };
  }

  // Get daily amount from kids sheet
  var kSheet = getSheet('kids');
  var kRows = kSheet.getDataRange().getValues();
  var kHeaders = kRows[0];
  var dailyAmount = 20;
  for (var j = 1; j < kRows.length; j++) {
    if (kRows[j][kHeaders.indexOf('kid_id')] === kid_id) {
      dailyAmount = Number(kRows[j][kHeaders.indexOf('daily_amount')]);
      break;
    }
  }

  addTransaction({ kid_id: kid_id, type: 'daily', amount: dailyAmount, note: 'เงินรายวัน' });
  return { added: true, amount: dailyAmount };
}


// ── setGoal ──────────────────────────────────────────────────
function setGoal(body) {
  var sheet = getSheet('goals');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];

  if (body.goal_id) {
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][headers.indexOf('goal_id')] === body.goal_id) {
        if (body.name)          sheet.getRange(i+1, headers.indexOf('name')+1).setValue(body.name);
        if (body.target_amount) sheet.getRange(i+1, headers.indexOf('target_amount')+1).setValue(Number(body.target_amount));
        if (body.emoji)         sheet.getRange(i+1, headers.indexOf('emoji')+1).setValue(body.emoji);
        return { success: true, goal_id: body.goal_id };
      }
    }
  }

  // New goal
  var goal_id = Utilities.getUuid();
  sheet.appendRow([goal_id, body.kid_id, body.name, Number(body.target_amount), body.emoji || '🎯']);
  return { success: true, goal_id: goal_id };
}
