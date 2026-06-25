const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  try {
    const store = getStore('news');
    const { blobs } = await store.list();
    const items = await Promise.all(
      blobs.map(async ({ key }) => {
        const data = await store.get(key, { type: 'json' });
        return data;
      })
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(items.filter(Boolean))
    };
  } catch (e) {
    return { statusCode: 200, headers, body: '[]' };
  }
};
