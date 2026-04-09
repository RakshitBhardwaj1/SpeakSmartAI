# MONITORING & OBSERVABILITY DOC

Project: SpeakSmartAI  
Goal: Add system visibility using metrics and dashboards.

## 0. Objective

We need reliable answers for:
- Request volume
- API latency
- Job failure rate
- Job processing duration trends

## 1. Stack (Fixed)

Use only:
- Prometheus (metrics collection)
- Grafana (visualization)

No additional telemetry stack is required for this phase.

## 2. Backend Metrics Setup

Dependencies added in `speech-analysis-api/requirements.txt`:
- `prometheus-fastapi-instrumentator`
- `prometheus_client`

FastAPI instrumentation:
- Added in `speech-analysis-api/main.py`
- Exposes `/metrics` endpoint automatically

Custom metrics implemented in:
- `speech-analysis-api/app/services/metrics.py`

Metrics:
- `jobs_total`
- `jobs_failed`
- `job_duration_seconds`

Metrics are updated in async job pipeline:
- `speech-analysis-api/app/api/analysis.py`

Rules enforced:
- every job updates total count
- failed jobs increment failure counter
- processing duration always observed

## 3. Prometheus Setup

Config file:
- `speech-analysis-api/observability/prometheus.yml`

Content:
```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "fastapi"
    static_configs:
      - targets: ["localhost:8000"]
```

Run Prometheus:
```bash
prometheus --config.file=speech-analysis-api/observability/prometheus.yml
```

Verify:
- Open `http://localhost:9090`
- Query `jobs_total` and `job_duration_seconds`

## 4. Grafana Setup

1. Start Grafana.
2. Add data source:
- Type: Prometheus
- URL: `http://localhost:9090`
3. Save and test connection.

## 5. Required Dashboard Panels

Create panels for:
1. Request Rate:
- `http_requests_total`

2. API Latency:
- `http_request_duration_seconds`

3. Total Jobs:
- `jobs_total`

4. Failed Jobs:
- `jobs_failed`

5. Job Processing Time:
- `job_duration_seconds`

## 6. Success Criteria

Monitoring is complete only if:
- `/metrics` endpoint is live
- Prometheus scrapes FastAPI successfully
- Grafana shows live metric updates
- Job metrics move under real processing
- Failures are visible through `jobs_failed`
- Processing time is measurable via histogram

## 7. Common Mistakes to Avoid

- dashboards with only default metrics and no job visibility
- metrics defined but not incremented in pipeline code
- wrong Prometheus scrape target
- no failure tracking path

## 8. Team Insights Required

After setup, team should be able to answer quickly:
- average processing time per job
- failure rate trend over time
- request load profile
- current performance bottlenecks
