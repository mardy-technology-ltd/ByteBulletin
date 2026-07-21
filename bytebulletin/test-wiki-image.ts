async function testWikipediaImage(query: string) {
  try {
    const headers = {
      'User-Agent': 'ByteBulletin/1.0 (test@bytebulletin.com)'
    };
    
    // Search for the page first
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&srlimit=1`;
    const searchRes = await fetch(searchUrl, { headers });
    if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.statusText}`);
    const searchData = await searchRes.json();
    
    if (searchData.query.search.length > 0) {
      const title = searchData.query.search[0].title;
      console.log(`[${query}] -> Wikipedia page: ${title}`);
      
      // Get the page summary which includes the main image
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const summaryRes = await fetch(summaryUrl, { headers });
      const summaryData = await summaryRes.json();
      
      if (summaryData.thumbnail && summaryData.thumbnail.source) {
        console.log(`[${query}] -> Image URL: ${summaryData.thumbnail.source}`);
      } else {
        console.log(`[${query}] -> No image found for page: ${title}`);
      }
    } else {
      console.log(`[${query}] -> No Wikipedia page found for query`);
    }
  } catch (error) {
    console.error(`[${query}] -> Error:`, error);
  }
}

async function runTestWiki() {
  await testWikipediaImage("Spain women's national football team");
  await testWikipediaImage("Lionel Messi");
  await testWikipediaImage("Apple Inc");
  await testWikipediaImage("Cyclone Remal");
}

runTestWiki();
