// Rich, responsive HTML email templates for EventHub

const baseLayout = (content, previewText = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EventHub</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 16px; }
    .card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; text-align: center; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 13px; border-top: 1px solid #f1f5f9; }
    .qr-box { text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="container">
    <div class="header">
      <h1>EventHub</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} EventHub. All rights reserved.</p>
      <p>Discover, Create & Manage Unforgettable Events</p>
    </div>
  </div>
</body>
</html>
`;

const rsvpConfirmationEmail = ({ event, rsvp, qrDataUrl }) => {
  const content = `
    <h2>You're going to ${event.title}! 🎉</h2>
    <p>Hi ${rsvp.guestName},</p>
    <p>Your RSVP for <strong>${event.title}</strong> has been successfully confirmed. We're excited to have you join!</p>
    
    <div class="card">
      <h3 style="margin-top:0;">Event Details</h3>
      <p><strong>📅 Date:</strong> ${new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>📍 Location:</strong> ${event.locationType === 'online' ? 'Online Event' : `${event.venue.name || ''}, ${event.venue.city || ''}`}</p>
      <p><strong>🎟 Ticket Code:</strong> <span style="font-family:monospace;font-size:18px;font-weight:bold;color:#4f46e5;">${rsvp.ticketCode}</span></p>
      <p><strong>👥 Guests Count:</strong> ${rsvp.guestsCount}</p>
      ${qrDataUrl ? `
        <div class="qr-box">
          <p style="margin-bottom:8px;font-size:14px;color:#64748b;">Scan this QR code at the door for entry:</p>
          <img src="${qrDataUrl}" alt="Check-in QR Code" style="width:160px;height:160px;border-radius:8px;border:1px solid #cbd5e1;" />
        </div>
      ` : ''}
    </div>

    <p>Attached to this email is a calendar invite (.ics) so you can easily add this event to Google Calendar, Apple Calendar, or Outlook.</p>
  `;
  return baseLayout(content, `Your ticket for ${event.title}`);
};

const waitlistPromotionEmail = ({ event, rsvp }) => {
  const content = `
    <h2>Good news! A spot opened up! 🚀</h2>
    <p>Hi ${rsvp.guestName},</p>
    <p>A spot became available for <strong>${event.title}</strong>, and you've been automatically promoted from the waitlist to <strong>Going</strong>!</p>
    
    <div class="card">
      <h3 style="margin-top:0;">Event Details</h3>
      <p><strong>📅 Date:</strong> ${new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>🎟 Your Ticket Code:</strong> <span style="font-family:monospace;font-size:18px;font-weight:bold;color:#4f46e5;">${rsvp.ticketCode}</span></p>
      <p><strong>📍 Venue:</strong> ${event.locationType === 'online' ? 'Online Event' : event.venue.name || event.venue.city}</p>
    </div>

    <p>If you can no longer attend, please cancel your RSVP so the next person on the waitlist can join.</p>
  `;
  return baseLayout(content, `You're off the waitlist for ${event.title}!`);
};

const eventReminderEmail = ({ event, rsvp }) => {
  const content = `
    <h2>Friendly Reminder: ${event.title} is coming up! ⏰</h2>
    <p>Hi ${rsvp.guestName},</p>
    <p>This is a quick reminder that <strong>${event.title}</strong> takes place in approximately 24 hours.</p>
    
    <div class="card">
      <p><strong>📅 Date & Time:</strong> ${new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>📍 Location:</strong> ${event.locationType === 'online' ? event.onlineLink : `${event.venue.name}, ${event.venue.address || ''} ${event.venue.city || ''}`}</p>
      <p><strong>🎟 Your Ticket Code:</strong> <span style="font-family:monospace;font-weight:bold;">${rsvp.ticketCode}</span></p>
    </div>

    <p>We look forward to seeing you there!</p>
  `;
  return baseLayout(content, `Reminder: ${event.title} is tomorrow!`);
};

const eventCancelledEmail = ({ event, rsvp }) => {
  const content = `
    <h2>Notice: Event Cancelled ⚠️</h2>
    <p>Hi ${rsvp.guestName},</p>
    <p>We regret to inform you that the organizer has cancelled <strong>${event.title}</strong>.</p>
    
    <div class="card" style="border-left:4px solid #ef4444;">
      <p>If you have any questions, please reach out to the event organizer or support team.</p>
    </div>
  `;
  return baseLayout(content, `Cancelled: ${event.title}`);
};

const inviteEmail = ({ event, inviteUrl, organizerName }) => {
  const content = `
    <h2>You're invited to ${event.title}! 💌</h2>
    <p>Hello,</p>
    <p><strong>${organizerName || 'An organizer'}</strong> has invited you to attend <strong>${event.title}</strong>.</p>
    
    <div class="card">
      <h3 style="margin-top:0;">${event.title}</h3>
      <p><strong>📅 Date:</strong> ${new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>📍 Location:</strong> ${event.locationType === 'online' ? 'Online' : `${event.venue.name || ''}, ${event.venue.city || ''}`}</p>
    </div>

    <div style="text-align: center;">
      <a href="${inviteUrl}" class="btn">View Invitation & RSVP Now</a>
    </div>

    <p style="font-size:14px;color:#64748b;">Or copy this link into your browser: <br/><a href="${inviteUrl}">${inviteUrl}</a></p>
  `;
  return baseLayout(content, `Invitation: ${event.title}`);
};

const passwordResetEmail = ({ resetUrl, user }) => {
  const content = `
    <h2>Reset Your Password 🔐</h2>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset for your EventHub account. Click the button below to set a new password. This link is valid for 1 hour.</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>

    <p style="font-size:14px;color:#64748b;">If you did not request this, you can safely ignore this email.</p>
  `;
  return baseLayout(content, `Reset your EventHub password`);
};

module.exports = {
  rsvpConfirmationEmail,
  waitlistPromotionEmail,
  eventReminderEmail,
  eventCancelledEmail,
  inviteEmail,
  passwordResetEmail,
};
