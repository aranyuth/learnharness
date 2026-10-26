# 🚀 Antigravity (AGY) Bridge Integration & RAM Process Architecture
# คู่มือการเชื่อมต่อ AGY Bridge ผ่าน Process กลางบน RAM สำหรับ LearnHarness, Hermes และแอป AI ทุกค่าย

> **เอกสารสรุปสถาปัตยกรรมและการตั้งค่าถาวร:** เพื่อให้สามารถนำ LearnHarness, Hermes หรือไคลเอนต์ AI ตัวอื่นเชื่อมต่อกับโมเดลบน Google Antigravity (AGY) ผ่าน Background Process เดียวกันบน RAM โดยไม่ต้องเสียค่าบริการ API และไม่ต้องตั้งค่าใหม่จากศูนย์

---

## 📌 1. ภาพรวมสถาปัตยกรรม (Architecture Overview)

ระบบใช้สถาปัตยกรรม **"Single-Process Local API Gateway"** โดยรันสคริปต์ `antigravity_bridge.py` ค้างไว้บน RAM ผ่าน `pythonw.exe` ในฐานะ Background Process กลาง ทำหน้าที่แปลงคำขอมาตรฐาน OpenAI REST API (`/v1/chat/completions`) และ Anthropic (`/v1/messages`) ไปสั่งการ **Antigravity (`agy`) CLI** บนเครื่องโดยตรง

```mermaid
flowchart TD
    subgraph RAM["RAM (Background Resident Process)"]
        AGY_BRIDGE["antigravity_bridge.py (PID 51628)\nPort: 8000 | Multi-threaded HTTP Server"]
        AGY_CLI["Local Google Antigravity CLI (agy)\nActive Logged-in Google / Gemini Session"]
        AGY_BRIDGE -->|Execute CLI / Session| AGY_CLI
    end

    subgraph CLIENTS["AI Client Applications (Concurrent Access)"]
        HERMES["Hermes Agent\n(port 2607 / cli gateway)"]
        LEARNHARNESS["LearnHarness\n(Desktop Electron / Next.js Web)"]
        OTHERS["Cursor / Continue / Chatbox\n(Any OpenAI-compatible tool)"]
    end

    HERMES -->|HTTP Bearer agy-bridge| AGY_BRIDGE
    LEARNHARNESS -->|HTTP Bearer agy-bridge| AGY_BRIDGE
    OTHERS -->|HTTP Bearer agy-bridge| AGY_BRIDGE
    AGY_CLI -->|Google AI Cloud (Free Quota)| CLOUD["Google / Gemini Cloud Models\n(Gemini 3.8, Gemini 3.7, Claude Sonnet/Opus)"]
```

### 💎 ข้อดีหลัก (Core Benefits)
1. **Zero Duplicate Overhead (ประหยัด RAM สูงสุด):** ทั้ง LearnHarness, Hermes และเครื่องมืออื่นๆ แชร์ Process เดียวกันบน RAM (~30-40 MB) ไม่ต้องเปิดหลายตัว
2. **Zero API Cost (ฟรี 100%):** ใช้สิทธิ์การใช้งานของ Google Antigravity CLI บัญชีที่ล็อกอินอยู่บนเครื่อง ไม่ต้องจ่ายเงินหรือใช้บัตรเครดิตเติมเครดิต API
3. **High Performance & Multi-threaded:** รองรับคำขอแบบพร้อมกัน (Concurrent Requests) ทั้งจาก Hermes และ LearnHarness ได้อย่างไร้รอยต่อ

---

## ⚙️ 2. ข้อมูลการเชื่อมต่อเครือข่าย (Connection Credentials)

ทุกแอปพลิเคชันที่ต้องการเชื่อมต่อให้ใช้ค่าเดียวกันดังนี้:

| ค่า Config | ค่าที่ต้องกำหนด | คำอธิบาย |
| :--- | :--- | :--- |
| **Protocol** | `HTTP` | Local Loopback REST API |
| **Endpoint / Base URL** | `http://127.0.0.1:8000/v1` | URL หลักสำหรับ OpenAI Compatible API |
| **API Key / Bearer Token** | `agy-bridge` | รหัสผ่านภายในสำหรับ Local Bridge |
| **Script Path บนเครื่อง** | `C:\Users\lenovo\antigravity-bridge\antigravity_bridge.py` | ตัวสคริปต์บริดจ์หลัก |
| **Python Runtime** | `pythonw.exe` (เช่น `C:\Python314\pythonw.exe`) | รันแบบไร้หน้าต่างดำ (Windowless) |

---

## 🧠 3. โมเดลที่รองรับในระบบ (Supported Models)

เมื่อเชื่อมต่อผ่าน Bridge จะสามารถเลือกใช้โมเดลเหล่านี้ได้ทันที:

- **Gemini Series:**
  - `gemini-3.8-flash`
  - `gemini-3.8-flash-high` / `gemini-3.8-flash-medium` / `gemini-3.8-flash-low`
  - `gemini-3.7-flash` / `gemini-3.7-flash-medium` / `gemini-3.7-flash-high`
  - `gemini-3.6-flash-high` / `gemini-3.5-flash`
  - `gemini-3.1-pro-high` / `gemini-3.1-pro`
- **Claude Series (ผ่าน Antigravity):**
  - `claude-sonnet-4.6-thinking` / `claude-sonnet-4.6`
  - `claude-opus-4.6-thinking` / `claude-opus-4.6`
- **Open-weights & Others:**
  - `gemma4`, `gemma`, `qwen2.5:7b`, `gpt-oss-120b-medium`, `antigravity`, `agy`

*(ตรวจสอบรายชื่อโมเดลล่าสุดได้ตลอดเวลาผ่านคำสั่ง `curl -H "Authorization: Bearer agy-bridge" http://127.0.0.1:8000/v1/models`)*

---

## 🛠️ 4. สคริปต์ควบคุมและตรวจสอบ (Ready-to-use Control Scripts)

มีสคริปต์อัตโนมัติจัดเตรียมไว้ในโฟลเดอร์ `scripts/`:

1. **ตรวจสอบว่า Bridge ทำงานอยู่บน RAM หรือไม่:**
   ```cmd
   scripts\check-agy-bridge.bat
   ```
   *จะแสดงสถานะสีเขียว พร้อมจำนวนโมเดลทั้งหมด 37+ โมเดลทันที*

2. **สั่งเปิด Bridge ขึ้น RAM หากยังไม่เปิด:**
   ```cmd
   scripts\start-agy-bridge.bat
   ```
   *ตรวจสอบพอร์ต 8000 อัตโนมัติ หากยังไม่รัน จะสั่ง `pythonw.exe` รันขึ้น RAM เงียบๆ เบื้องหลัง*

---

## 🔌 5. วิธีการตั้งค่าในแต่ละแอปพลิเคชัน (Integration Guide)

### 5.1 การเชื่อมต่อใน Hermes Agent
ไฟล์คอนฟิกอยู่ที่: `C:\Users\lenovo\AppData\Local\hermes\config.yaml`
```yaml
model:
  default: gemini-3.7-flash-medium
  provider: agy-cli
  base_url: http://127.0.0.1:8000/v1
  api_key: agy-bridge

providers:
  agy-cli:
    name: Antigravity Bridge
    api: http://127.0.0.1:8000/v1
    api_key: agy-bridge
```

---

### 5.2 การเชื่อมต่อใน LearnHarness (เชื่อมต่อสำเร็จแล้วแบบ Native ✅)

LearnHarness ได้รับการเชื่อมต่อกับ Antigravity Bridge เรียบร้อยแล้วผ่าน Native Bridge Module:
* **ไฟล์โมดูลบริดจ์:** [`src/agent/antigravity-bridge.ts`](file:///d:/Learnharness%20(%E0%B9%82%E0%B8%AA%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%95%E0%B8%B4%E0%B8%AA%E0%B9%8pro%E0%B9%81%E0%B8%81%E0%B8%A3%E0%B8%a1)/src/agent/antigravity-bridge.ts)
* **การลงทะเบียนในระบบ:** บูรณาการเข้ากับ [`src/server/model-catalog.ts`](file:///d:/Learnharness%20(%E0%B9%82%E0%B8%AA%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%95%E0%B8%B4%E0%B8%AA%E0%B9%8pro%E0%B9%81%E0%B8%81%E0%B8%A3%E0%B8%a1)/src/server/model-catalog.ts) และ [`src/agent/models.ts`](file:///d:/Learnharness%20(%E0%B9%82%E0%B8%AA%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%95%E0%B8%B4%E0%B8%AA%E0%B9%8pro%E0%B9%81%E0%B8%81%E0%B8%A3%E0%B8%a1)/src/agent/models.ts)
* **สถานะปัจจุบัน:**
  * Provider `antigravity` เปิดใช้งานอยู่ตลอดเวลา (`keyPresent: true`)
  * โควตาและค่าใช้จ่ายในระบบขึ้น `$0.00` (Free Antigravity Quota)
  * ค่าเริ่มต้นใน `data/settings.json`:
    * **Strong Slot (Teacher/Prober):** `gemini-3.7-flash-medium` (Thinking: medium)
    * **Cheap Slot (Background Agents):** `gemini-3.7-flash`
    * **Vision Slot (Diagrams/Images):** `gemini-3.7-flash`
  * สามารถสลับไปใช้ `gemini-3.8-flash-high` หรือ `claude-sonnet-4.6-thinking` ได้ตลอดเวลาผ่านหน้า Settings ของ LearnHarness

---

### 5.3 การเชื่อมต่อใน Cursor, Continue, หรือ OpenAI Compatible Client อื่นๆ
- **API Base URL:** `http://127.0.0.1:8000/v1`
- **API Key:** `agy-bridge`
- **Model:** `gemini-3.8-flash-high` หรือ `claude-sonnet-4.6-thinking`

---

## 🔍 6. คำสั่ง CLI สำหรับการบำรุงรักษา (Maintenance Cheatsheet)

| งานที่ต้องการ | คำสั่ง PowerShell |
| :--- | :--- |
| ตรวจสอบว่าพอร์ต 8000 กำลัง Listen หรือไม่ | `Get-NetTCPConnection -LocalPort 8000 -State Listen` |
| หาว่า Process ID (PID) ใดถือครองพอร์ต 8000 | `(Get-NetTCPConnection -LocalPort 8000 -State Listen).OwningProcess` |
| ทดสอบยิงทดสอบดึงรายชื่อโมเดล | `curl.exe -H "Authorization: Bearer agy-bridge" http://127.0.0.1:8000/v1/models` |
| หยุดการทำงานของ Bridge บน RAM | `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force` |
| สั่งเปิด Bridge ใหม่แบบซ่อนหน้าต่าง | `Start-Process -FilePath pythonw.exe -ArgumentList 'C:\Users\lenovo\antigravity-bridge\antigravity_bridge.py'` |

---

## 📝 บันทึกประวัติ
- บันทึกและทดสอบความพร้อมระบบ: 26 ตุลาคม 2026
- สภาพแวดล้อม: Windows 11, Node.js v24, Python 3.14 (pythonw), Google Antigravity (AGY)
