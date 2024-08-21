import { initiatePaystackPayment, verifyPaystackPayment,processMomoPayment  } from '../services/payment_service.js';
import { donationModel } from '../models/donation_model.js';

// Handle Paystack Payment Initialization
export const initializePayment = async (req, res, next) => {
    try {
        const { amount } = req.body;

        const paymentData = await initiatePaystackPayment(req.user.email, amount);

        if (paymentData.status) {
            return res.status(200).json({
                status: true,
                authorization_url: paymentData.data.authorization_url,
                reference: paymentData.data.reference
            });
        } else {
            return res.status(500).json({ status: false, message: 'Payment initialization failed' });
        }
    } catch (error) {
        next(error);
    }
};

// Handle Paystack Payment Verification
export const verifyPayment = async (req, res, next) => {
    try {
        const { reference } = req.params;

        const verificationResponse = await verifyPaystackPayment(reference);

        if (verificationResponse.status) {
            const donation = await donationModel.findOne({ reference });

            if (donation) {
                donation.status = 'completed';
                await donation.save();
                return res.status(200).json({ status: true, message: 'Payment verified and donation completed' });
            } else {
                return res.status(404).json({ status: false, message: 'Donation not found' });
            }
        } else {
            return res.status(500).json({ status: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        next(error);
    }
};




// momoPayment_controller.js

export const momoPaymentHandler = async (req, res, next) => {
    try {
        const { email, amount, phone, provider, reference } = req.body;

        // Check if it's a verification or initiation request
        const paymentData = await processMomoPayment(email, amount, phone, provider, reference);

        // Handle payment initiation response
        if (!reference) {
            if (paymentData.status === 'success') {
                return res.status(200).json({
                    status: true,
                    authorization_url: paymentData.data.authorization_url,
                    reference: paymentData.data.reference
                });
            } else {
                return res.status(500).json({ status: false, message: 'Payment initiation failed' });
            }
        }

        // Handle payment verification response
        const status = paymentData.data.status;
        if (status === 'success') {
            await requestModel.updateMany({ _id: { $in: paymentData.data.requests } }, { status: 'done' });
        } else if (status === 'failed') {
            await requestModel.updateMany({ _id: { $in: paymentData.data.requests } }, { status: 'failed' });
        } else {
            await requestModel.updateMany({ _id: { $in: paymentData.data.requests } }, { status: 'pending' });
        }

        res.status(200).json({
            status: status === 'success',
            message: status === 'success' ? 'Payment successful' : 'Payment processing, please try again later',
            transaction: {
                reference: paymentData.data.reference,
                amount: paymentData.data.amount,
                currency: paymentData.data.currency,
                status: status
            }
        });
    } catch (error) {
        next(error);
    }
};