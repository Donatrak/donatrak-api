import axios from 'axios';
import { donationModel } from '../models/donation_model.js';
import { campaignModel } from '../models/campaign_model.js';
import {createDonationValidator, updateDonationValidator } from '../validators/donation_validator.js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Helper function to check payment status
const checkPaymentStatus = async (reference, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
    });
    const status = response.data.data.status;
    if (status === 'success') return 'success';
    if (status === 'failed') return 'failed';
    if (status === 'pending' && attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }
  }
  return 'pending';
};

// Create a donation
export const createDonation = async (req, res, next) => {
  try {
    const { amount, campaignId, paymentMethod, message } = req.body;
    const campaign = await campaignModel.findById(campaignId);

    if (!campaign || campaign.status !== 'active') {
      return res.status(400).json({ status: false, message: 'Campaign is not available for donations.' });
    }

    const donation = await donationModel.create({
      donor: req.user.id,
      campaign: campaignId,
      amount,
      message,
      status: 'pending',
      paymentMethod
    });

    let paymentResponse;

    if (paymentMethod === 'card') {
      // Initiate card payment
      paymentResponse = await axios.post('https://api.paystack.co/charge', {
        email: req.user.email,
        amount: amount * 100, 
        currency: 'GHS',
        card: req.body.cardDetails // Ensure cardDetails are properly handled
      }, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      donation.transactionId = paymentResponse.data.data.id;
      donation.reference = paymentResponse.data.data.reference;

      if (paymentResponse.data.data.status === 'success') {
        donation.status = 'completed';
      } else {
        donation.status = 'failed';
      }

      await donation.save();

      return res.status(201).json({
        status: true,
        data: donation,
        message: paymentResponse.data.data.authorization_url || 'Payment initiated, complete the payment using the provided link'
      });
    } else if (paymentMethod === 'momo') {
      // Handle momo payment
      const { error, value } = createDonationValidator.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { phone, provider } = value;
      const params = {
        email: req.user.email,
        amount: amount * 100, 
        currency: 'GHS',
        mobile_money: { phone, provider }
      };

      const response = await axios.post('https://api.paystack.co/charge', params, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const transactionData = response.data.data;

      donation.transactionId = transactionData.id;
      donation.reference = transactionData.reference;
      donation.status = 'pending';
      await donation.save();

      let paymentStatus = transactionData.status;
      if (paymentStatus === 'pending') {
        paymentStatus = await checkPaymentStatus(transactionData.reference);
      }

      if (paymentStatus === 'success') {
        donation.status = 'completed';
      } else if (paymentStatus === 'failed') {
        donation.status = 'failed';
      } else {
        donation.status = 'pending';
      }

      await donation.save();

      return res.status(200).json({
        status: paymentStatus,
        message: paymentStatus === 'success' ? 'Payment successful' : 'Payment processing, please try again later',
        transaction: {
          id: transactionData.id,
          reference: transactionData.reference,
          amount: transactionData.amount,
          currency: transactionData.currency,
          status: paymentStatus,
          customer: { email: transactionData.customer.email }
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get single donation
export const getDonationById = async (req, res, next) => {
  try {
    const donation = await donationModel.findById(req.params.id).populate('donor').populate('campaign');
    if (!donation) {
      return res.status(404).json({ status: false, message: 'Donation not found' });
    }
    return res.status(200).json({ status: true, data: donation });
  } catch (error) {
    next(error);
  }
};

// Get all donations for a campaign
export const getDonationsByCampaign = async (req, res, next) => {
  try {
    const donations = await donationModel.find({ campaign: req.params.campaignId }).populate('donor');
    return res.status(200).json({ status: true, data: donations });
  } catch (error) {
    next(error);
  }
};
