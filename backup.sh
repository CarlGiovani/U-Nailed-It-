#!/bin/bash

export PGPASSWORD="UNailedItProj2025"

DATE=$(date +%Y-%m-%d)

pg_dump \
-h aws-1-ap-south-1.pooler.supabase.com \
-U postgres.ccxthgciaubemdihkrit \
-d postgres \
-p 5432 \
-F p \
-f "/c/Sean Sta Ana/SEPROJECT101/UNailedIt_backup/unailedit_$DATE.sql"