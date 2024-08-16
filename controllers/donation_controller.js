import { initializePayment } from '../controllers/payment_controller.js';

// Create a donation
export const createDonation = async (req, res, next) => {
    try {
        const { amount, campaignId, message } = req.body;
        const campaign = await CampaignModel.findById(campaignId);

        if (!campaign || campaign.status !== 'active') {
            return res.status(400).json({ status: false, message: 'Campaign is not available for donations.' });
        }

        const donation = await DonationModel.create({
            donor: req.user.id,
            campaign: campaignId,
            amount,
            message,
            status: 'pending'
        });

        // Initiate Paystack payment
        const paymentResponse = await initializePayment(req, res, next);

        if (paymentResponse.status) {
            return res.status(201).json({ status: true, data: donation, message: 'Donation initiated, complete the payment using the provided link' });
        } else {
            donation.status = 'failed';
            await donation.save();
            return res.status(500).json({ status: false, message: 'Donation payment failed' });
        }
    } catch (error) {
        next(error);
    }
};

export const getUserDonations = async (req, res, next) => {
    try {
        const donations = await getDonationsByUserService(req.user.id);
        return res.status(200).json({ status: true, data: donations });
    } catch (error) {
        return next(error);
    }
};
