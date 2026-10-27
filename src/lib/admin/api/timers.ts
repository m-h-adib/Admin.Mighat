import { db, newId, nowIso } from "@/lib/admin/store";
import { MAX_TIMERS, type ID, type Timer, type TimerRow, type TimerState } from "@/lib/admin/types";

export type TimerInput = Omit<Timer, "id" | "updatedAt">;

function timerState(
  timer: Pick<Timer, "active" | "startsAt" | "endsAt">,
  now = Date.now(),
): TimerState {
  if (!timer.active) return "inactive";
  if (new Date(timer.endsAt).getTime() <= now) return "ended";
  if (timer.startsAt && new Date(timer.startsAt).getTime() > now) return "scheduled";
  return "running";
}

const order: Record<TimerState, number> = { running: 0, scheduled: 1, ended: 2, inactive: 3 };

export async function listTimers(): Promise<TimerRow[]> {
  const now = Date.now();
  return db.timers
    .map((timer) => ({ ...timer, state: timerState(timer, now) }))
    .sort((a, b) => order[a.state] - order[b.state] || a.endsAt.localeCompare(b.endsAt));
}

export async function getTimer(id: ID) {
  return db.timers.find((item) => item.id === id);
}

export async function createTimer(input: TimerInput): Promise<ID | undefined> {
  if (db.timers.length >= MAX_TIMERS) return undefined;
  const timer: Timer = { ...input, id: newId(), updatedAt: nowIso() };
  db.timers.push(timer);
  return timer.id;
}

export async function updateTimer(id: ID, input: Partial<TimerInput>) {
  const timer = db.timers.find((item) => item.id === id);
  if (timer) Object.assign(timer, input, { updatedAt: nowIso() });
}

export async function deleteTimer(id: ID) {
  db.timers = db.timers.filter((item) => item.id !== id);
}
