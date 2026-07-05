import axios from "axios";
import YahooFinance from "yahoo-finance2";
import NodeCache from "node-cache";
import { getMarketStatus } from "../utils/marketStatus";

const yahoo = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

const cache = new NodeCache({
  stdTTL: 60,
});

const SYMBOLS = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^BSESN", name: "SENSEX" },
  { symbol: "RELIANCE.NS", name: "RELIANCE" },
  { symbol: "TCS.NS", name: "TCS" },
  { symbol: "HDFCBANK.NS", name: "HDFC BANK" },
  { symbol: "INFY.NS", name: "INFOSYS" },
];

export const marketService = {

  async getTicker() {

    const cached = cache.get("ticker");

    if (cached) return cached;

    const data = [];

    for (const stock of SYMBOLS) {

      try {

        const quote = await yahoo.quote(stock.symbol);

        if (!quote) continue;

        data.push({

          symbol: stock.name,

          price: Number(
            quote.regularMarketPrice || 0
          ).toLocaleString("en-IN"),

          change: `${(
            quote.regularMarketChangePercent || 0
          ).toFixed(2)}%`,

          color:
            (quote.regularMarketChangePercent || 0) >= 0
              ? "#10B981"
              : "#EF4444",

        });

      } catch {}
    }

    cache.set("ticker", data);

    return data;
  },

  async getNews() {

    const cached = cache.get("news");

    if (cached) return cached;

    const url =
      `https://api.marketaux.com/v1/news/all` +
      `?countries=in` +
      `&language=en` +
      `&limit=3` +
      `&api_token=${process.env.MARKETAUX_API_KEY}`;

    const response = await axios.get(url);

    const news = response.data.data.map((item:any)=>({

      title:item.title,

      source:item.source,

      url:item.url,

      publishedAt:item.published_at,

      sentiment:item.sentiment ?? "neutral"

    }));

    cache.set("news",news);

    return news;

  },

  async getHome(){

    return{

      market:getMarketStatus(),

      ticker:await this.getTicker(),

      insights:await this.getNews()

    }

  }

};