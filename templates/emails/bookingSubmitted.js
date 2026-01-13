export const bookingSubmittedTemplate = ({ name, service }) => `
  <h2>Booking Submitted</h2>
  <p>Hi ${name},</p>
  <p>Your booking for <b>${service}</b> has been submitted.</p>
  <p>Status: <b>Pending Approval</b></p>
`;
