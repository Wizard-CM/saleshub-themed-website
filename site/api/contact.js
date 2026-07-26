// Contact form → email via Resend.
// Requires the RESEND_API_KEY environment variable (Vercel dashboard →
// Project → Settings → Environment Variables). The key must never be
// committed to the repo.
//
// NOTE: while the Resend account has no verified domain it can only
// deliver to the account owner's address (ronakthapa37@gmail.com) from
// onboarding@resend.dev. After verifying saleshubnepal.com in Resend,
// change TO_ADDR to sales.hub.nepal@gmail.com and FROM_ADDR to
// something like 'SalesHubNepal <contact@saleshubnepal.com>'.

const TO_ADDR = 'ronakthapa37@gmail.com';
const FROM_ADDR = 'SalesHubNepal Contact <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function esc(s){
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST'){
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, message } = req.body || {};
  const msg = typeof message === 'string' ? message.trim() : '';
  if (!EMAIL_RE.test(email || '') || msg.length < 10){
    res.status(400).json({ error: 'A valid email and a message of at least 10 characters are required.' });
    return;
  }

  if (!process.env.RESEND_API_KEY){
    res.status(500).json({ error: 'Email service is not configured.' });
    return;
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_ADDR,
        to: [TO_ADDR],
        reply_to: email,
        subject: `New enquiry — saleshubnepal.com contact form`,
        html: `
          <h2 style="margin:0 0 12px">New message from the contact form</h2>
          <p style="margin:0 0 6px"><strong>From:</strong> ${esc(email)}</p>
          <p style="margin:0 0 6px"><strong>Message:</strong></p>
          <p style="white-space:pre-wrap; border-left:3px solid #FF5C3A; padding-left:12px; margin:0">${esc(msg)}</p>
        `,
        text: `New message from the contact form\n\nFrom: ${email}\n\n${msg}`
      })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok){
      console.error('Resend error:', r.status, data);
      res.status(502).json({ error: 'The email could not be sent.' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err){
    console.error('Contact function error:', err);
    res.status(500).json({ error: 'The email could not be sent.' });
  }
};
