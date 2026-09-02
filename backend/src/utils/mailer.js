const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Set up log directory for local email files
const LOGS_DIR = path.join(__dirname, '..', '..', 'logs', 'emails');
try {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
} catch (err) {
  // ignore
}

// Configurable transporter
let transporter;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function fmt(n) {
  return `Rs. ${Number(n).toLocaleString('en-PK')}`;
}

// Helper to save mail locally as a mock/preview
function saveLocalMail(to, subject, htmlBody) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}_to_${to.replace(/[@.]/g, '_')}.html`;
  const filePath = path.join(LOGS_DIR, filename);
  
  const fileContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${subject}</title>
      <style>
        .meta-header { background: #1C1A17; color: #FAF7F2; padding: 15px; font-family: sans-serif; border-bottom: 3px solid #A8823D; }
        .meta-field { margin-bottom: 5px; font-size: 13px; }
        .email-body { padding: 20px; }
      </style>
    </head>
    <body>
      <div class="meta-header">
        <div class="meta-field"><strong>To:</strong> ${to}</div>
        <div class="meta-field"><strong>Subject:</strong> ${subject}</div>
        <div class="meta-field"><strong>Date:</strong> ${new Date().toLocaleString()}</div>
      </div>
      <div class="email-body">
        ${htmlBody}
      </div>
    </body>
    </html>
  `;
  
  try {
    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`âœ‰ï¸ Email saved locally to logs: ${filePath}`);
  } catch (err) {
    console.error('Failed to save email locally:', err);
  }
}

// Send helper
async function sendMail({ to, subject, html }) {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Anwar Clothing" <${process.env.SMTP_FROM || 'no-reply@anwarclothing.com'}>`,
        to,
        subject,
        html,
      });
      console.log(`âœ‰ï¸ Email successfully sent to ${to} via SMTP`);
    } catch (err) {
      console.error(`âŒ SMTP send failed to ${to}:`, err);
      saveLocalMail(to, subject, html);
    }
  } else {
    saveLocalMail(to, subject, html);
  }
}

exports.sendMail = sendMail;

exports.sendCustomerOrderConfirmation = async (order) => {
  const user = order.user;
  const address = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress;
    
  const orderId = order.orderNumber || order.id;
  const itemsText = order.items.map(item => `${item.product.name} x ${item.quantity}`).join(', ');
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #DDD5C7; font-family: sans-serif; font-size: 14px; color: #1C1A17;">
        ${item.product.name}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #DDD5C7; font-family: sans-serif; font-size: 14px; color: #1C1A17; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #DDD5C7; font-family: sans-serif; font-size: 14px; color: #1C1A17; text-align: right;">
        ${fmt(item.priceAtPurchase * item.quantity)}
      </td>
    </tr>
  `).join('');

  const subject = `✅ Order Confirmed – Anwar Clothing (Order #${orderId})`;
  
  const html = `
    <div style="background-color: #FAF7F2; padding: 30px 20px; font-family: 'Playfair Display', Georgia, serif;">
      <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #DDD5C7; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #DDD5C7; padding-bottom: 20px;">
          <h1 style="color: #1C1A17; font-size: 26px; margin: 0; font-weight: normal; letter-spacing: 1px;">
            Anwar <span style="font-style: italic; color: #A8823D;">Clothing</span>
          </h1>
          <p style="color: #6B6560; font-size: 11px; text-transform: uppercase; tracking: 0.15em; margin: 5px 0 0 0;">Established Pakistan</p>
        </div>
        
        <p style="font-family: sans-serif; font-size: 15px; color: #1C1A17; line-height: 1.6;">
          Hi <strong>${user.name}</strong>,
        </p>
        
        <p style="font-family: sans-serif; font-size: 15px; color: #1C1A17; line-height: 1.6;">
          Thank you for shopping with <strong>Anwar Clothing</strong>! 🎉<br>
          Your order has been successfully placed and is now being processed.
        </p>
        
        <h3 style="color: #A8823D; font-size: 18px; font-weight: normal; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #A8823D; padding-bottom: 5px;">
          Order Summary
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <thead>
            <tr style="background: #F7F3EC;">
              <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #6B6560; text-transform: uppercase; text-align: left;">Item</th>
              <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #6B6560; text-transform: uppercase; text-align: center; width: 60px;">Qty</th>
              <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #6B6560; text-transform: uppercase; text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <table style="width: 100%; font-family: sans-serif; font-size: 14px; line-height: 1.8; color: #1C1A17; margin-bottom: 30px;">
          <tr>
            <td style="font-weight: bold; width: 140px;">Order ID:</td>
            <td>#${orderId}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Order Date:</td>
            <td>${new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' })}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Total Amount:</td>
            <td style="color: #A8823D; font-weight: bold; font-size: 16px;">${fmt(order.total)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Payment Method:</td>
            <td>${order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; vertical-align: top;">Delivery Address:</td>
            <td style="line-height: 1.4;">
              ${address.fullName}<br>
              ${address.street}<br>
              ${address.city}, ${address.province}<br>
              Phone: ${address.phone}
            </td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Estimated Delivery:</td>
            <td>3â€“5 business days</td>
          </tr>
        </table>
        
        <div style="background: #FAF7F2; padding: 20px; border-left: 3px solid #A8823D; font-family: sans-serif; font-size: 13px; color: #6B6560; line-height: 1.6; margin-bottom: 30px;">
          We'll notify you again once your order is shipped ðŸ“¦
        </div>
        
        <div style="text-align: center; border-top: 1px solid #DDD5C7; padding-top: 25px;">
          <p style="font-family: sans-serif; font-size: 14px; color: #1C1A17; margin-bottom: 15px;">
            Need help? Just reply to this email or message us on WhatsApp:
          </p>
          <a href="https://wa.me/923294359224" style="background-color: #A8823D; color: #ffffff; padding: 12px 24px; text-decoration: none; font-family: sans-serif; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
            Message WhatsApp Support
          </a>
        </div>
        
        <p style="text-align: center; font-family: sans-serif; font-size: 12px; color: #6B6560; margin-top: 40px; margin-bottom: 0;">
          Thanks for choosing us!<br>
          <strong>Team Anwar Clothing</strong>
        </p>
      </div>
    </div>
  `;
  
  await sendMail({ to: user.email, subject, html });
};

exports.sendAdminNewOrderAlert = async (order) => {
  const user = order.user;
  const address = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress;
    
  const orderId = order.orderNumber || order.id;
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #DDD5C7; font-family: sans-serif; font-size: 14px; color: #1C1A17;">
        ${item.product.name}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #DDD5C7; font-family: sans-serif; font-size: 14px; color: #1C1A17; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #DDD5C7; font-family: sans-serif; font-size: 14px; color: #1C1A17; text-align: right;">
        ${fmt(item.priceAtPurchase * item.quantity)}
      </td>
    </tr>
  `).join('');

  const subject = `ðŸ”” New Order Received â€“ #${orderId}`;
  
  const html = `
    <div style="background-color: #FAF7F2; padding: 30px 20px; font-family: sans-serif;">
      <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #DDD5C7; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="background-color: #1C1A17; color: #FAF7F2; padding: 15px; text-align: center; border-bottom: 4px solid #A8823D; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: normal; letter-spacing: 1px;">New Order Notification</h2>
        </div>
        
        <p style="font-size: 15px; color: #1C1A17; line-height: 1.6;">
          Hey Admin,
        </p>
        
        <p style="font-size: 15px; color: #1C1A17; line-height: 1.6;">
          A new order has just been placed on <strong>Anwar Clothing</strong>.
        </p>
        
        <h3 style="color: #A8823D; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #DDD5C7; padding-bottom: 5px; margin-top: 30px;">
          Order Details
        </h3>
        
        <table style="width: 100%; font-size: 14px; line-height: 1.8; color: #1C1A17; margin-bottom: 25px;">
          <tr>
            <td style="font-weight: bold; width: 140px;">Order ID:</td>
            <td>#${orderId}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Customer Name:</td>
            <td>${user.name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Customer Email:</td>
            <td>${user.email}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Customer Phone:</td>
            <td>${user.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Total Amount:</td>
            <td style="color: #A8823D; font-weight: bold; font-size: 16px;">${fmt(order.total)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Payment Method:</td>
            <td>${order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Payment Status:</td>
            <td>${order.paymentStatus}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; vertical-align: top;">Shipping Address:</td>
            <td style="line-height: 1.4;">
              ${address.fullName}<br>
              ${address.street}<br>
              ${address.city}, ${address.province}<br>
              Phone: ${address.phone}
            </td>
          </tr>
        </table>
        
        <h3 style="color: #A8823D; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #DDD5C7; padding-bottom: 5px; margin-top: 30px;">
          Items Ordered
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #F7F3EC;">
              <th style="padding: 10px; font-size: 12px; color: #6B6560; text-transform: uppercase; text-align: left;">Item</th>
              <th style="padding: 10px; font-size: 12px; color: #6B6560; text-transform: uppercase; text-align: center; width: 60px;">Qty</th>
              <th style="padding: 10px; font-size: 12px; color: #6B6560; text-transform: uppercase; text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: center; border-top: 1px solid #DDD5C7; padding-top: 25px;">
          <a href="http://localhost:5173/admin" style="background-color: #1C1A17; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block; border-bottom: 3px solid #A8823D;">
            Go to Admin Dashboard
          </a>
        </div>
        
        <p style="text-align: center; font-size: 11px; color: #6B6560; margin-top: 45px; border-top: 1px dashed #DDD5C7; padding-top: 15px;">
          â€” Automated Order Notification System
        </p>
      </div>
    </div>
  `;
  
  await sendMail({ to: 'abdullahasadullah776@gmail.com', subject, html });
};

exports.sendResetPasswordEmail = async (user, resetUrl) => {
  const subject = `🔒 Reset Your Password – Anwar Clothing`;
  const html = `
    <div style="background-color: #FAF7F2; padding: 30px 20px; font-family: sans-serif;">
      <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #DDD5C7; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #DDD5C7; padding-bottom: 20px;">
          <h1 style="color: #1C1A17; font-size: 26px; margin: 0; font-weight: normal; letter-spacing: 1px;">
            Anwar <span style="font-style: italic; color: #A8823D;">Clothing</span>
          </h1>
        </div>
        
        <p style="font-size: 15px; color: #1C1A17; line-height: 1.6;">
          Hi <strong>${user.name}</strong>,
        </p>
        
        <p style="font-size: 15px; color: #1C1A17; line-height: 1.6;">
          You requested to reset your password for your Anwar Clothing account. Click the button below to set a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #A8823D; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 13px; color: #6B6560; line-height: 1.6;">
          This link will expire in 20 minutes. If you did not request a password reset, you can safely ignore this email.
        </p>
        
        <p style="text-align: center; font-size: 12px; color: #6B6560; margin-top: 40px; border-top: 1px dashed #DDD5C7; padding-top: 15px;">
          Thanks,<br>
          <strong>Team Anwar Clothing</strong>
        </p>
      </div>
    </div>
  `;
  await sendMail({ to: user.email, subject, html });
};

exports.sendOrderStatusEmail = async (order, newStatus) => {
  const user = order.user;
  const orderId = order.orderNumber || order.id;
  const isShipped = newStatus === 'SHIPPED';
  const subject = isShipped
    ? 'Your Order #' + orderId + ' Has Been Shipped - Anwar Clothing'
    : 'Your Order #' + orderId + ' Has Been Delivered - Anwar Clothing';
  const heading = isShipped ? 'Your Order is On Its Way!' : 'Order Delivered!';
  const body = isShipped
    ? 'Great news! Your order has been shipped. Expected delivery: 3-5 business days.'
    : 'Your order has been delivered. We hope you love your Anwar Clothing purchase!';
  const html = '<div style="font-family:sans-serif;padding:30px;background:#FAF7F2">'
    + '<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #DDD5C7;padding:40px;">'
    + '<h1 style="color:#1C1A17;font-weight:normal;">Anwar <em style="color:#A8823D">Clothing</em></h1>'
    + '<h2 style="color:#A8823D;font-weight:normal;">' + heading + '</h2>'
    + '<p style="color:#1C1A17;">Hi <strong>' + user.name + '</strong>,</p>'
    + '<p style="color:#1C1A17;line-height:1.6;">' + body + '</p>'
    + '<p style="color:#6B6560;font-size:13px;">Order #' + orderId + '</p>'
    + '<a href="http://localhost:5173/track-order" style="background:#A8823D;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:bold;text-transform:uppercase;display:inline-block;margin-top:20px;">Track Your Order</a>'
    + '<p style="font-size:12px;color:#6B6560;margin-top:30px;">Team Anwar Clothing</p>'
    + '</div></div>';
  await sendMail({ to: user.email, subject, html });
};

exports.sendNewsletterWelcome = async (email) => {
  const subject = 'Welcome to Anwar Clothing - You are on the List!';
  const html = '<div style="font-family:sans-serif;padding:30px;background:#FAF7F2">'
    + '<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #DDD5C7;padding:40px;text-align:center;">'
    + '<h1 style="color:#1C1A17;font-weight:normal;">Anwar <em style="color:#A8823D">Clothing</em></h1>'
    + '<h2 style="color:#A8823D;font-weight:normal;">Welcome to the House of Anwar Clothing</h2>'
    + '<p style="color:#1C1A17;font-size:15px;line-height:1.6;">Thank you for subscribing! You will be the first to know about new collections, exclusive offers, and traditional craftsmanship stories.</p>'
    + '<a href="http://localhost:5173" style="background:#A8823D;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:bold;text-transform:uppercase;display:inline-block;margin:20px 0;">Explore Collections</a>'
    + '<p style="font-size:12px;color:#6B6560;margin-top:20px;">You subscribed with: ' + email + '<br><strong>Team Anwar Clothing</strong></p>'
    + '</div></div>';
  await sendMail({ to: email, subject, html });
};
