# Monitoring Dashboard Setup

## Rollbar RQL Queries

Use these queries in the Rollbar dashboard to visualize health.

### 1. Error Rate by Context
```sql
SELECT context, count(*) as count
FROM item_occurrence
WHERE item.level = 'error'
group by context
order by count desc
```

### 2. Slow Server Actions (> 1s)
```sql
SELECT body.message.body, data.custom.duration
FROM item_occurrence
WHERE item.level = 'info'
AND context = 'server_action'
AND data.custom.duration > 1000
ORDER BY data.custom.duration DESC
```

### 3. Core Web Vitals (LCP)
```sql
SELECT data.custom.value, data.custom.rating, data.custom.path
FROM item_occurrence
WHERE context = 'performance.vitals'
AND data.custom.metric_name = 'LCP'
```

### 4. Auth Failures
```sql
SELECT data.custom.email, body.message.body
FROM item_occurrence
WHERE context LIKE 'auth.%'
AND item.level = 'warning'
```
