export interface LogQueryBase {
  label: string;
  query: string;
}

export interface LogQuerySelect extends LogQueryBase {
  queryType: 'select';
}

export interface LogQueryAggregateBase extends LogQueryBase {
  queryType: 'aggregate';
}

export interface LogQueryAggregateTimeAbsolute extends LogQueryAggregateBase {
  aggregationType: 'absolute-time';
  aggregationAbsoluteTimeStart: number;
  aggregationAbsoluteTimeEnd: number;
  aggregationTimeStep: number;
  aggregationFormula: string;
}

export interface LogQueryAggregateTimeRelative extends LogQueryAggregateBase {
  aggregationType: 'relative-time';
  aggregationRelativeTimeStart: string;
  aggregationRelativeTimeEnd: string;
  aggregationTimeStep: number;
  aggregationFormula: string;
}

export interface LogQueryAggregateChunks extends LogQueryAggregateBase {
  aggregationType: 'chunks';
  aggregationChunksChunkLength: number;
  aggregationFormula: string;
}

export type LogQuery =
  | LogQuerySelect
  | LogQueryAggregateTimeAbsolute
  | LogQueryAggregateTimeRelative
  | LogQueryAggregateChunks;

export interface LogResultSelect {
  [k: string]: any;
}

export type LogResultsSelect = LogResultSelect[];

export interface LogResultAggregateTime {
  begin: number;
  end: number;
  value: number;
}

export type LogResultsAggregateTime = LogResultAggregateTime[];

export interface LogResultAggregateChunks {
  chunk: number;
  value: number;
}

export type LogResultsAggregateChunks = LogResultAggregateChunks[];

export type LogResult =
  | LogResultSelect
  | LogResultAggregateTime
  | LogResultAggregateChunks;

export type LogResults = {
  [k: string]:
    | {
        label: string;
        type: 'select';
        results: LogResultsSelect;
      }
    | {
        label: string;
        type: 'aggregate-time';
        results: LogResultsAggregateTime;
      }
    | {
        label: string;
        type: 'aggregate-chunks';
        results: LogResultsAggregateChunks;
      };
};
