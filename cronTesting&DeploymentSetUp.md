# 🚀 Cron Job Setup — UNAIledIt Backend

This guide explains how to:

* 🧪 Manually test cron endpoints (localhost)
* ⚙️ Enable automated cron jobs using Supabase (`pg_cron + pg_net`)
* 🔒 Secure cron jobs using secrets
* 📊 Monitor cron execution

---

# ⚠️ BEFORE YOU START

Make sure:

* ✅ Backend is working locally
* ✅ All endpoints are tested (Postman / curl)
* ✅ Backend is deployed (Render / etc.)
* ✅ Secrets match your `.env`
* ❌ Do NOT use `localhost` in Supabase cron

---

# 🧪 1. Manual Testing (LOCALHOST)

Base URL:

```
http://localhost:5000
```

---

## 🔔 Booking Reminder

```
POST /api/jobs/send-booking-reminders
```

```bash
curl -X POST "http://localhost:5000/api/jobs/send-booking-reminders" \
  -H "Authorization: Bearer UNailedit_reminder_secret_2026" \
  -H "Content-Type: application/json"
```

---

## ⏳ Booking Expiry

```
POST /api/jobs/booking-expiry
```

```bash
curl -X POST "http://localhost:5000/api/jobs/booking-expiry" \
  -H "Authorization: Bearer UNailedit_booking_x9K2pL7sQ4mN8vR1_2026" \
  -H "Content-Type: application/json"
```

---

## ⛔ Slot Blocking

```
POST /api/jobs/block-past-slots
```

```bash
curl -X POST "http://localhost:5000/api/jobs/block-past-slots" \
  -H "Authorization: Bearer UNailedit_block_x7P9mL2kQ5zR8vT1_2026" \
  -H "Content-Type: application/json"
```

---

## 🧹 Slot Cleanup

```
POST /api/jobs/cleanup-old-slots
```

```bash
curl -X POST "http://localhost:5000/api/jobs/cleanup-old-slots" \
  -H "Authorization: Bearer UNailedit_cleanup_k8P3mL7qR2vT9xN_2026" \
  -H "Content-Type: application/json"
```

---

## 📊 Monthly Report (Cron Endpoint)

```
POST /api/jobs/generate-monthly-report
```

```bash
curl -X POST "http://localhost:5000/api/jobs/generate-monthly-report" \
  -H "Authorization: Bearer unailedit_monthly_report_secret_2026" \
  -H "Content-Type: application/json"
```

---

## 📊 Monthly Report (Manual)

```
POST /api/jobs/generate-monthly-report/manual
```

```bash
curl -X POST "http://localhost:5000/api/jobs/generate-monthly-report/manual" \
  -H "Content-Type: application/json"
```

---

## 📄 List Monthly Reports

```
GET /api/jobs/monthly-reports
```

```bash
curl -X GET "http://localhost:5000/api/jobs/monthly-reports"
```

---

# ⚙️ 2. Supabase Cron Setup

## ⚠️ IMPORTANT

Replace this:

```
https://your-api-url.com
```

With your deployed backend:

```
https://unailedit-api.onrender.com
```

---

## 🔔 Booking Reminder (Every 5 Minutes)

```sql
select cron.schedule(
  'booking-reminder-job',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/send-booking-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer UNailedit_reminder_secret_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## ⏳ Booking Expiry (Every Minute)

```sql
select cron.schedule(
  'booking-expiry-job',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/booking-expiry',
    headers := jsonb_build_object(
      'Authorization', 'Bearer UNailedit_booking_x9K2pL7sQ4mN8vR1_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## ⛔ Slot Blocking (Every 5 Minutes)

```sql
select cron.schedule(
  'slot-block-job',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/block-past-slots',
    headers := jsonb_build_object(
      'Authorization', 'Bearer UNailedit_block_x7P9mL2kQ5zR8vT1_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## 🧹 Slot Cleanup (Daily - Midnight PH Time)

> Supabase uses UTC
> `0 16 * * *` = 12:00 AM (PH Time)

```sql
select cron.schedule(
  'slot-cleanup-job',
  '0 16 * * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/cleanup-old-slots',
    headers := jsonb_build_object(
      'Authorization', 'Bearer UNailedit_cleanup_k8P3mL7qR2vT9xN_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## 📊 Monthly Report (1st Day of Month)

```sql
select cron.schedule(
  'monthly-report-job',
  '10 0 1 * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/generate-monthly-report',
    headers := jsonb_build_object(
      'Authorization', 'Bearer unailedit_monthly_report_secret_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

# 🔍 Monitoring Cron Jobs

### View Jobs

```sql
select * from cron.job;
```

### View Logs

```sql
select * from cron.job_run_details
order by start_time desc;
```

---

# 🔒 Environment Variables

```env
CRON_SECRET_REMINDERS_NOTIF=UNailedit_reminder_secret_2026
CRON_SECRET_BOOKING_EXPIRY=UNailedit_booking_x9K2pL7sQ4mN8vR1_2026
CRON_SECRET_BLOCK=UNailedit_block_x7P9mL2kQ5zR8vT1_2026
CRON_SECRET_CLEANUP=UNailedit_cleanup_k8P3mL7qR2vT9xN_2026
CRON_SECRET_MONTHLY_REPORT=unailedit_monthly_report_secret_2026
ENABLE_LOCAL_CRON=false
```

---

# ⚠️ Important Notes

## ❌ DO NOT USE LOCALHOST

```
http://localhost:5000
```

---

## ✅ USE DEPLOYED BACKEND

```
https://unailedit-api.onrender.com
```

---

## 🔁 Disable Local Cron

```env
ENABLE_LOCAL_CRON=false
```

---

## 🔐 Secrets Must Match EXACTLY

Example:

```
CRON_SECRET_BOOKING_EXPIRY=UNailedit_booking_x9K2pL7sQ4mN8vR1_2026
```

Must match:

```sql
'Authorization', 'Bearer UNailedit_booking_x9K2pL7sQ4mN8vR1_2026'
```

---

# ✅ FINAL RESULT

After setup:

* ⏱ Booking expiry → every minute
* 🔔 Reminders → every 5 minutes
* ⛔ Slot blocking → every 5 minutes
* 🧹 Cleanup → daily
* 📊 Monthly report → monthly

---

# 🔥 SYSTEM STATUS

Your system is now:

* ⚙️ Fully automated
* 🔒 Secure
* ⚡ Optimized
* 🛡 RLS-safe
* 🚀 Production-ready

---

## 💡 Optional Upgrade

You can add:

* 📧 Email alerts on cron failure
* 📊 Logging dashboard
* 🔔 Slack / Discord notifications

---

Enjoy your automated system 🚀
