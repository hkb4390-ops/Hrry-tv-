module.exports = async (req, res) => {
  try {
    const r = await fetch('https://iptv-org.github.io/api/countries.json');
    if (!r.ok) throw new Error('upstream ' + r.status);
    const d = await r.json();
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(d.map((c) => ({ c: c.code, n: c.name })));
  } catch (e) {
    res.status(502).json({ error: 'unavailable' });
  }
};
