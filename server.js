const express = require('express');
const bodyParser = require('body-parser');
const bbcodeToHtml = require('bbcode-to-html');
const HTML2BBCode = require('html2bbcode').HTML2BBCode;

const app = express();
app.use(bodyParser.json());

// BBCode → HTML
app.post('/bbcode-to-html', (req, res) => {
  const { bbcode } = req.body;
  console.log('Input bbcode:', bbcode);
  if (!bbcode || typeof bbcode !== 'string') {
    
    return res.status(400).json({ error: 'Missing or invalid bbcode input' });
  }

  try {
    const html = bbcodeToHtml(bbcode);
    console.log('Returned html:', html);
    res.json({ html });
  } catch (err) {
    res.status(500).json({
      error: 'BBCode to HTML conversion failed',
      details: err.message
    });
  }
});

// HTML → BBCode
app.post('/html-to-bbcode', (req, res) => {
  const { html } = req.body;

  if (!html || typeof html !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid html input' });
  }

  try {
    // The html2bbcode package might export the converter directly
    const converter = new HTML2BBCode(new HTML2BBCode({
        // enable image scale, default: false
        imagescale: true,
        // enable transform pixel size to size 1-7, default: false
        transsize: true,
        // disable list <ul> <ol> <li> support, default: false
        nolist: true,
        // disable text-align center support, default: false
        noalign: true,
        // disable HTML headings support, transform to size, default: false
        noheadings: true
      }));
    const bbcode = converter.feed(html);
    res.json({ bbcode: bbcode?.s || '' });
  } catch (err) {
    res.status(500).json({
      error: 'HTML to BBCode conversion failed',
      details: err.message
    });
  }
});

// Add a simple homepage with instructions
app.get('/', (req, res) => {
  res.send(`
    <h1>BBCode ↔ HTML Converter API</h1>
    <h2>Endpoints:</h2>
    <ul>
      <li>
        <strong>POST /bbcode-to-html</strong>
        <p>Convert BBCode to HTML</p>
        <p>Request body: { "bbcode": "[b]Bold text[/b]" }</p>
      </li>
      <li>
        <strong>POST /html-to-bbcode</strong>
        <p>Convert HTML to BBCode</p>
        <p>Request body: { "html": "<strong>Bold text</strong>" }</p>
      </li>
    </ul>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 BBCode ↔ HTML API running at http://localhost:${PORT}`);
});