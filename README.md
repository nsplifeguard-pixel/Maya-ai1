# MAYA AI

โครงสร้าง: `index.html` (UI + เสียง) · `api/chat.js` (Backend เรียก AI) · `manifest.json`/`sw.js` (PWA)

## ติดตั้งและ Deploy (Vercel)
1. อัปโหลดโฟลเดอร์นี้ขึ้น GitHub แล้ว Import ใน Vercel (หรือรัน `npx vercel`)
2. Settings → Environment Variables → เพิ่ม `ANTHROPIC_API_KEY` (ห้ามใส่ในโค้ด)
3. (ไม่บังคับ) `AI_MODEL` เพื่อเปลี่ยนโมเดล
4. Deploy แล้วเปิดผ่าน HTTPS (จำเป็นสำหรับไมโครโฟน)

ทดสอบในเครื่อง: `npx vercel dev` แล้วเปิด http://localhost:3000

## ทดสอบเสียง
เปิดด้วย Chrome (Android/PC) หรือ Safari (iPhone) → กด 🎤 → อนุญาตไมค์ → พูดภาษาไทย → ข้อความถูกส่งไป `/api/chat` → คำตอบแสดงและอ่านออกเสียง (ปิดได้ที่ 🔊)
เพิ่มเป็นแอป: iPhone แชร์ → Add to Home Screen · Android เมนู → Install app

## ขอบเขตเวอร์ชันแรก / ต่อยอด
- ประวัติ ความจำ รายการงาน และการตั้งค่า เก็บใน localStorage ของอุปกรณ์ (ปุ่มลบข้อมูลทั้งหมดอยู่ในตั้งค่า)
- ยังไม่มีระบบล็อกอิน/Supabase: ขั้นต่อไปให้เพิ่ม Supabase Auth + ตาราง `conversations, messages, memories, tasks, settings` พร้อม RLS (`auth.uid() = user_id`) และให้ `api/chat.js` ตรวจ JWT
- Rate limit ปัจจุบันเป็นแบบ in-memory ควรเปลี่ยนเป็น Redis/Upstash เมื่อใช้จริง
