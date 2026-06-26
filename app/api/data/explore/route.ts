import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

interface SampleRow {
  [key: string]: unknown;
}

interface SampleTable {
  columns: string[];
  rows: SampleRow[];
}

const sampleData: Record<string, SampleTable> = {
  tasks: {
    columns: ['id', 'task', 'status', 'priority', 'assignee', 'created_at'],
    rows: [
      { id: 1, task: 'Implement auth middleware', status: 'Done', priority: 'High', assignee: 'Alice', created_at: '2026-06-01' },
      { id: 2, task: 'Write API documentation', status: 'In Progress', priority: 'Medium', assignee: 'Bob', created_at: '2026-06-02' },
      { id: 3, task: 'Fix login redirect bug', status: 'Done', priority: 'High', assignee: 'Alice', created_at: '2026-06-03' },
      { id: 4, task: 'Design dashboard layout', status: 'Pending', priority: 'Low', assignee: 'Carol', created_at: '2026-06-04' },
      { id: 5, task: 'Database migration script', status: 'In Progress', priority: 'High', assignee: 'Bob', created_at: '2026-06-05' },
      { id: 6, task: 'End-to-end tests', status: 'Pending', priority: 'Medium', assignee: 'Carol', created_at: '2026-06-06' },
      { id: 7, task: 'Set up CI/CD pipeline', status: 'Done', priority: 'High', assignee: 'Alice', created_at: '2026-06-07' },
      { id: 8, task: 'User research interviews', status: 'In Progress', priority: 'Low', assignee: 'Carol', created_at: '2026-06-08' },
      { id: 9, task: 'Performance optimization', status: 'Pending', priority: 'Medium', assignee: 'Bob', created_at: '2026-06-09' },
      { id: 10, task: 'Security audit', status: 'Pending', priority: 'High', assignee: 'Alice', created_at: '2026-06-10' },
      { id: 11, task: 'Mobile responsive fixes', status: 'In Progress', priority: 'Medium', assignee: 'Carol', created_at: '2026-06-11' },
      { id: 12, task: 'API rate limiting', status: 'Done', priority: 'High', assignee: 'Bob', created_at: '2026-06-12' },
    ],
  },
  users: {
    columns: ['id', 'name', 'email', 'role', 'active'],
    rows: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', active: true },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', active: true },
      { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Designer', active: true },
      { id: 4, name: 'Dave Brown', email: 'dave@example.com', role: 'Developer', active: false },
      { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Manager', active: true },
    ],
  },
  orders: {
    columns: ['id', 'product', 'amount', 'status', 'customer', 'date'],
    rows: [
      { id: 101, product: 'Wireless Headphones', amount: 79.99, status: 'Shipped', customer: 'Acme Corp', date: '2026-06-01' },
      { id: 102, product: 'USB-C Hub', amount: 34.50, status: 'Processing', customer: 'Globex Inc', date: '2026-06-02' },
      { id: 103, product: 'Mechanical Keyboard', amount: 149.00, status: 'Delivered', customer: 'Initech', date: '2026-05-28' },
      { id: 104, product: '27" Monitor', amount: 399.99, status: 'Shipped', customer: 'Acme Corp', date: '2026-06-03' },
      { id: 105, product: 'Webcam HD', amount: 89.99, status: 'Pending', customer: 'Umbrella Co', date: '2026-06-04' },
      { id: 106, product: 'Desk Lamp', amount: 45.00, status: 'Processing', customer: 'Globex Inc', date: '2026-06-05' },
      { id: 107, product: 'Ergonomic Chair', amount: 599.00, status: 'Delivered', customer: 'Initech', date: '2026-05-20' },
      { id: 108, product: 'Noise Cancelling Earbuds', amount: 199.99, status: 'Shipped', customer: 'Acme Corp', date: '2026-06-06' },
    ],
  },
};

const sampleTables = Object.keys(sampleData);

const DATABASE_URL = process.env.DATABASE_URL;

async function fetchLiveTables(): Promise<string[]> {
  const url = DATABASE_URL!;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Upstream responded with ${res.status}`);
  const body = await res.json();
  if (Array.isArray(body)) return body;
  if (body.tables && Array.isArray(body.tables)) return body.tables;
  if (typeof body === 'object' && body !== null) return Object.keys(body);
  return [];
}

async function fetchLiveTableData(
  table: string,
  search?: string,
  page?: number,
  pageSize?: number,
): Promise<{ columns: string[]; rows: SampleRow[]; total: number }> {
  const params = new URLSearchParams({ table });
  if (search) params.set('search', search);
  if (page !== undefined) params.set('page', String(page));
  if (pageSize !== undefined) params.set('pageSize', String(pageSize));

  const url = `${DATABASE_URL!.replace(/\/+$/, '')}?${params.toString()}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Upstream responded with ${res.status}`);
  const body = await res.json();

  if (body.columns && body.rows) {
    return { columns: body.columns, rows: body.rows, total: body.total ?? body.rows.length };
  }
  if (Array.isArray(body)) {
    const rows = body as SampleRow[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { columns, rows, total: rows.length };
  }
  return { columns: [], rows: [], total: 0 };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined;

    if (DATABASE_URL) {
      try {
        if (!table) {
          const tables = await fetchLiveTables();
          return NextResponse.json({ source: 'live', tables });
        }

        const data = await fetchLiveTableData(table, search, page, pageSize);
        return NextResponse.json({ source: 'live', columns: data.columns, rows: data.rows, total: data.total, table });
      } catch {
        return NextResponse.json(
          { error: 'Failed to connect to the external database. Check DATABASE_URL.' },
          { status: 502 },
        );
      }
    }

    // Sample data fallback
    if (!table) {
      return NextResponse.json({ source: 'sample', tables: sampleTables });
    }

    const sample = sampleData[table];
    if (!sample) {
      return NextResponse.json({ error: `Table "${table}" not found` }, { status: 404 });
    }

    let filtered = sample.rows;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q)),
      );
    }

    const total = filtered.length;
    const safePage = page && page > 0 ? page : 1;
    const safePageSize = pageSize && pageSize > 0 ? pageSize : 50;
    const start = (safePage - 1) * safePageSize;
    const paged = filtered.slice(start, start + safePageSize);

    return NextResponse.json({
      source: 'sample',
      columns: sample.columns,
      rows: paged,
      total,
      table,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
