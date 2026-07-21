/**
 * Fetches a highly relevant image URL for a given keyword using the free Wikipedia API.
 * 
 * @param keyword The primary entity (person, team, company, event) to search for.
 * @returns A high-resolution image URL if found, otherwise null.
 */
export async function fetchWikipediaImage(keyword: string): Promise<string | null> {
  if (!keyword || keyword.trim() === '') return null;

  try {
    const headers = {
      'User-Agent': 'ByteBulletin/1.0 (contact@bytebulletin.com)'
    };
    
    // 1. Search for the Wikipedia page using the exact keyword
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}&utf8=&format=json&srlimit=1`;
    const searchRes = await fetch(searchUrl, { headers });
    
    if (!searchRes.ok) {
      console.error(`Wikipedia search failed: ${searchRes.statusText}`);
      return null;
    }
    
    const searchData = await searchRes.json();
    
    if (searchData.query?.search?.length > 0) {
      const title = searchData.query.search[0].title;
      
      // 2. Get the page summary which includes the main image
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const summaryRes = await fetch(summaryUrl, { headers });
      
      if (!summaryRes.ok) {
        return null;
      }
      
      const summaryData = await summaryRes.json();
      
      // 3. Return the original (high-res) image if available, else thumbnail
      if (summaryData.original && summaryData.original.source) {
        return summaryData.original.source;
      } else if (summaryData.thumbnail && summaryData.thumbnail.source) {
        // Fallback to thumbnail, but try to remove the size restriction for a better quality image
        const url = summaryData.thumbnail.source;
        // e.g. https://upload.wikimedia.org/wikipedia/commons/thumb/x/xy/file.jpg/320px-file.jpg
        return url;
      }
    }
  } catch (error) {
    console.error(`Error fetching Wikipedia image for keyword "${keyword}":`, error);
  }
  
  return null;
}
