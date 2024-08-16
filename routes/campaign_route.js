import { Router } from "express";
import { createCampaign, updateCampaign, deleteCampaign, getAllCampaigns } from "../controllers/campaign_controller.js";
import { checkAuth } from "../middlewares/auth.js";

export const campaignRouter = Router();

// Define campaign routes
campaignRouter.post('/campaigns', checkAuth, createCampaign);
campaignRouter.put('/campaigns/:id', checkAuth, updateCampaign);
campaignRouter.delete('/campaigns/:id', checkAuth, deleteCampaign);
campaignRouter.get('/campaigns', getAllCampaigns);