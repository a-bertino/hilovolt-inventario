export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const SHEET_ID = '1LRtcBGhX9bOZ0H7yUkualMt5A-cfXv48h1iwKDHFmK4';

  async function leerHoja(nombre) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(nombre)}&headers=1`;
    const r = await fetch(url);
    const text = await r.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
    if (!match) return [];
    const json = JSON.parse(match[1]);
    return json.table.rows
      .filter(row => row.c && row.c[0] && row.c[0].v !== null)
      .map(row => row.c.map(c => (c && c.v !== null && c.v !== undefined) ? c.v : ''));
  }

  try {
    const rows = await leerHoja('Movimientos');
    const movimientos = rows.map(r => ({
      fecha: r[0] ? new Date(r[0]).toLocaleDateString('es-AR') : '',
      tipo: String(r[1] || ''),
      idProducto: String(r[2] || ''),
      producto: String(r[3] || ''),
      cantidad: Number(r[4]) || 0,
      motivo: String(r[5] || ''),
      usuario: String(r[6] || '')
    })).filter(m => m.producto);

    movimientos.reverse();
    res.status(200).json({ success: true, movimientos });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
