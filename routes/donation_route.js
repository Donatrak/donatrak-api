import { Router } from "express";
import { createDonation, getUserDonations } from "../controllers/donation_controller.js";
import { checkAuth } from "../middlewares/auth.js";

export const donationRouter = Router();

// Define donation routes
donationRouter.post('users/donations', checkAuth, createDonation);

donationRouter.get('/users/donations', checkAuth, getUserDonations);