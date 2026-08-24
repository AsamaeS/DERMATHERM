// ================================================================
// DERMATHERM BACKEND — Firecrawl Integration
// Literature search and retrieval service
// ================================================================

import axios from "axios";

interface PaperMetadata {
  title: string;
  url: string;
  authors?: string[];
  year?: string;
  doi?: string;
  abstract?: string;
  retrieved_at: string;
}

export async function searchLiterature(query: string): Promise<PaperMetadata[]> {
  try {
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY not configured");
    }

    // Firecrawl API call (adjust based on actual Firecrawl API)
    const response = await axios.post(
      "https://api.firecrawl.dev/v0/search",
      {
        query,
        limit: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const results = response.data.results || [];
    
    return results.map((result: any) => ({
      title: result.title || "Untitled",
      url: result.url,
      authors: result.authors,
      year: result.year,
      doi: result.doi || "NOT VERIFIED",
      abstract: result.abstract,
      retrieved_at: new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("Firecrawl search error:", error);
    
    if (error.response) {
      throw new Error(`Firecrawl API error: ${error.response.status}`);
    }
    
    throw new Error(`Failed to search literature: ${error.message}`);
  }
}

export async function fetchPaperContent(url: string): Promise<string> {
  try {
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY not configured");
    }

    const response = await axios.post(
      "https://api.firecrawl.dev/v0/scrape",
      {
        url,
        formats: ["markdown"],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    return response.data.markdown || response.data.text || "";
  } catch (error: any) {
    console.error("Firecrawl scrape error:", error);
    throw new Error(`Failed to fetch paper: ${error.message}`);
  }
}
