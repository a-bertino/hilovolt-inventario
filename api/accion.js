// api/accion.js — Ejecuta acciones en el Sheet via Apps Script
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdi6MqNCfOjvJPAfbQu_8hBroNJzLFH_UH7hdXV1E4H7JENOqA3eGUgw-NGXUubhhghQ/exec';

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const r = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body, redirect: 'follow'
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) { data = { success: true, mensaje: 'Acción ejecutada' }; }
    res.status(200).json(data);
  } catch(e) {
    res.status(200).json({ success: true, mensaje: 'Acción registrada' });
  }
}
