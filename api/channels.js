module.exports = async (req, res) => {
  const code = String((req.query && req.query.c) || '').toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) return res.status(400).json({ error: 'bad code' });
  try {
    const r = await fetch('https://iptv-org.github.io/iptv/countries/' + code + '.m3u');
    if (!r.ok) throw new Error('upstream ' + r.status);
    const lines = (await r.text()).split('\n');
    const out = [];
    let cur = null;
    for (const raw of lines) {
      const l = raw.trim();
      if (l.startsWith('#EXTINF:')) {
        const g = (k) => (l.match(new RegExp(k + '="([^"]*)"')) || [])[1];
        cur = {
          n: g('tvg-name') || l.slice(l.lastIndexOf(',') + 1).trim() || 'Channel',
          l: g('tvg-logo') || '',
          g: g('group-title') || 'General',
        };
      } else if (l && !l.startsWith('#') && cur) {
        cur.u = l;
        out.push(cur);
        cur = null;
      }
    }
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json(out);
  } catch (e) {
    res.status(502).json({ error: 'unavailable' });
  }
};
