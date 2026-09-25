import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

const CLIENT_ID = process.env.NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

const server = new McpServer({
  name: "naver-local-search",
  version: "1.0.0",
});

server.tool(
  "search_local",
  "네이버 지역(업체/장소) 검색을 수행합니다.",
  {
    query: z.string().describe("검색어, 예: '강남 파스타'"),
    display: z.number().optional().describe("결과 개수 (기본 5, 최대 5)"),
  },
  async ({ query, display = 5 }) => {
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
      query
    )}&display=${display}`;

    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        content: [{ type: "text", text: `네이버 API 오류: ${res.status} ${errText}` }],
        isError: true,
      };
    }

    const data = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data.items, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
