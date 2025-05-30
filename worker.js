import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Handle API routes
async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    
    // Handle config endpoint
    if (url.pathname === '/api/config') {
        const config = {
            TWITCH_CLIENT_ID: env.TWITCH_CLIENT_ID,
            TWITCH_ACCESS_TOKEN: env.TWITCH_ACCESS_TOKEN,
            YOUTUBE_CHANNEL_ID: env.YOUTUBE_CHANNEL_ID,
            YOUTUBE_API_KEY: env.YOUTUBE_API_KEY,
            TIKTOK_CLIENT_KEY: env.TIKTOK_CLIENT_KEY,
            TIKTOK_CLIENT_SECRET: env.TIKTOK_CLIENT_SECRET,
            TWITCH_USERNAME: 'namlamron'
        };

        return new Response(JSON.stringify(config), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    // Handle TikTok authentication
    if (url.pathname === '/api/tiktok/auth' && request.method === 'POST') {
        try {
            const { code } = await request.json();
            
            // Exchange the code for an access token
            const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_key: env.TIKTOK_CLIENT_KEY,
                    client_secret: env.TIKTOK_CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: 'https://namlamron.com/unified-chat/tiktok-callback.html'
                })
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to exchange code for token');
            }

            const tokenData = await tokenResponse.json();
            
            // Store the access token in Cloudflare KV
            await env.TWITCH_TOKENS.put('tiktok_access_token', tokenData.access_token);
            await env.TWITCH_TOKENS.put('tiktok_refresh_token', tokenData.refresh_token);

            return new Response(JSON.stringify({ success: true }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }
    }

    // Handle Twitch token exchange
    if (url.pathname === '/api/twitch/token' && request.method === 'POST') {
        try {
            const { code } = await request.json();
            
            // Exchange the code for an access token
            const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: env.TWITCH_CLIENT_ID,
                    client_secret: env.TWITCH_CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: 'https://namlamron.com/unified-chat/auth-callback.html'
                })
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to exchange code for token');
            }

            const tokenData = await tokenResponse.json();
            
            // Store the access token in Cloudflare KV
            await env.TWITCH_TOKENS.put('access_token', tokenData.access_token);
            await env.TWITCH_TOKENS.put('refresh_token', tokenData.refresh_token);

            return new Response(JSON.stringify({ success: true }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }
    }

    return new Response('Not Found', { status: 404 });
}

// Handle static assets
async function handleStaticRequest(request, env) {
    try {
        return await getAssetFromKV({
            request,
            waitUntil: promise => promise
        });
    } catch (e) {
        return new Response('Not Found', { status: 404 });
    }
}

// Main request handler
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }

        // Handle API routes
        if (url.pathname.startsWith('/api/')) {
            return handleApiRequest(request, env);
        }

        // Handle static assets
        return handleStaticRequest(request, env);
    }
}; 