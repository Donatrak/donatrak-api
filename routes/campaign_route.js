import { Router } from "express";
import { createCampaign, updateCampaign, deleteCampaign, getAllCampaigns, updateCampaignStatus, getSingleCampaign } from "../controllers/campaign_controller.js";
import { checkAuth } from "../middlewares/auth.js";
import { remoteUpload } from "../middlewares/upload.js";

export const campaignRouter = Router();

// Define campaign routes
campaignRouter.post('/users/campaigns', checkAuth,remoteUpload.single('image'), createCampaign);
campaignRouter.patch('/users/campaigns/:id/status', checkAuth, updateCampaignStatus);
campaignRouter.put('/users/campaigns/:id', checkAuth,remoteUpload.single('image'), updateCampaign);
campaignRouter.delete('/users/campaigns/:id', checkAuth, deleteCampaign);
campaignRouter.get('/users/campaigns', getAllCampaigns);
campaignRouter.get('/users/campaigns/:id', getSingleCampaign);
