export interface ResultDisplayBase {
  title: string;
}

export interface ResultDisplayText extends ResultDisplayBase {
  displayType: 'text';
}

export interface ResultDisplayChartBase extends ResultDisplayBase {
  displayType: 'chart';
}

export interface ResultDisplayChartLine extends ResultDisplayChartBase {
  chartType: 'line';
}

export type ResultDisplay = ResultDisplayText | ResultDisplayChartLine;
