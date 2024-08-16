import axios from 'axios';

// Paystack API URLs
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; 

// Initiate Paystack Payment
export const initiatePaystackPayment = async (email, amount) => {
    try {
        const response = await axios.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, 
            {
                email,
                amount: amount * 100  // Paystack expects amount in kobo (smallest currency unit)
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        return response.data;
    } catch (error) {
        throw new Error('Error initiating Paystack payment');
    }
};

// Verify Paystack Payment
export const verifyPaystackPayment = async (reference) => {
    try {
        const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        return response.data;
    } catch (error) {
        throw new Error('Error verifying Paystack payment');
    }
};



// MoMo Payment Function
export const processMomoPayment = async (email, amount, phone, provider, reference = null) => {
    try {
        if (reference) {
            // If a reference is provided, verify the payment
            const verificationResponse = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            });
            return verificationResponse.data;
        } else {
            // If no reference is provided, initiate the payment
            const initiationResponse = await axios.post(`${PAYSTACK_BASE_URL}/transaction/charge`, {
                email,
                amount: amount * 100, // Amount in kobo
                mobile_money: {
                    phone,
                    provider
                }
            }, {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            });
            return initiationResponse.data;
        }
    } catch (error) {
        throw new Error(reference ? 'Error verifying MoMo payment' : 'Error initiating MoMo payment');
    }
};
