# Sylph.js

A log server that gives you deep insights into what's going on in your service(s).

Sylph - Store You Logs in Peace and Harmony

# Features

## Storage

Sylph.js provides two types of data storage: **Log Entries** and **State Objects**.

### Log Entries

A log entry is a structured JSON object that gets appended to the log store. Log entries can contain **any JSON-representable data** and support **tags**, which are arbitrary text values for categorization.

Sylph.js can store millions of log entries without issue.

### State Objects

A state object is a continuously updating JSON object that gives insight into internal state for long-running services. Unlike log entries, a state object has an **ID**, and only **one instance of a state object per ID** can exist at a time. State objects are ideal for tracking real-time service states or persistent variables.

## Insight

### Searching & Viewing Logs

Logs can be searched using an [advanced query language](https://nymph.io/user-guide/entity-querying/) from Nymph.js. The Sylph.js app lets you create these queries from [simple text searches](https://nymph.io/packages/query-parser/). Query options include:

- `limit` - The maximum number of results returned.
- `offset` - The starting point for the returned results.
- `reverse` - Reverses the order of returned results.
- `sort` - Sort logs by a field (default: `cdate`, creation date).

**Queryable Fields & Operators**
Top-level fields in a log entry can be queried using the following operators:

- **Existence Checks**:

  - `defined` - Whether a field is defined.
  - `truthy` - Whether a field evaluates to `true`.

- **Equality & Matching**:

  - `equal` - Whether a field equals a specific value.
  - `contain` - Whether an array field contains a specific value.
  - `match` - Case-sensitive POSIX RegEx match.
  - `imatch` - Case-insensitive POSIX RegEx match.
  - `like` - Case-sensitive SQL `LIKE` pattern match.
  - `ilike` - Case-insensitive SQL `LIKE` pattern match.

- **Numerical Comparisons**:

  - `gt`, `gte`, `lt`, `lte` - Compare greater than, greater than/equal, less than, and less than/equal.

- **Time-Based Queries**:
  - Supports **relative time expressions**, such as `-1 day` (meaning one day before now).

**Note:** While nested JSON data is supported, **only top-level fields** can be queried using the above operators.

Logs can be browsed and filtered in the **Sylph.js app**, making it easy to extract insights from high-volume logging data.

### Graphs & Visualizations

Sylph.js provides **customizable graphing tools** powered by [Chart.js](https://www.chartjs.org/). Available chart types include:

- **Line, Bar, Area**
- **Pie, Doughnut**
- **Radar, Polar Area**
- **Bubble, Scatter**

You can define the query that selects log entries for the chart and specify which fields should be visualized and how, using mathematical formulae powered by [fparser](https://fparser.alexi.ch/) and [Lodash](https://lodash.com/).

## Monitoring & Alerting

### Dashboards

You can create and manage dashboards in the Sylph.js app. Dashboards can display real-time log and state data through user-defined charts.

### Push Notifications & Alerts

- **Available through Sylph.js' Progressive Web App** - Supports push notifications on **iOS, Android, and desktop devices**.
- **User-defined alert rules** - Alerts are triggered based on query conditions using the same filtering options as log searches.

# Copyright

Copyright (C) SciActive Inc - All Rights Reserved

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3 of the License.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
