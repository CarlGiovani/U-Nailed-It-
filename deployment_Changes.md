# 🚀 Cron Job Setup (Supabase) — UNAIledIt Backend

This guide explains how to enable all automated background jobs using **Supabase Cron (pg_cron + pg_net)** after deployment.

---

## ⚠️ IMPORTANT BEFORE RUNNING

Make sure:

* ✅ Backend is already **deployed (Render)**
* ✅ Replace all URLs with your **actual deployed API URL**
* ✅ Secrets are correct and match your `.env`
* ✅ Endpoints are already tested via Postman

---

## 🔔 1. Booking Reminder Cron (Every 5 Minutes)

Sends reminders to customers with upcoming bookings.

```sql
select cron.schedule(
  'booking-reminder-job',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://unailedit-api.onrender.com/api/jobs/send-booking-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer unailedit_reminder_secret_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## ⏳ 2. Booking Expiry Cron (Every Minute)

Automatically expires:

* `bookings` (pending_payment)
* `payment_intents` (pending)

```sql
select cron.schedule(
  'booking-expiry-job',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://unailedit-api.onrender.com/api/jobs/booking-expiry',
    headers := jsonb_build_object(
      'Authorization', 'Bearer unailedit_booking_x9K2pL7sQ4mN8vR1_2026',
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
    url := 'https://unailedit-api.onrender.com/api/jobs/slot-block',
    headers := jsonb_build_object(
      'Authorization', 'Bearer unailedit_block_x7P9mL2kQ5zR8vT1_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## 🧹 4. Slot Cleanup Cron (Daily - Midnight PH Time)

Deletes past slots without active bookings.

> ⚠️ Uses UTC timezone → `0 16 * * *` = **12:00 AM Asia/Manila**

```sql
select cron.schedule(
  'slot-cleanup-job',
  '0 16 * * *',
  $$
  select net.http_post(
    url := 'https://unailedit-api.onrender.com/api/jobs/slot-cleanup',
    headers := jsonb_build_object(
      'Authorization', 'Bearer unailedit_cleanup_k8P3mL7qR2vT9xN_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## 🔧 Additional Deployment Checklist

After deployment, make sure to:

* 🔁 Replace all **frontend URLs** (Admin + Website) in `.env`
* 📧 Update **email transporter** to use a business Gmail account
* 🔐 Ensure all cron secrets are properly set in `.env`

---

## 🔍 Monitoring Cron Jobs

Check registered jobs:

```sql
select * from cron.job;
```

Check execution logs:

```sql
select * from cron.job_run_details
order by start_time desc;
```

---

## 🧠 Notes

* Supabase Cron runs in **UTC timezone**
* Avoid duplicate cron execution (disable local cron in production)
* Each job uses a **separate secret for better security**
* Jobs are triggered via **HTTP endpoints (backend-controlled)**

---

## ✅ Final Status

| Job              | Schedule     | Status |
| ---------------- | ------------ | ------ |
| Booking Reminder | Every 5 min  | ✅      |
| Booking Expiry   | Every minute | ✅      |
| Slot Block       | Every 5 min  | ✅      |
| Slot Cleanup     | Daily        | ✅      |

---

## 🎯 Result

You now have a **fully automated, production-ready cron system** powered by:

* Supabase (scheduler)
* Backend API (logic execution)

---
