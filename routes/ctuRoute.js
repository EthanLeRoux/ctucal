const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');

router.post('/login',async (req, res) => {
  const formData = new URLSearchParams();
  formData.append('username', process.env.CTU_USERNAME);
  formData.append('password', process.env.CTU_PASSWORD);
  formData.append('cfunction', 'login');

  const response = await fetch(
    'https://ctu.campusmanager.co.za/portal/student-login.php',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://ctu.campusmanager.co.za/portal/student-login.php',
        'Origin': 'https://ctu.campusmanager.co.za',
        'User-Agent': 'Mozilla/5.0'
      },
      body: formData
    }
  );


  const setCookieHeader = response.headers.get('set-cookie');

  let sessionId = null;

  if (setCookieHeader) {
    const match = setCookieHeader.match(/PHPSESSID=([^;]+)/);
    if (match) {
      sessionId = match[1];
    }
  }

  

  res.json({
    PHPSESSID: sessionId
  });
});

module.exports = router;