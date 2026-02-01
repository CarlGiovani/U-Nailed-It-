import * as paymentService from "../../services/Payment_Feature/paymentService.js";

// PUBLIC: upload payment proof
export const uploadPaymentProof = async (req, res) => {
  try {
    const { email, service_id, service_variant_id, booking_date, booking_time, booking_id } = req.body;
    const file = req.file;

    const result = await paymentService.uploadPaymentProof({
      email,
      service_id,
      service_variant_id,
      booking_date,
      booking_time,
      booking_id,
      file,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Upload Payment Error:", err.message);
    res.status(400).json({ error: err.message });
  }
};




// ADMIN: view payment proof
export const viewPaymentProof = async (req, res) => {
  try {
    const filePath = req.query.filePath;
    const signedUrl = await paymentService.getPaymentProofUrl(filePath);
    res.json({ signedUrl });
  } catch (err) {
    console.error("View Payment Proof Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
