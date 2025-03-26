import type { Nymph, EntityConstructor } from '@nymphjs/client';
import { queryParser } from '@nymphjs/query-parser';

export function parseLogEntrySearch<T extends EntityConstructor>(
  query: string,
  nymph: Nymph,
) {
  const LogEntry = nymph.getEntityClass('LogEntry') as T;

  return queryParser({
    query,
    entityClass: LogEntry,
  });
}

export function parseStateObjectSearch<T extends EntityConstructor>(
  query: string,
  nymph: Nymph,
) {
  const StateObject = nymph.getEntityClass('StateObject') as T;

  return queryParser({
    query,
    entityClass: StateObject,
    defaultFields: ['id'],
  });
}
