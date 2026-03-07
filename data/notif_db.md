🔔 Admin Notification System (Database-Level)
Overview

The system implements a database-driven notification architecture using PostgreSQL triggers in Supabase.
This design automatically generates admin notifications whenever important system events occur, such as:

New bookings

Customer reviews

Instead of creating notifications inside the Node.js backend logic, the system uses PostgreSQL triggers to ensure notifications are generated automatically and consistently, regardless of where the data insertion originates.

This approach provides:

Automatic event-based notifications

Clean backend architecture

Reduced application logic complexity

Scalability for future notification types

🧠 Architecture

The notification system follows a database event-driven architecture.

System Event (Booking / Review)
        ↓
Database INSERT
        ↓
PostgreSQL Trigger Fires
        ↓
Trigger Function Inserts Notification
        ↓
notifications table
        ↓
Backend API fetches notifications
        ↓
Admin Dashboard displays notification
📂 Notifications Table

The central component of the system is the notifications table.

CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  related_entity text,
  related_id bigint,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now()
);
Column Description
Column	Description
id	Unique identifier for each notification
type	Notification category (booking, review, system, etc.)
title	Short notification title displayed in the admin UI
message	Detailed message shown in the notification dropdown
link	Admin dashboard route where the notification redirects
related_entity	Associated system entity (bookings, reviews, etc.)
related_id	ID of the related record
is_read	Boolean status indicating if notification has been read
created_at	Timestamp of when the notification was created
⚙️ Booking Notification Trigger

When a new booking is created, the database automatically generates a notification using a PostgreSQL trigger.

Trigger Function
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    type,
    title,
    message,
    link,
    related_entity,
    related_id
  )
  VALUES (
    'booking',
    'New Booking',
    'A new booking has been created.',
    '/admin/bookings',
    'bookings',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
Trigger
CREATE TRIGGER booking_notification_trigger
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION notify_new_booking();
How It Works

When a new booking is inserted into the bookings table:

PostgreSQL detects the INSERT event.

The trigger booking_notification_trigger fires.

The function notify_new_booking() executes.

A new row is inserted into the notifications table.

⭐ Review Notification Trigger

The system also generates notifications when a customer submits a review.

Trigger Function
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    type,
    title,
    message,
    link,
    related_entity,
    related_id
  )
  VALUES (
    'review',
    'New Review',
    'A customer submitted a new review.',
    '/admin/reviews',
    'reviews',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
Trigger
CREATE TRIGGER review_notification_trigger
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION notify_new_review();
Workflow
Customer submits review
        ↓
INSERT INTO reviews
        ↓
review_notification_trigger fires
        ↓
notify_new_review() function executes
        ↓
INSERT INTO notifications
        ↓
Admin dashboard displays notification
🔌 Backend API Integration

The backend provides API endpoints that allow the admin dashboard to retrieve and manage notifications.

Endpoints
Get Notifications
GET /api/notifications

Returns the latest notifications for the admin panel.

Example response:

{
  "success": true,
  "data": [
    {
      "id": 12,
      "type": "booking",
      "title": "New Booking",
      "message": "A new booking has been created.",
      "link": "/admin/bookings",
      "is_read": false,
      "created_at": "2026-03-07"
    }
  ]
}
Get Unread Notification Count
GET /api/notifications/unread-count

Used to display the notification badge in the admin dashboard.

Mark Notification as Read
PATCH /api/notifications/:id/read

Marks a specific notification as read.

Mark All Notifications as Read
PATCH /api/notifications/read-all

Marks all unread notifications as read.

🖥 Admin Dashboard Integration

The admin panel fetches notifications periodically.

Example frontend polling logic:

setInterval(() => {
  fetchNotifications();
}, 10000);

This ensures that the admin dashboard automatically displays new notifications without requiring a page refresh.

🚀 Advantages of the Database Trigger Approach

The notification system uses PostgreSQL triggers instead of backend logic for notification creation.

Benefits include:

Automatic Event Handling

Notifications are created automatically whenever relevant database events occur.

Backend Decoupling

The notification system does not depend on backend service logic.

Consistency

Notifications are generated regardless of how data is inserted:

API calls

Admin actions

Future services

External integrations

Scalability

New notification types can be added easily using additional triggers.

📈 Future Improvements

The system is designed to support future features such as:

Real-Time Notifications

Using Supabase Realtime to push notifications instantly instead of polling.

Email Notifications

Notifications can be extended to send email alerts to admins via:

Nodemailer

Resend

SendGrid

Advanced Notification Messages

Future triggers may include dynamic data such as:

Maria booked Gel Extensions for March 10 at 2:00 PM
Additional Notification Types

Possible future triggers include:

Booking approvals

Booking cancellations

New announcements

Payment confirmations

✅ Current Notification Features

The system currently supports:

Booking notifications

Review notifications

Admin notification dropdown

Unread notification badge

Read/unread status management

Automatic database-level notification generation

🏁 Summary

The implemented notification system uses a database-trigger architecture that automatically generates admin alerts whenever key events occur in the system.

By centralizing notifications within the notifications table and leveraging PostgreSQL triggers, the system ensures:

reliable event tracking

simplified backend logic

easy scalability for future notification features