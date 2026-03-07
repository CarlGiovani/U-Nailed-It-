Customer Action
      │
      │  (Booking Created / Review Submitted)
      ▼
Database Insert
(bookings / reviews tables)
      │
      ▼
PostgreSQL Trigger
(booking_notification_trigger / review_notification_trigger)
      │
      ▼
Trigger Function Executes
(notify_new_booking / notify_new_review)
      │
      ▼
Insert Notification Record
notifications table
      │
      ▼
Backend API
GET /api/notifications
GET /api/notifications/unread-count
      │
      ▼
Admin Dashboard
(Bell Notification UI)
      │
      ▼
Admin Clicks Notification
      │
      ▼
Redirect to Relevant Page
/admin/bookings
/admin/reviews