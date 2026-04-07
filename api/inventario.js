export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60');
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
    const STOCK_MIN = 10;
    const rows = await leerHoja('Productos');
    const productos = rows.map(r => {
      const stock = Number(r[4]) || 0;
      const cat = String(r[2] || '');
      let estado = 'ok';
      if (stock === 0) estado = 'sin_stock';
      else if (stock <= STOCK_MIN) estado = 'bajo';
      return {
        id: String(r[0]),
        nombre: String(r[1] || ''),
        categoria: cat,
        rubro: (cat === 'Hilos' || cat === 'Lanas') ? 'hilos' : 'electrico',
        precio: Number(r[3]) || 0,
        stock,
        stockMin: STOCK_MIN,
        imagen: String(r[5] || ''),
        descripcion: String(r[6] || ''),
        color: String(r[7] || ''),
        estado
      };
    }).filter(p => p.nombre);

    res.status(200).json({ success: true, productos });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
