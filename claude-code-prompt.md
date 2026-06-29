# 🐷 กระปุกมหัศจรรย์ — Claude Code Prompt

## สิ่งที่ต้องการ
สร้าง PWA (Progressive Web App) สำหรับเด็ก 2 คน ใช้ออมเงิน/ใช้เงิน
ดีไซน์สไตล์เกม มืด สนุก ไม่ใช่ app ธนาคาร
ข้อมูลเก็บใน Google Sheets ผ่าน Google Apps Script

---

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS (PWA)
- **Backend:** Google Apps Script (Web App) เป็น REST API
- **Database:** Google Sheets
- **Deploy:** Vercel (free)

---

## ข้อมูลเด็ก
| kid_id | ชื่อ  | รูป       | theme gradient                        | emoji |
|--------|-------|-----------|---------------------------------------|-------|
| tae    | Tae   | tae.jpg   | linear-gradient(160deg,#FF6B9D,#FF9A3C) | 🎮   |
| taey   | Taey  | taey.jpg  | linear-gradient(160deg,#4FC3F7,#7C4DFF) | 🦉   |

---

## โครงสร้าง Google Sheets

### Sheet 1: `kids`
| kid_id | name | avatar | daily_amount | last_daily_date | loan_limit |
|--------|------|--------|--------------|-----------------|------------|
| tae    | Tae  | tae.jpg  | 20         | 2026-06-28      | 200        |
| taey   | Taey | taey.jpg | 20         | 2026-06-28      | 200        |

### Sheet 2: `transactions`
| tx_id | kid_id | type       | amount | note        | timestamp           | balance_after |
|-------|--------|------------|--------|-------------|---------------------|---------------|
| uuid  | tae    | daily      | 20     | เงินรายวัน  | 2026-06-28T08:00:00 | 1240          |
| uuid  | tae    | deposit    | 50     | วันเกิด     | 2026-06-27T15:00:00 | 1220          |
| uuid  | tae    | withdraw   | 35     | ซื้อไอติม   | 2026-06-26T14:00:00 | 1170          |
| uuid  | tae    | loan       | 150    | ซื้อการ์ด  | 2026-06-25T13:00:00 | 1205          |
| uuid  | tae    | bonus      | 50     | ช่วยงานบ้าน | 2026-06-24T18:00:00 | 1055          |
| uuid  | tae    | loan_repay | 100    | จ่ายคืน     | 2026-06-23T10:00:00 | 1005          |

### Sheet 3: `goals`
| goal_id | kid_id | name         | target_amount | emoji |
|---------|--------|--------------|---------------|-------|
| g1      | tae    | เลโก้ชุดใหม่ | 2000          | 🏗️    |
| g2      | taey   | ตุ๊กตา       | 1500          | 🧸    |

### Sheet 4: `loans`
| loan_id | kid_id | amount | remaining | due_date   | status |
|---------|--------|--------|-----------|------------|--------|
| l1      | tae    | 150    | 150       | 2026-07-05 | active |

---

## Google Apps Script API (Code.gs)

สร้าง Web App ที่ handle GET และ POST:

```
GET  ?action=getKid&kid_id=tae             → ข้อมูล kid + balance + loan + streak
GET  ?action=getTransactions&kid_id=tae&days=30 → รายการย้อนหลัง
GET  ?action=getGoals&kid_id=tae           → เป้าหมาย
POST action=addTransaction                 → deposit/withdraw/loan/bonus/loan_repay
POST action=checkDaily                     → เช็ค+เพิ่ม daily ถ้ายังไม่ได้วันนี้
POST action=setGoal                        → เพิ่ม/แก้ไขเป้าหมาย
```

### Business Logic:
1. **Balance** = SUM จาก transactions ทั้งหมด (ไม่เก็บแยก)
2. **Daily allowance** = เช็ค last_daily_date ถ้าไม่ใช่วันนี้ → เพิ่ม tx `daily` → update date
3. **Loan limit** = remaining รวมทุก active loans ต้องไม่เกิน 200฿
4. **Streak** = นับวันติดต่อกันที่มี tx ประเภท daily หรือ deposit
5. **CORS headers** ทุก response

---

## Frontend Structure

```
src/
├── App.jsx
├── screens/
│   ├── PickScreen.jsx       # เลือกเด็ก
│   └── MainScreen.jsx       # หน้าหลัก + bottom nav
├── components/
│   ├── BalanceHero.jsx      # avatar + ยอดเงิน + badge
│   ├── SavingsChart.jsx     # recharts LineChart 7d/30d
│   ├── StreakBar.jsx
│   ├── GoalCard.jsx
│   ├── LoanWarning.jsx
│   ├── ActionGrid.jsx       # 4 ปุ่ม
│   ├── TransactionFeed.jsx
│   └── ActionModal.jsx      # bottom sheet
├── hooks/
│   ├── useKidData.js
│   └── useDaily.js          # trigger daily check เมื่อเปิดแอพ
├── lib/
│   └── api.js               # Apps Script API wrapper
└── assets/
    ├── tae.jpg              # รูปการ์ตูนเด็กชาย (400x400)
    └── taey.jpg             # รูปการ์ตูนเด็กหญิง (400x400)
```

---

## Design System

```css
/* Colors */
--dark:   #1A1A2E
--card:   rgba(255,255,255,0.08)
--green:  #00C853
--red:    #FF3D00
--gold:   #FFD600
--purple: #9C27B0

/* Kid themes */
tae:  linear-gradient(160deg, #FF6B9D, #FF9A3C)
taey: linear-gradient(160deg, #4FC3F7, #7C4DFF)

/* Font: 'Mitr' จาก Google Fonts ทุกที่ */

/* Avatar image style */
img.avatar {
  width: 120px;
  height: 120px;
  border-radius: 28px;
  object-fit: cover;
  object-position: center top;
}

/* Cards */
border-radius: 20-28px
backdrop-filter: blur(12px)
border: 1px solid rgba(255,255,255,0.1)
```

---

## หน้า PickScreen

```
┌─────────────────────────────┐
│   ✨ กระปุกมหัศจรรย์ ✨      │
│   ใครจะเปิดกระปุกวันนี้?    │
│  (พื้นหลังดาวกระพริบ)        │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │ [tae.jpg]│ │[taey.jpg]│  │
│  │   Tae    │ │   Taey   │  │
│  │ 1,240 ฿  │ │ 2,850 ฿  │  │
│  │👆แตะเลย! │ │👆แตะเลย! │  │
│  └──────────┘ └──────────┘  │
└─────────────────────────────┘
```

- การ์ดซ้าย: gradient ชมพู-ส้ม (tae)
- การ์ดขวา: gradient ฟ้า-ม่วง (taey)
- รูป avatar: border-radius: 20px, object-fit: cover, object-position: center top

---

## หน้า MainScreen

```
┌─────────────────────────────┐
│ ←  Tae 🎮              🔔  │  ← header gradient ตาม kid
│   [tae.jpg avatar วนลอย]   │
│     ยอดเงินในกระปุก          │
│       1,240 บาท             │
│    📈 +20 บาท วันนี้        │
├─────────────────────────────┤
│ 🔥 ออมติดต่อกัน 5 วัน  [5] │
├─────────────────────────────┤
│ 📈 กราฟเงินออม  [7วัน][30วัน]│
│  [recharts LineChart]       │
│  😊 เงินเพิ่มขึ้นเรื่อยๆ!   │
├─────────────────────────────┤
│ [💰ออม][🛍️ใช้][⭐โบนัส]    │
├─────────────────────────────┤
│ 🎯 เลโก้ชุดใหม่  62%  🚀   │
│ [████████░░░░]              │
├─────────────────────────────┤
│ 💜 ยืมอยู่ 150฿  [จ่ายคืน] │
├─────────────────────────────┤
│ [💰ฝาก] [🛒ใช้]            │
│ [🤝ยืม] [⭐โบนัส]          │
├─────────────────────────────┤
│ 📋 รายการล่าสุด             │
│ [tx rows...]                │
├─────────────────────────────┤
│  🏠    📊    🎯    🏆       │
└─────────────────────────────┘
```

---

## ActionModal (bottom sheet)

- slide up animation: cubic-bezier(0.34,1.56,0.64,1)
- inputmode="numeric" สำหรับ amount
- quick buttons: 20 / 50 / 100 / 200
- note input (optional)
- validation:
  - withdraw: amount ≤ balance
  - loan: (existing remaining + amount) ≤ 200
  - loan_repay: amount ≤ balance และ ≤ remaining loan

---

## SavingsChart

```javascript
// recharts LineChart
// สีเส้นเปลี่ยนตามทิศทาง
const trend = data[data.length-1] - data[data.length-2]
const color = trend >= 0 ? '#00C853' : '#FF3D00'

// gradient fill ใต้เส้น (opacity 0.3)
// จุดสุดท้ายกระพริบ (animated dot)

// Mood message
if (trend < -200)  → 😱 "เงินลดฮวบเลย! ระวังด้วยนะ! 🙏"
if (trend < 0)     → 😟 "เงินลดลงนิดหน่อย ประหยัดกว่านี้ได้นะ 💸"
if (trend > 300)   → 🤩 "เยี่ยมมาก! ออมเก่งสุดๆ! 🚀"
else               → 😊 "เงินเพิ่มขึ้นเรื่อยๆ เก่งมาก! 💪"
```

---

## Daily Allowance

```javascript
// useDaily.js — เรียกทุกครั้งที่เปิดแอพ
async function checkAndAddDaily(kid_id) {
  const res = await api.post('checkDaily', { kid_id })
  // Apps Script: ถ้า last_daily_date ≠ วันนี้
  //   → INSERT tx type='daily', amount=daily_amount
  //   → UPDATE last_daily_date = today
  //   → return { added: true, amount: 20 }
  // ถ้าได้แล้ว → { added: false }
  if (res.added) showToast(`🎉 ได้รับเงินรายวัน +${res.amount} บาท!`)
}
```

---

## Animations
- `float`: avatar วนลอยขึ้นลง (3s ease-in-out infinite)
- `shake`: streak fire สั่น (0.5s alternate infinite)
- `slideUp`: modal เปิด cubic-bezier(0.34,1.56,0.64,1)
- `twinkle`: ดาวกระพริบใน PickScreen
- `glowPulse`: จุดสุดท้ายในกราฟ

---

## PWA Config

```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'กระปุกมหัศจรรย์',
    short_name: 'กระปุก',
    theme_color: '#1A1A2E',
    background_color: '#1A1A2E',
    display: 'standalone',
    orientation: 'portrait',
    icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }]
  }
})
```

---

## ไม่ต้องทำ (out of scope)
- ❌ Login / auth
- ❌ Admin panel
- ❌ Push notifications
- ❌ หน้า Stats / Goals / Rewards (bottom nav ทำ placeholder)

---

## ไฟล์ที่ต้องส่งมอบ
1. `src/` — React PWA ครบ
2. `apps-script/Code.gs` — Google Apps Script ครบทุก endpoint
3. `README.md` — วิธี deploy ทีละขั้น (Sheet → Apps Script URL → Vercel)
4. `public/assets/tae.jpg` + `taey.jpg` — ใส่รูปที่ให้ไว้

