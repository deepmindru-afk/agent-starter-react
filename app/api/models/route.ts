import { NextResponse } from 'next/server';

export const revalidate = 0;

const LM_API_BASE = 'https://lm.portalos.ru';
const BEARER_TOKEN = 'sk-bf-1d6629bc-fe02-44f8-8f43-1fc09a905120';

export async function POST() {
  try {
    const res = await fetch(`${LM_API_BASE}/v1/models`, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const models = (data.data ?? []).map((m: { id: string }) => ({
      id: m.id,
      name: m.id,
    }));

    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
