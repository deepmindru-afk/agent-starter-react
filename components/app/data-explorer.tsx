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
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/shadcn/utils';

interface TableInfo {
  source: 'sample' | 'live';
  tables: string[];
}

interface TableData {
  source: 'sample' | 'live' | 'external';
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
  const [source, setSource] = useState<'sample' | 'live' | 'external'>('sample');
  const [sort, setSort] = useState<SortState | null>(null);
  const [dateColumn, setDateColumn] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

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
      .catch(() => setError('Не удалось загрузить таблицы'));
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
    if (!externalUrl) {
      fetchData();
    }
  }, [fetchData, externalUrl]);

  const fetchExternalData = async () => {
    if (!externalUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(externalUrl);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      
      let rows: any[] = [];
      if (Array.isArray(json)) {
        rows = json;
      } else if (json && typeof json === 'object') {
        // Try to find an array property if the root is an object
        const arrayKey = Object.keys(json).find(key => Array.isArray((json as any)[key]));
        if (arrayKey) {
          rows = (json as any)[arrayKey];
        } else {
          rows = [json];
        }
      }

      if (rows.length === 0) throw new Error('JSON не содержит массива данных');

      const columns = Object.keys(rows[0]);
      setData({
        source: 'external',
        columns,
        rows,
        total: rows.length,
        table: 'External URL',
      });
      setSource('external');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка при загрузке внешних данных');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (table: string) => {
    setActiveTable(table);
    setExternalUrl('');
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
          Обозреватель данных
        </span>
        <span
          className={cn(
            'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            source === 'live'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : source === 'external'
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          )}
        >
          {source === 'live' ? 'В реальном времени' : source === 'external' ? 'Внешний URL' : 'Пример'}
        </span>
      </div>

      {/* External URL input */}
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <LinkIcon className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-sidebar-foreground/40" />
          <Input
            type="text"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchExternalData(); }}
            placeholder="URL для получения JSON..."
            className="border-sidebar-border/40 bg-sidebar-accent/20 py-1.5 pl-7 pr-2 text-xs placeholder:text-sidebar-foreground/30"
          />
        </div>
        <Button 
          size="sm" 
          onClick={fetchExternalData} 
          disabled={!externalUrl || loading}
          className="h-8 px-2 text-[10px]"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : 'Загрузить'}
        </Button>
      </div>

      {/* Table selector */}
      <div className="flex flex-wrap gap-1">
        {tables.map((t) => (
          <Button
            key={t}
            variant="ghost"
            size="sm"
            onClick={() => handleTableChange(t)}
            className={cn(
              'gap-1 px-2 py-1 text-[11px] font-medium',
              activeTable === t && !externalUrl
                ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
            )}
          >
            <Table2 className="size-3" />
            {t}
          </Button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-sidebar-foreground/40" />
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Поиск строк..."
          className="border-sidebar-border/40 bg-sidebar-accent/20 py-1.5 pl-7 pr-2 text-xs placeholder:text-sidebar-foreground/30"
        />
      </form>

      {/* Date range filter */}
      {dateColumns.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-md border border-sidebar-border/30 bg-sidebar-accent/10 p-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-sidebar-foreground/50 uppercase">Фильтр по дате</span>
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
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="border-sidebar-border/30 bg-sidebar-accent/20 px-1.5 py-1 text-[10px] [color-scheme:dark]"
              />
              <span className="text-[10px] text-sidebar-foreground/40">→</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="border-sidebar-border/30 bg-sidebar-accent/20 px-1.5 py-1 text-[10px] [color-scheme:dark]"
              />
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="relative flex-1 overflow-hidden rounded-md border border-sidebar-border/40 bg-sidebar-accent/10">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-sidebar-accent/50 backdrop-blur-sm">
            <Loader2 className="size-4 animate-spin text-sidebar-foreground" />
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-destructive">{error}</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={externalUrl ? fetchExternalData : fetchData}
                className="mx-auto h-7 text-[10px]"
              >
                Повторить
              </Button>
            </div>
          </div>
        )}

        {!error && data && (
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-sidebar-accent z-10">
                <TableRow className="border-sidebar-border/40">
                  {data.columns.map((col) => (
                    <TableHead
                      key={col}
                      onClick={() => handleSort(col)}
                      className={cn(
                        'cursor-pointer px-2 py-1 text-left text-[10px] font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground',
                        sort?.column === col && 'text-sidebar-foreground'
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {col}
                        {sort?.column === col && (
                          sort.dir === 'asc' ? <ArrowUpNarrowWide className="size-2.5" /> : <ArrowDownWideNarrow className="size-2.5" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((row, i) => (
                  <TableRow key={i} className="border-sidebar-border/20 hover:bg-sidebar-accent/30">
                    {data.columns.map((col) => (
                      <TableCell key={col} className="px-2 py-1 text-[10px] text-sidebar-foreground/80">
                        {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-sidebar-foreground/50">
            Страница {page} из {totalPages} ({data.total} строк)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
