const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const nodemailer = require("nodemailer");

async function getTasksFromCTU() {
  let browser;

  try {
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      executablePath: await chromium.executablePath(),
      headless: true
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    );

    await page.goto(
      'https://ctu.campusmanager.co.za/portal/student-login.php',
      {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      }
    );

    await page.waitForSelector('#username', { visible: true, timeout: 15000 });
    await page.waitForSelector('#password', { visible: true, timeout: 15000 });

    const username = process.env.CTU_USERNAME;
    const password = process.env.CTU_PASSWORD;

    if (!username || !password) {
      throw new Error('Missing CTU credentials in environment variables');
    }

    await page.type('#username', username);
    await page.type('#password', password);

    await Promise.all([
      page.click('#btnlogin'),
      page.waitForNavigation({
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })
    ]);

    const currentUrl = page.url();
    if (currentUrl.includes('student-login.php')) {
      throw new Error('Login failed');
    }

    await page.waitForSelector('table.table-hover', { timeout: 15000 });

    const tasks = await page.evaluate(() => {
      const rows = document.querySelectorAll('table.table-hover tbody tr');
      const results = [];

      rows.forEach(row => {
        const cols = row.querySelectorAll('td');

        if (cols.length === 3) {
          results.push({
            module: cols[0].innerText.trim(),
            assessment: cols[1].innerText.trim(),
            due: cols[2].innerText.trim()
          });
        }
      });

      return results;
    });

    await browser.close();
    return tasks;

  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
}

async function sendTasksEmail(tasks) {
  if (!tasks || tasks.length === 0) return;

  const rows = tasks.map(task => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #ddd;">${task.module}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;">${task.assessment}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;">${task.due}</td>
    </tr>
  `).join("");

  const html = `
  <div style="font-family:Arial, sans-serif; max-width:600px; margin:auto;">
    <h2 style="color:#333;">CTU Assessments</h2>

    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:10px;text-align:left;">Module</th>
          <th style="padding:10px;text-align:left;">Assessment</th>
          <th style="padding:10px;text-align:left;">Due Date</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <p style="margin-top:20px;color:#666;font-size:12px;">
      Generated automatically from CTU Portal
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: process.env.CTU_STUDEMAIL,
    subject: "Your CTU Assessment Tasks",
    html
  });
}

router.post('/login', async (req, res) => {
  try {
    const tasks = await getTasksFromCTU();

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed: ' + err.message);
  }
});

router.get('/calendar.ics', async (req, res) => {
  try {
    const tasks = await getTasksFromCTU();

    // Send email with tasks
    await sendTasksEmail(tasks);

    const events = tasks.map(task => {
      const start = task.due.replace(/-/g, '');

      const endDate = new Date(task.due);
      endDate.setDate(endDate.getDate() + 1);
      const end = endDate.toISOString().slice(0, 10).replace(/-/g, '');

      const uid = `${task.assessment}-${start}@ctu-calendar`;

      return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${start}T080000Z
DTSTART;VALUE=DATE:${start}
DTEND;VALUE=DATE:${end}
SUMMARY:${task.assessment}
DESCRIPTION:${task.module}
END:VEVENT`;
    }).join('\n');

    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CTU Calendar//EN
CALSCALE:GREGORIAN
${events}
END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar');
    res.send(calendar);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate calendar');
  }
});


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD
  }
});


router.get("/send-email", async (req, res) => {
  try {
    console.log(process.env.SENDER_EMAIL);
console.log(process.env.SENDER_PASSWORD);

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: process.env.CTU_STUDEMAIL,
      subject: "Test Email",
      text: "Hello from Nodemailer using a GET request!"
    });

    res.send("Email sent: " + info.response);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});
module.exports = router;