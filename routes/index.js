var express = require('express');
var router = express.Router();

const puppeteer = require('puppeteer');

router.get('/', (req, res) => {
  res.send({ success: true });
});

router.get('/:day/:hour?', async (req, res) => {
  const { day, hour } = req.params;
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  try {
    await page.goto(`https://cdn.icnet.dev/test/epf/index.html`);
    const selector = '#asam_content > div > table > tbody > tr';

    const result = await page.$$eval(selector, (trs) =>
      trs.map((tr) => {
        const tds = [...tr.getElementsByTagName('td')];
        const row = [];
        tds.map((td) => {
          console.log(td);
          if (td.textContent.trim().length > 0) row.push(td.innerText.trim().replaceAll('\n', ' '));
          else row.push(null);
        });
        return row;
      })
    );
    const data = format(result, day, hour);

    await browser.close();

    res.send({ sucess: true, data });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

/* 
  day: mostly between 1 and 5
*/
function format(data, day, hour) {
  if (!hour) {
    const all = [];
    for (let i = 1; i <= 10; i++) {
      if (data[i][day]) all.push(data[i][day]);
    }

    return { day: data[0][day], subjects: all, hours: all.length };
  }
  return { day: data[0][day], lesson: data[hour][0], subject: data[hour][day] };
}

module.exports = router;
