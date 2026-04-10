# RUN THIS WHEN ALREADY DEPLOYED
# this para mag run yung cron setup sa supase for reminders notification sa customers//

select cron.schedule (
  'booking-reminder-job',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://unailedit-api.onrender.com/api/jobs/send-booking-reminders', // CHANGE THIS NG DEPLOYED URL
    headers := jsonb_build_object(
      'Authorization', 'Bearer unailedit_reminder_secret_2026',
      'Content-Type', 'application/json'
    )
  );
  $$
);

# Palitan ng deployed url yung frontend admin and website url na nasa env
# change the email transporter gmail with business gmail








