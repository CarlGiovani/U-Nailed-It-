export const bookingRejectedTemplate = ({ name, service, }) => 
  `
  <h2>Booking Rejected!!</h2>
  <p>Hi ${name},</p>
  <p>Your booking for <b>${service}</b> is approved.</p>

  <p>
    You may cancel within 24 hours:
    <br/>
  </p>
`;
