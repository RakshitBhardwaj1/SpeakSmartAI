from prometheus_client import Counter, Histogram


# Total jobs that finished (completed or failed)
jobs_total = Counter("jobs_total", "Total jobs processed")

# Total failed jobs
jobs_failed = Counter("jobs_failed", "Total failed jobs")

# End-to-end job processing duration in seconds
job_duration = Histogram("job_duration_seconds", "Time taken for job processing")