# 🚀 Cron Job Setup (Supabase) — UNAIledIt Backend

This guide explains how to enable all automated background jobs using **Supabase Cron** (`pg_cron` + `pg_net`) after deployment.

---

## ⚠️ Important Before Running

Make sure:

- ✅ Backend is already **deployed** (e.g. Render)
- ✅ All cron job endpoints are **tested via Postman**
- ✅ Replace all URLs with your **actual deployed API URL**
- ✅ All cron secrets match your backend `.env`
- ✅ Local cron is **disabled in production** (important)

---

## ⚙️ Backend Implementation Note

All cron endpoints use **Supabase RPC / Postgres functions** instead of direct table updates.

### Benefits:

- ✅ No Row-Level Security (RLS) issues
- ✅ Faster execution
- ✅ Safer database operations
- ✅ Cleaner backend code

### RPC Functions Used

| Endpoint                   | Function                    |
| -------------------------- | --------------------------- |
| `/api/jobs/booking-expiry` | `expire_pending_bookings()` |
| `/api/jobs/slot-block`     | `block_past_today_slots()`  |
| `/api/jobs/slot-cleanup`   | `cleanup_old_slots()`       |

---

## 🔐 Required Environment Variables

Add these to your backend `.env`:

```
CRON_SECRET_BOOKING_EXPIRY=your_booking_expiry_secret
CRON_SECRET_BLOCK=your_slot_block_secret
CRON_SECRET_CLEANUP=your_slot_cleanup_secret
CRON_SECRET_REMINDER=your_booking_reminder_secret
ENABLE_LOCAL_CRON=false
```

---

## 🔔 1. Booking Reminder Cron (Every 5 Minutes)

Sends reminders to customers with upcoming bookings.

```sql
select cron.schedule(
  'booking-reminder-job',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/send-booking-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET_REMINDER',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## ⏳ 2. Booking Expiry Cron (Every Minute)

Automatically expires:

- bookings (`pending_payment → expired`)
- payment_intents (`pending → expired`)

```sql
select cron.schedule(
  'booking-expiry-job',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/booking-expiry',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET_BOOKING_EXPIRY',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## ⛔ 3. Slot Blocking Cron (Every 5 Minutes)

Marks past time slots (today) as unavailable.

```sql
select cron.schedule(
  'slot-block-job',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/slot-block',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET_BLOCK',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## 🧹 4. Slot Cleanup Cron (Daily - Midnight PH Time)

Deletes past slots without active bookings.

> Supabase uses UTC
> `0 16 * * *` = **12:00 AM Asia/Manila**

```sql
select cron.schedule(
  'slot-cleanup-job',
  '0 16 * * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/slot-cleanup',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET_CLEANUP',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

## 📊 5. Monthly Report Cron (1st Day of Every Month)

Generates the previous month report and emails it to all admins.

```sql
select cron.schedule(
  'monthly-report-job',
  '10 0 1 * *',
  $$
  select net.http_post(
    url := 'https://your-api-url.com/api/jobs/generate-monthly-report',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET_MONTHLY_REPORT',
      'Content-Type', 'application/json'
    )
  );
  $$
);


---

# Verdict
## Yes:
**nasama mo na ang cron for monthly report**

## Pero ayusin mo itong 6 things:
- code block formatting
- hardcoded secret
- missing env variable
- route name consistency
- manual testing list
- final status table
- RPC statement wording

Kapag gusto mo, aayusin ko na mismo yung **buong README mo into final polished version**.
## 🧪 Manual Testing (IMPORTANT)

Test endpoints before enabling cron.

### Example:

```

POST https://your-api-url.com/api/jobs/booking-expiry
Authorization: Bearer YOUR_SECRET

````

Test all:

- `/booking-expiry`
- `/slot-block`
- `/slot-cleanup`
- `/send-booking-reminders`

---

## ⚠️ Disable Local Cron in Production

To prevent duplicate jobs:

```js
if (process.env.ENABLE_LOCAL_CRON === "true") {
  startLocalCron();
}
````

Set in production:

```
ENABLE_LOCAL_CRON=false
```

---

## 🔧 Deployment Checklist

- ✅ Backend deployed
- ✅ RPC functions exist in Supabase
- ✅ Endpoints tested (Postman)
- ✅ Secrets match `.env`
- ✅ Frontend URLs updated
- ✅ Email system configured
- ✅ Local cron disabled

---

## 🔍 Monitoring Cron Jobs

### View jobs:

```sql
select * from cron.job;
```

### View logs:

```sql
select * from cron.job_run_details
order by start_time desc;
```

---

## 🧠 Notes

- Supabase Cron runs in **UTC**
- Jobs trigger backend endpoints via HTTP
- Backend handles logic securely
- RPC handles database operations
- Avoid running both local + Supabase cron at the same time

---

## ✅ Final Status

| Job              | Schedule     | Status |
| ---------------- | ------------ | ------ |
| Booking Reminder | Every 5 min  | ✅     |
| Booking Expiry   | Every minute | ✅     |
| Slot Block       | Every 5 min  | ✅     |
| Slot Cleanup     | Daily        | ✅     |

---

## 🎯 Result

You now have a **fully automated, production-ready cron system** powered by:

- Supabase (scheduler)
- Backend API (execution)
- RPC functions (safe DB operations)

---

🔥 Your system is now:

- scalable
- secure
- optimized
- production-ready
