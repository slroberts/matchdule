/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { fetchSchedule } from '@/lib/schedule';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes (edge/CDN)

export async function GET() {
  try {
    const data = await fetchSchedule();
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Fetch failed' },
      { status: 500 }
    );
  }
}
