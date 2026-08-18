export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'en';

  if (!text) {
    return new Response('Text is required', { status: 400 });
  }

  // Map 11 language codes for audio synthesis
  const langMap: Record<string, string> = {
    en: 'en-IN',
    hi: 'hi',
    ta: 'ta',
    te: 'te',
    mr: 'mr',
    bn: 'bn',
    gu: 'gu',
    pa: 'pa',
    kn: 'kn',
    ml: 'ml',
    ur: 'ur',
  };

  const targetLang = langMap[lang] || lang;
  // Limit chunk length for single TTS query
  const trimmed = text.slice(0, 200);
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(trimmed)}&tl=${targetLang}&client=tw-ob`;

  try {
    const res = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!res.ok) {
      return new Response('TTS provider error', { status: 502 });
    }

    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    return new Response('Failed to generate audio', { status: 500 });
  }
}
