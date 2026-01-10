import * as paymentService from "../../services/Payment_Feature/paymentService.js";

export const uploadPaymentProof = async (req, res) => {
  try {
    const booking = await paymentService.uploadPaymentProof({
      booking_id: req.body.booking_id,
      file: req.file,
    });

    res.status(200).json({
      message: "PAYMENT PROOF UPLOADED",
      booking,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ADMIN
export const viewPaymentProof = async (req, res) => {
  try {
    console.log("Path from Postman:", req.query.filePath); // Idagdag ito para ma-check sa terminal

    const signedUrl = await paymentService.getPaymentProofUrl(
      req.query.filePath
    );

    res.json({ signedUrl });
  } catch (error) {
    console.error("Supabase Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
