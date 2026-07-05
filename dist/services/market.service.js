"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketService = void 0;
const axios_1 = __importDefault(require("axios"));
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const node_cache_1 = __importDefault(require("node-cache"));
const marketStatus_1 = require("../utils/marketStatus");
const yahoo = new yahoo_finance2_1.default({
    suppressNotices: ["yahooSurvey"],
});
const cache = new node_cache_1.default({
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
exports.marketService = {
    async getTicker() {
        const cached = cache.get("ticker");
        if (cached)
            return cached;
        const data = [];
        for (const stock of SYMBOLS) {
            try {
                const quote = await yahoo.quote(stock.symbol);
                if (!quote)
                    continue;
                data.push({
                    symbol: stock.name,
                    price: Number(quote.regularMarketPrice || 0).toLocaleString("en-IN"),
                    change: `${(quote.regularMarketChangePercent || 0).toFixed(2)}%`,
                    color: (quote.regularMarketChangePercent || 0) >= 0
                        ? "#10B981"
                        : "#EF4444",
                });
            }
            catch { }
        }
        cache.set("ticker", data);
        return data;
    },
    async getNews() {
        const cached = cache.get("news");
        if (cached)
            return cached;
        const url = `https://api.marketaux.com/v1/news/all` +
            `?countries=in` +
            `&language=en` +
            `&limit=3` +
            `&api_token=${process.env.MARKETAUX_API_KEY}`;
        const response = await axios_1.default.get(url);
        const news = response.data.data.map((item) => ({
            title: item.title,
            source: item.source,
            url: item.url,
            publishedAt: item.published_at,
            sentiment: item.sentiment ?? "neutral"
        }));
        cache.set("news", news);
        return news;
    },
    async getHome() {
        return {
            market: (0, marketStatus_1.getMarketStatus)(),
            ticker: await this.getTicker(),
            insights: await this.getNews()
        };
    }
};
