import * as paymentModel from "../../models/Payment_Feature/paymentModel.js";


export const uploadPaymentProof =  async ({booking_id , file}) => {
  if(!booking_id||!file){
    throw new Error ("BOOKING_ID AND FILE IS REQUREID!!");
  }

  const filePath = `booking_${booking_id}/${Date.now()}_${file.originalname}`;

  await paymentModel.uploadFile(filePath , file);
  const booking = await paymentModel.saveProofPath(booking_id, filePath);
  return booking;
};



export const getPaymentProofUrl =  async (filePath) =>{
  if(!filePath) throw new Error ("FILEPATH REQUIRED!!!");
  return await paymentModel.createSignedUrl(filePath);
};