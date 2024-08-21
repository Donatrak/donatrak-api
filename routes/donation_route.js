import { Router } from "express";
import { createDonation, getDonationById , getDonationsByCampaign} from "../controllers/donation_controller.js";
import { checkAuth } from "../middlewares/auth.js";

export const donationRouter = Router();

// Define donation routes
donationRouter.post('/users/donations', checkAuth, createDonation);

donationRouter.get('/users/donations/:id', checkAuth, getDonationById);

donationRouter.get('/users/donations', checkAuth, getDonationsByCampaign);



