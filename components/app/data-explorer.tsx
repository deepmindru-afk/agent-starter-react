'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
  Search,
  Table2,
} from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

interface TableInfo {
  source: 'sample' | 'live';
  tables: string[];
}

interface TableData {
  source: 'sample' | 'live';
  columns: string[];
  types?: Record<string, string>;
  rows: Record<string, unknown>[];
  total: number;
  table: string;
}

interface SortState {
  column: string;
  dir: 'asc' | 'desc';
}

const PAGE_SIZE = 15;

function isDateColumn(col: string, types?: Record<string, string>): boolean {
  if (types?.[col] === 'datetime' || types?.[col] === 'date' || types?.[col] === 'timestamp') return true;
  const lower = col.toLowerCase();
  return lower.includes('date') || lower.includes('_at') || lower === 'timestamp';
}

export function DataExplorer() {
  const [tables, setTables] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>('');
  const [data, setData] = useState<TableData | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'sample' | 'live'>('sample');
  const [sort, setSort] = useState<SortState | null>(null);
  const [dateColumn, setDateColumn] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detect available date columns from current data
  const dateColumns = useMemo(() => {
    if (!data?.columns) return [];
    return data.columns.filter((col) => isDateColumn(col, data.types));
  }, [data]);

  // Fetch table list on mount
  useEffect(() => {
    fetch('/api/data/explore')
      .then((r) => r.json())
      .then((info: TableInfo) => {
        setTables(info.tables);
        setSource(info.source);
        if (info.tables.length > 0 && !activeTable) setActiveTable(info.tables[0]);
      })
      .catch(() => setError('Failed to load tables'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch table data
  const fetchData = useCallback(async () => {
    if (!activeTable) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ table: activeTable, page: String(page), pageSize: String(PAGE_SIZE) });
      if (search) params.set('search', search);
      if (sort) {
        params.set('sort', sort.column);
        params.set('sortDir', sort.dir);
      }
      if (dateColumn && (dateFrom || dateTo)) {
        params.set('dateColumn', dateColumn);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
      }
      const res = await fetch(`/api/data/explore?${params}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed (${res.status})`);
      }
      const d: TableData = await res.json();
      setData(d);
      setSource(d.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTable, search, page, sort, dateColumn, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (table: string) => {
    setActiveTable(table);
    setPage(1);
    setSearch('');
    setSearchInput('');
    setSort(null);
    setDateColumn(null);
    setDateFrom('');
    setDateTo('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSort = (column: string) => {
    setSort((prev) => {
      if (prev?.column === column) {
        return prev.dir === 'asc' ? { column, dir: 'desc' } : null;
      }
      return { column, dir: 'asc' };
    });
    setPage(1);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Database className="size-3.5 text-sidebar-foreground/50" />
        <span className="text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
          Data Explorer
        </span>
        <span
          className={cn(
            'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            source === 'live'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          )}
        >
          {source === 'live' ? 'Live' : 'Sample'}
        </span>
      </div>

      {/* Table selector */}
      <div className="flex flex-wrap gap-1">
        {tables.map((t) => (
          <button
            key={t}
            onClick={() => handleTableChange(t)}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
              activeTable === t
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
            )}
          >
            <Table2 className="size-3" />
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-sidebar-foreground/40" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search rows..."
          className="w-full rounded-md border border-sidebar-border/40 bg-sidebar-accent/20 py-1.5 pl-7 pr-2 text-xs text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/30 focus:border-sidebar-border/60"
        />
      </form>

      {/* Date range filter */}
      {dateColumns.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-md border border-sidebar-border/30 bg-sidebar-accent/10 p-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-sidebar-foreground/50 uppercase">Filter by date</span>
            <select
              value={dateColumn ?? ''}
              onChange={(e) => { setDateColumn(e.target.value || null); setPage(1); }}
              className="ml-auto rounded border border-sidebar-border/30 bg-sidebar-accent/30 px-1.5 py-0.5 text-[10px] text-sidebar-foreground outline-none"
            >
              <option value="">—</option>
              {dateColumns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          {dateColumn && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full rounded border border-sidebar-border/30 bg-sidebar-accent/20 px-1.5 py-1 text-[10px] text-sidebar-foreground outline-none [color-scheme:dark]"
              />
              <span className="text-[10px] text-sidebar-foreground/40">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full rounded border border-sidebar-border/30 bg-sidebar-accent/20 px-1.5 py-1 text-[10px] text-sidebar-foreground outline-none [color-scheme:dark]"
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-sidebar-foreground/40" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Database className="size-6 text-destructive/40" />
            <p className="text-center text-xs text-destructive/70 leading-relaxed">{error}</p>
          </div>
        ) : data && data.columns.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-sidebar-border/40">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-sidebar-border/20 bg-sidebar-accent/20">
                    {data.columns.map((col) => (
                      <th key={col} className="px-2 py-1.5 text-left">
                        <button
                          onClick={() => handleSort(col)}
                          className={cn(
                            'flex items-center gap-1 font-semibold transition-colors',
                            sort?.column === col
                              ? 'text-sidebar-foreground'
                              : 'text-sidebar-foreground/60 hover:text-sidebar-foreground',
                          )}
                        >
                          {col}
                          {sort?.column === col ? (
                            sort.dir === 'asc' ? (
                              <ArrowUpNarrowWide className="size-3 shrink-0" />
                            ) : (
                              <ArrowDownWideNarrow className="size-3 shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3 shrink-0 opacity-0 group-hover:opacity-40" />
                          )}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        'border-b border-sidebar-border/10 transition-colors',
                        i % 2 === 0 ? 'bg-sidebar-accent/10' : 'bg-transparent',
                        'hover:bg-sidebar-accent/20',
                      )}
                    >
                      {data.columns.map((col) => {
                        const val = row[col];
                        return (
                          <td
                            key={col}
                            className={cn(
                              'max-w-[160px] truncate px-2 py-1.5',
                              isDateColumn(col, data.types)
                                ? 'font-mono text-[10px] text-sidebar-foreground/60'
                                : 'text-sidebar-foreground/80',
                            )}
                            title={String(val ?? '')}
                          >
                            {formatCellValue(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : data ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Table2 className="size-6 text-sidebar-foreground/20" />
            <p className="text-center text-xs text-sidebar-foreground/30 leading-relaxed">No data found</p>
          </div>
        ) : null}
      </div>

      {/* Pagination */}
      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-sidebar-border/20 pt-2">
          <span className="text-[10px] text-sidebar-foreground/40">
            {data.total} row{data.total !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded p-1 text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground disabled:opacity-30"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="min-w-[4ch] text-center text-[10px] text-sidebar-foreground/50">
              {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded p-1 text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground disabled:opacity-30"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toFixed(2);
  }
  if (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('T')) {
    const d = new Date(value);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }
  return String(value);
}
