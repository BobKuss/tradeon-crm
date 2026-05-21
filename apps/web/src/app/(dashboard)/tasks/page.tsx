'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiGetTasks, apiUpdateTask } from '@/lib/api';
import { getStaffById } from '@/lib/mock-data';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskStatusBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Avatar } from '@/components/ui/Avatar';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
];

function isOverdue(dueAt?: string, status?: TaskStatus) {
  if (!dueAt || status === 'done' || status === 'cancelled') return false;
  return new Date(dueAt) < new Date();
}

function formatDueDate(dueAt?: string, status?: TaskStatus) {
  if (!dueAt) return '—';
  const date = new Date(dueAt);
  const overdue = isOverdue(dueAt, status);
  const label = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return { label, overdue };
}

export default function TasksPage() {
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiGetTasks({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100,
      });
      setTasks(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function markDone(task: Task) {
    if (task.status === 'done') return;
    setUpdatingId(task.id);
    try {
      const updated = await apiUpdateTask(task.id, { status: 'done' });
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      // silent — task list stays as-is
    } finally {
      setUpdatingId(null);
    }
  }

  const openCount = tasks.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const overdueCount = tasks.filter(t => isOverdue(t.dueAt, t.status)).length;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Open / In Progress" value={openCount} />
        <StatChip label="Overdue" value={overdueCount} color={overdueCount > 0 ? 'text-red-600' : undefined} />
        <StatChip label="Total" value={tasks.length} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === opt.value
                  ? 'bg-brand-red text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : tasks.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">
          No tasks found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left">Task</th>
                <th className="px-3 py-3 text-left">Company</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Due Date</th>
                <th className="px-3 py-3 text-left">Assigned</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map(task => {
                const assigned = task.assignedUserId ? getStaffById(task.assignedUserId) : undefined;
                const due = formatDueDate(task.dueAt, task.status);
                const isDone = task.status === 'done';
                const isUpdating = updatingId === task.id;

                return (
                  <tr key={task.id} className={`hover:bg-gray-50 ${isDone ? 'opacity-60' : ''}`}>
                    <td className="py-3 pl-4 pr-3 max-w-xs">
                      <p className={`font-medium text-brand-dark ${isDone ? 'line-through' : ''}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-0.5 text-xs text-gray-400 truncate">{task.description}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {task.companyName ?? '—'}
                    </td>
                    <td className="px-3 py-3">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="px-3 py-3">
                      {typeof due === 'string' ? (
                        <span className="text-gray-400">{due}</span>
                      ) : (
                        <span className={due.overdue ? 'font-medium text-red-600' : 'text-gray-600'}>
                          {due.overdue && (
                            <span className="mr-1 text-red-500">!</span>
                          )}
                          {due.label}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {assigned ? (
                        <Avatar initials={assigned.initials} color={assigned.color} size="sm" title={assigned.name} />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {!isDone && (
                        <button
                          onClick={() => markDone(task)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-50 transition-colors"
                        >
                          {isUpdating ? (
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Mark done
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded border border-gray-200 bg-white px-4 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color ?? 'text-brand-dark'}`}>{value}</p>
    </div>
  );
}
