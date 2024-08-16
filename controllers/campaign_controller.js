import { campaignModel } from '../models/campaign_model.js';


// Create a campaign
export const createCampaign = async (req, res, next) => {
    try {
        if (req.user.role !== 'campaignManager') {
            return res.status(403).json({ status: false, message: 'Unauthorized to create a campaign.' });
        }

        const { title, description, goalAmount, startDate, endDate } = req.body;
        const campaign = await campaignModel.create({
            title, description, goalAmount, startDate, endDate, createdBy: req.user.id
        });

        return res.status(201).json({ status: true, data: campaign, message: 'Campaign created successfully' });
    } catch (error) {
        next(error);
    }
};

// Update a campaign
export const updateCampaign = async (req, res, next) => {
    try {
        const campaign = await campaignModel.findById(req.params.id);

        if (!campaign || String(campaign.createdBy) !== String(req.user.id)) {
            return res.status(403).json({ status: false, message: 'Unauthorized to update this campaign.' });
        }

        const updatedCampaign = await campaignModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json({ status: true, data: updatedCampaign, message: 'Campaign updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Delete a campaign
export const deleteCampaign = async (req, res, next) => {
    try {
        const campaign = await campaignModel.findById(req.params.id);

        if (!campaign || String(campaign.createdBy) !== String(req.user.id)) {
            return res.status(403).json({ status: false, message: 'Unauthorized to delete this campaign.' });
        }

        await campaignModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({ status: true, message: 'Campaign deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Get all campaigns (search and filter)
export const getAllCampaigns = async (req, res, next) => {
    try {
        const { search, status } = req.query;
        const filter = {};

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }
        if (status) {
            filter.status = status;
        }

        const campaigns = await campaignModel.find(filter).populate('createdBy', 'firstName lastName');
        return res.status(200).json({ status: true, data: campaigns });
    } catch (error) {
        next(error);
    }
};
