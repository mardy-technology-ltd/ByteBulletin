async function resolveUrl(url: string): Promise<string> {
  if (!url.includes("news.google.com")) return url;
  
  // Strategy 1: Decode from base64url path parameter (Fastest)
  const match = url.match(/articles\/([a-zA-Z0-9-_]+)/);
  if (match) {
    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf8');
      const urlMatch = decoded.match(/https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+/);
      if (urlMatch) {
        return urlMatch[0];
      }
    } catch (e) {
      // Ignore decoding errors
    }
  }

  // Strategy 2: Fetch the intermediate page and extract from data-n-a-id or meta refresh
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const metaRefreshMatch = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i);
      if (metaRefreshMatch && metaRefreshMatch[1]) {
         return metaRefreshMatch[1];
      }
      
      const aHrefMatch = html.match(/<a[^>]+href=["'](https?:\/\/[^"']+)["']/i);
      if (aHrefMatch && aHrefMatch[1]) {
         return aHrefMatch[1];
      }
    }
    return res.url; 
  } catch (err) {
    return url;
  }
}

async function run() {
  const url2 = 'https://news.google.com/rss/articles/CBMicWh0dHBzOi8vd3d3Lndhc2hpbmd0b25wb3N0LmNvbS93ZWxsbmVzcy8yMDI1LzAxLzI4L2xlYXJuaW5nLWxhbmd1YWdlLW11c2ljYWwtaW5zdHJ1bWVudC1wcmV2ZW50LWNvZ25pdGl2ZS1kZWNsaW5lL9IBAA?oc=5';
  console.log("Resolved 2:", await resolveUrl(url2));
}

run();
