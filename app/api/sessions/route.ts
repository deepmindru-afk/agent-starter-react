import { NextResponse } from 'next/server';

export const revalidate = 0;

interface Session {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
}

const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Getting Started with AI',
    preview: 'How to use the agent effectively for daily tasks...',
    updatedAt: '2026-05-23T10:30:00Z',
  },
  {
    id: '2',
    title: 'Project Architecture Review',
    preview: 'Discussing the microservices migration strategy and API design patterns...',
    updatedAt: '2026-05-22T14:20:00Z',
  },
  {
    id: '3',
    title: 'Bug Investigation: Login Issue',
    preview: 'Debugging the authentication flow and session management...',
    updatedAt: '2026-05-21T09:15:00Z',
  },
  {
    id: '4',
    title: 'Code Review: PR #142',
    preview: 'Reviewing the new feature implementation for the dashboard...',
    updatedAt: '2026-05-20T16:45:00Z',
  },
  {
    id: '5',
    title: 'Database Optimization',
    preview: 'Analyzing query performance and indexing strategies for the main database...',
    updatedAt: '2026-05-19T11:00:00Z',
  },
  {
    id: '6',
    title: 'Deployment Pipeline Setup',
    preview: 'Setting up CI/CD workflows and monitoring for the production environment...',
    updatedAt: '2026-05-18T08:30:00Z',
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { limit } = body;

    let sessions = [...mockSessions];
    if (limit && typeof limit === 'number') {
      sessions = sessions.slice(0, limit);
    }

    const headers = new Headers({ 'Cache-Control': 'no-store' });
    return NextResponse.json({ sessions }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
