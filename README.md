# กระปุกมหัศจรรย์ 🐷

PWA ออมเงินสำหรับเด็ก 2 คน — Tae & Taey

## Deploy ทีละขั้น

### ขั้นที่ 1 — สร้าง Google Sheet

1. ไปที่ [Google Sheets](https://sheets.google.com) → สร้าง Spreadsheet ใหม่
2. สร้าง 4 sheets ตามชื่อและ columns นี้:

**Sheet: `kids`**
```
kid_id | name | avatar | daily_amount | last_daily_date | loan_limit
tae    | Tae  | tae.jpg| 20           | 2026-06-28      | 200
taey   | Taey | taey.jpg| 20          | 2026-06-28      | 200
```

**Sheet: `transactions`**
```
tx_id | kid_id | type | amount | note | timestamp | balance_after
```
(เพิ่ม row ตัวอย่างได้เลย)

**Sheet: `goals`**
```
goal_id | kid_id | name | target_amount | emoji
g1      | tae    | เลโก้ชุดใหม่ | 2000 | 🏗️
g2      | taey   | ตุ๊กตา | 1500 | 🧸
```

**Sheet: `loans`**
```
loan_id | kid_id | amount | remaining | due_date | status
```

3. Copy **Spreadsheet ID** จาก URL:
   `https://docs.google.com/spreadsheets/d/**[SPREADSHEET_ID]**/edit`

---

### ขั้นที่ 2 — Deploy Google Apps Script

1. เปิด Sheet → **Extensions → Apps Script**
2. ลบโค้ดเดิมทั้งหมด แล้ว copy โค้ดจาก `apps-script/Code.gs` ใส่
3. ไปที่ **Project Settings** (ไอคอนเฟือง) → **Script Properties**
4. เพิ่ม property:
   - Key: `SHEET_ID`
   - Value: Spreadsheet ID ที่ copy ไว้
5. กลับมาที่ Editor → **Deploy → New deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
6. Copy **Web App URL** ที่ได้ (รูปแบบ `https://script.google.com/macros/s/.../exec`)

---

### ขั้นที่ 3 — เตรียม Frontend

```bash
# clone / เปิด folder นี้
npm install

# สร้างไฟล์ .env.local
cp .env.example .env.local
# แล้วแก้ VITE_APPS_SCRIPT_URL= ใส่ URL จากขั้นที่ 2
```

วางรูป `tae.jpg` และ `taey.jpg` ไว้ที่ `public/assets/`

```bash
# ทดสอบ local
npm run dev

# build
npm run build
```

---

### ขั้นที่ 4 — Deploy บน Vercel

1. Push code ขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) → New Project → Import repo
3. เพิ่ม Environment Variable:
   - `VITE_APPS_SCRIPT_URL` = Web App URL จากขั้นที่ 2
4. Click **Deploy** ✅

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts |
| PWA | vite-plugin-pwa |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Deploy | Vercel (free) |
| Font | Mitr (Google Fonts) |

## โครงสร้างโปรเจกต์

```
src/
├── App.jsx
├── screens/
│   ├── PickScreen.jsx      # เลือกเด็ก (หน้าแรก)
│   └── MainScreen.jsx      # หน้าหลัก + bottom nav
├── components/
│   ├── BalanceHero.jsx     # avatar + ยอดเงิน
│   ├── SavingsChart.jsx    # กราฟ recharts 7d/30d
│   ├── StreakBar.jsx
│   ├── GoalCard.jsx
│   ├── LoanWarning.jsx
│   ├── ActionGrid.jsx      # 4 ปุ่มหลัก
│   ├── TransactionFeed.jsx
│   └── ActionModal.jsx     # bottom sheet
├── hooks/
│   ├── useKidData.js
│   └── useDaily.js
└── lib/
    └── api.js
apps-script/
└── Code.gs                 # Google Apps Script ทั้งหมด
public/
└── assets/
    ├── tae.jpg
    └── taey.jpg
```
