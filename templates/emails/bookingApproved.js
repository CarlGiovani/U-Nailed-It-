export const bookingApprovedTemplate = ({ name, service, cancelLink }) => 
  `
  <h2>Booking Approved!!</h2>
  <p>Hi ${name},</p>
  <p>Your booking for <b>${service}</b> is approved.</p>

  <p>
    You may cancel within 24 hours:
    <br/>
    <a href="${cancelLink}">Cancel Booking</a>
  </p>
`;
