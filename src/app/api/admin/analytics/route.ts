export const runtime = "edge";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";

const ACCOUNT_ID = "c2dfc3a827856fdf810bd2afef51f676";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = getRequestContext();
    const apiToken = (env as unknown as Record<string, string>).CF_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json({ error: "Analytics not configured" }, { status: 500 });
    }

    // Fetch last 7 days of analytics using Cloudflare GraphQL API
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateStart = weekAgo.toISOString().split("T")[0];
    const dateEnd = now.toISOString().split("T")[0];

    const query = `{
      viewer {
        accounts(filter: {accountTag: "${ACCOUNT_ID}"}) {
          httpRequests1dGroups(
            filter: {date_geq: "${dateStart}", date_leq: "${dateEnd}"}
            limit: 7
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { requests pageViews }
            uniq { uniques }
          }
        }
      }
    }`;

    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    const data = await res.json();
    const days = data?.data?.viewer?.accounts?.[0]?.httpRequests1dGroups || [];

    const totalViews = days.reduce((acc: number, d: { sum: { pageViews: number } }) => acc + (d.sum?.pageViews || 0), 0);
    const totalVisitors = days.reduce((acc: number, d: { uniq: { uniques: number } }) => acc + (d.uniq?.uniques || 0), 0);
    const totalRequests = days.reduce((acc: number, d: { sum: { requests: number } }) => acc + (d.sum?.requests || 0), 0);

    return NextResponse.json({
      period: "Last 7 days",
      totalViews,
      totalVisitors,
      totalRequests,
      daily: days.map((d: { dimensions: { date: string }; sum: { pageViews: number; requests: number }; uniq: { uniques: number } }) => ({
        date: d.dimensions.date,
        views: d.sum?.pageViews || 0,
        visitors: d.uniq?.uniques || 0,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 500 });
  }
}
