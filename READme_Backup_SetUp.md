UNailedIt — Supabase Automated Backup Setup Guide

Goal
Mag-setup ng automated daily backup ng Supabase PostgreSQL database papunta sa local machine gamit ang:
- pg_dump
- Git Bash
- Windows Task Scheduler

RESULT:
Araw-araw automatic magge-generate ng .sql backup file.

🧱 PART 1 — Install PostgreSQL Tools (pg_dump)
1️⃣ Install PostgreSQL
Download:
https://www.postgresql.org/download/windows/
Install any recent version (17+ recommended).


2️⃣ Verify pg_dump
Open CMD or Git Bash:
pg_dump --version

Dapat may lumabas na version number:
pg_dump (PostgreSQL) 17.x

PART 2 — Get Supabase Database Connection Details
1️⃣ Open Supabase Dashboard

Go to:
Project → Settings → Database → Connection String
Use Session Pooler.
Example format:
postgresql://postgres.PROJECT_ID:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

Extract:
- Host
- Username
- Database name
- Password
- Port

📝 PART 3 — Create Manual Backup Script
1️⃣ Create Backup Folder

Example:
C:\Sean Sta Ana\SEPROJECT101\UNailedIt_backup

2️⃣ Create backup.sh
Inside UNailedIt_backup create:
- backup.sh
Paste this:
- #!/bin/bash

# Supabase DB password
export PGPASSWORD="YOUR_DATABASE_PASSWORD"
# Date format for filename
DATE=$(date +%Y-%m-%d)
# Run pg_dump
pg_dump \
  -h aws-1-ap-south-1.pooler.supabase.com \
  -U postgres.PROJECT_ID \
  -d postgres \
  -p 5432 \
  -F p \
  -f "/c/Sean Sta Ana/SEPROJECT101/UNailedIt_backup/unailedit_$DATE.sql"

Replace:
YOUR_DATABASE_PASSWORD
PROJECT_ID
Host if different

3️⃣ Test Script Manually
Open Git Bash:
cd /c/Sean\ Sta\ Ana/SEPROJECT101/UNailedIt_backup
./backup.sh

If successful:
unailedit_YYYY-MM-DD.sql
will appear in the folder.

⏰ PART 4 — Automate Using Windows Task Scheduler
1️⃣ Open Task Scheduler

Press: Win + R → taskschd.msc

Click:
Create Basic Task
2️⃣ Task Settings
Name:
UNailedIt Daily Database Backup
Trigger:
Daily

Choose:
2:00 AM

3️⃣ Action
Choose:
Start a Program

4️⃣ Configure Program
Program/script:

Click Browse and select:
C:\Program Files\Git\bin\bash.exe
Add arguments:
-c "cd '/c/Sean Sta Ana/SEPROJECT101/UNailedIt_backup' && ./backup.sh"
Start in:
C:\Sean Sta Ana\SEPROJECT101\UNailedIt_backup

5️⃣ Finish
After creation:
Right click task → Properties
Under General tab, ensure:

✔ Run whether user is logged on or not
✔ Run with highest privileges

Click OK.

🧪 PART 5 — Test Automation

Right click task → Run
Check: UNailedIt_backup

The file timestamp should update.
If it shows:
Last Run Result: 0x0

That means success.

📂 How Backup Naming Works

Script uses:

DATE=$(date +%Y-%m-%d)

So files look like:

unailedit_2026-02-28.sql

Same day → overwrite
New day → new file created

🔄 What Happens Every Day

At 2:00 AM:

Windows Task Scheduler triggers

Runs bash.exe

Executes backup.sh

Runs pg_dump

Connects to Supabase cloud database

Saves SQL dump locally

🛡 What This Protects You From

✔ Accidental table deletion
✔ Corrupted data
✔ Bad migrations
✔ Supabase database wipe

As long as local backups exist.

⚠ Important Limitation

This backup:

Saves only the database

Does NOT include Supabase Storage buckets

Is stored only on your local machine

For production:

Upload backups to cloud storage

Or external drive

🧠 Optional Improvements

You can extend this setup to:

Zip backups automatically

Delete backups older than 30 days

Upload to Google Drive

Store encrypted backups

Move to server-based cron job

🏁 Final Result

You successfully built:

A custom automated PostgreSQL backup pipeline
Supabase → pg_dump → Local machine → Daily automation

Backend-level production skill unlocked 🚀