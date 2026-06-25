const { getStore } = require('@netlify/blobs');

// ════════════════════════════════════════════════════════
//  PASSWORD PANNELLO ADMIN
//  Cambia "elogi2025" con la password che preferisci.
// ════════════════════════════════════════════════════════
const ADMIN_PASSWORD = 'elogi2025';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, password, news } = body;

    if (password !== ADMIN_PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Password errata' }) };
    }

    const store = getStore('news');

    // SALVA (crea o aggiorna)
    if (action === 'save') {
      if (!news || !news.id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dati mancanti' }) };
      await store.setJSON(news.id, news);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ELIMINA
    if (action === 'delete') {
      if (!news || !news.id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID mancante' }) };
      await store.delete(news.id);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // LISTA (per il pannello admin)
    if (action === 'list') {
      const { blobs } = await store.list();
      const items = await Promise.all(
        blobs.map(async ({ key }) => {
          const data = await store.get(key, { type: 'json' });
          return data;
        })
      );
      return { statusCode: 200, headers, body: JSON.stringify(items.filter(Boolean)) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Azione non valida' }) };

  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
