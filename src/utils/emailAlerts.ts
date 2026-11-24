export interface NewAccountAlertData {
  name: string;
  email: string;
  usn: string;
  branch: string;
  currentYear?: string;
  admissionYear?: number | string;
}

export async function sendNewAccountAdminAlert(student: NewAccountAlertData): Promise<void> {
  const adminEmail = 'gjr19atwork@gmail.com';
  
  const timestamp = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  const subject = `🎓 New Student Account Created: ${student.name} (${student.usn})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Account Alert - BMSIT Marketplace</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #FFFBEA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1C1C;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #FFFBF5; border: 2.5px solid #1C1C1C; border-radius: 16px; box-shadow: 5px 5px 0px #1C1C1C; overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #F2A93B; border-bottom: 2.5px solid #1C1C1C; padding: 20px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <div style="font-size: 22px; font-weight: 900; color: #1C1C1C; letter-spacing: -0.5px;">
              marketplace<span style="color: #1C1C1C;">.</span>bmsit
            </div>
            <div style="display: inline-block; background-color: #1C1C1C; color: #FFFBEA; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; margin-top: 4px;">
              ⚡ Admin Alert
            </div>
          </td>
          <td align="right" style="font-size: 32px;">
            🎓
          </td>
        </tr>
      </table>
    </div>

    <!-- Content -->
    <div style="padding: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #1C1C1C; margin: 0 0 10px 0;">
        A new student just created an account!
      </h2>
      <p style="font-size: 13px; color: #404040; margin: 0 0 20px 0; line-height: 1.5;">
        A new student has registered on the BMSIT student marketplace. Here are their verified profile details:
      </p>

      <!-- Student Details Card -->
      <div style="background-color: #FFF9E6; border: 2px solid #1C1C1C; border-radius: 12px; padding: 18px; box-shadow: 3px 3px 0px #1C1C1C; margin-bottom: 24px;">
        <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px; border-collapse: collapse;">
          <tr style="border-bottom: 1px dashed rgba(28,28,28,0.2);">
            <td style="font-weight: 700; color: #666; width: 35%;">Student Name</td>
            <td style="font-weight: 800; color: #1C1C1C; text-align: right;">${escapeHtml(student.name)}</td>
          </tr>
          <tr style="border-bottom: 1px dashed rgba(28,28,28,0.2);">
            <td style="font-weight: 700; color: #666;">University USN</td>
            <td style="font-weight: 800; font-family: monospace; color: #1C1C1C; text-align: right;">${escapeHtml(student.usn)}</td>
          </tr>
          <tr style="border-bottom: 1px dashed rgba(28,28,28,0.2);">
            <td style="font-weight: 700; color: #666;">College Email</td>
            <td style="font-weight: 800; color: #2563EB; text-align: right;">${escapeHtml(student.email)}</td>
          </tr>
          <tr style="border-bottom: 1px dashed rgba(28,28,28,0.2);">
            <td style="font-weight: 700; color: #666;">Branch / Dept</td>
            <td style="font-weight: 800; color: #1C1C1C; text-align: right;">${escapeHtml(student.branch)}</td>
          </tr>
          <tr style="border-bottom: 1px dashed rgba(28,28,28,0.2);">
            <td style="font-weight: 700; color: #666;">Current Year</td>
            <td style="font-weight: 800; color: #1C1C1C; text-align: right;">${escapeHtml(student.currentYear || '1st Year')}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #666;">Created At</td>
            <td style="font-weight: 700; font-size: 12px; color: #1C1C1C; text-align: right;">${timestamp}</td>
          </tr>
        </table>
      </div>

      <!-- Button -->
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="https://marketplace.bmsit.co.in" target="_blank" style="display: inline-block; background-color: #F2A93B; color: #1C1C1C; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 26px; border: 2px solid #1C1C1C; border-radius: 10px; box-shadow: 3px 3px 0px #1C1C1C;">
          Open BMSIT Marketplace →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F5EEDB; border-top: 1.5px solid rgba(28,28,28,0.15); padding: 14px 20px; font-size: 11px; color: #777; text-align: center;">
      Automated account registration alert sent to <strong>${adminEmail}</strong> from BMSIT Marketplace.
    </div>
  </div>
</body>
</html>
  `;

  // Determine endpoint: use production URL if on localhost, otherwise relative /api/send-email
  let endpoint = '/api/send-email';
  if (typeof window !== 'undefined' && window.location) {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      endpoint = 'https://marketplace.bmsit.co.in/api/send-email';
    }
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: adminEmail,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Admin alert email returned status:', res.status, errData);
    }
  } catch (err) {
    console.warn('Network error dispatching admin alert email:', err);
  }
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
