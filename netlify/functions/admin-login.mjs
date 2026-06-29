export async function handler(event) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { password } = JSON.parse(event.body || '{}');
    const submitted = (password || '').toString().trim();
    const envPassword = (process.env.ADMIN_PASSWORD || '').trim();

    const matches = envPassword.length > 0 &&
                    (submitted === envPassword || submitted.toLowerCase() === envPassword.toLowerCase());

    if (matches) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, token: `craftedge_session_${Date.now()}`, username: 'Admin' })
      };
    }
    return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'Incorrect administrator password.' }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
}
