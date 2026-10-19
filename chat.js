// Vercel Serverless Function: the ONLY place that touches the AI API key.
const hits = new Map(); // simple in-memory rate limit (use Upstash/Redis in production)
const SYSTEM = `คุณคือ MAYA AI ผู้ช่วยส่วนตัวอัจฉริยะ ตอบเป็นภาษาไทยเป็นหลัก สุภาพ กระชับ เข้าใจง่าย
ช่วยเขียนโค้ด แก้ปัญหา สรุปเอกสาร และวางแผนงานได้ หากทำสิ่งใดไม่ได้ ให้บอกผู้ใช้ตรงๆ อย่าแต่งข้อมูลขึ้นเอง`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY บนเซิร์ฟเวอร์' });

  const ip = (req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (recent.length >= 20) return res.status(429).json({ error: 'ส่งข้อความถี่เกินไป กรุณารอสักครู่' });
  hits.set(ip, [...recent, now]);

  const { messages, memory } = req.body || {};
  if (!Array.isArray(messages) || !messages.length || messages.length > 30)
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  const clean = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 4000),
  }));
  if (clean[0].role !== 'user') clean.shift();

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM + (memory ? `\n\nข้อมูลที่ผู้ใช้อนุญาตให้จำ:\n${String(memory).slice(0, 1500)}` : ''),
        messages: clean,
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'บริการ AI ตอบกลับผิดพลาด', detail: data?.error?.message });
    res.status(200).json({ reply: (data.content || []).map(c => c.text || '').join('') });
  } catch (e) {
    res.status(500).json({ error: 'เชื่อมต่อบริการ AI ไม่ได้' });
  }
}
