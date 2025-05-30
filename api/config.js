export async function onRequest(context) {
    // Get environment variables from Cloudflare
    const config = {
        TWITCH_CLIENT_ID: context.env.TWITCH_CLIENT_ID,
        TWITCH_ACCESS_TOKEN: context.env.TWITCH_ACCESS_TOKEN,
        YOUTUBE_CHANNEL_ID: context.env.YOUTUBE_CHANNEL_ID,
        YOUTUBE_API_KEY: context.env.YOUTUBE_API_KEY,
        TIKTOK_CLIENT_KEY: context.env.TIKTOK_CLIENT_KEY,
        TIKTOK_CLIENT_SECRET: context.env.TIKTOK_CLIENT_SECRET
    };

    return new Response(JSON.stringify(config), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
} 