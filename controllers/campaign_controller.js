import { campaignModel } from '../models/campaign_model.js';


export const createCampaign = async (req, res, next) => {
    try {
        // Ensure the user is a campaign manager
        if (req.user.role !== 'campaignManager') {
            return res.status(403).json({ status: false, message: 'Unauthorized to create a campaign.' });
        }

        const { title, description, goalAmount, startDate, endDate, status = 'inactive' } = req.body;

        // Check if there's a file and assign its filename
        let imageUrl = '';
        if (req.file) {  
            imageUrl = req.file.filename;  // Correct assignment from req.file.filename to imageUrl
        }

        // Create the campaign
        const campaign = await campaignModel.create({
            title, 
            description, 
            goalAmount, 
            startDate, 
            endDate, 
            status, 
            createdBy: req.user.id, 
            image: imageUrl  // Save the image filename in the database
        });

        // Return response including the image field
        return res.status(201).json({ 
            status: true, 
            data: {
                id: campaign._id,
                title: campaign.title,
                description: campaign.description,
                goalAmount: campaign.goalAmount,
                currentAmount: campaign.currentAmount,
                startDate: campaign.startDate,
                endDate: campaign.endDate,
                createdBy: campaign.createdBy,
                status: campaign.status,
                image: campaign.image  // Ensure the image field is returned
            }, 
            message: 'Campaign created successfully' 
        });
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

        const updateData = req.body;
        if (req.file) {  // Check if there's a file uploaded
            updateData.image = req.file.path;  // Save the file path or URL
        }

        const updatedCampaign = await campaignModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
        return res.status(200).json({ status: true, data: updatedCampaign, message: 'Campaign updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Update campaign status
export const updateCampaignStatus = async (req, res, next) => {
    try {
        const { status } = req.body; // Expected to be 'active', 'completed', or 'inactive'
        const campaign = await campaignModel.findById(req.params.id);

        if (!campaign || String(campaign.createdBy) !== String(req.user.id)) {
            return res.status(403).json({ status: false, message: 'Unauthorized to update this campaign.' });
        }

        if (!['active', 'completed', 'inactive'].includes(status)) {
            return res.status(400).json({ status: false, message: 'Invalid status value.' });
        }

        campaign.status = status;
        await campaign.save();

        return res.status(200).json({ status: true, data: campaign, message: 'Campaign status updated successfully' });
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

        const campaigns = await campaignModel.find(filter)
            .populate('createdBy', 'firstName lastName')
            .select('-createdAt -updatedAt');  // Exclude fields

        return res.status(200).json({ status: true, data: campaigns });
    } catch (error) {
        next(error);
    }
};


// Get a single campaign by ID
export const getSingleCampaign = async (req, res, next) => {
    try {
        // Find the campaign by ID
        const campaign = await campaignModel.findById(req.params.id)
            .populate('createdBy', 'firstName lastName'); // Optionally populate the creator's details

        if (!campaign) {
            return res.status(404).json({ status: false, message: 'Campaign not found' });
        }

        return res.status(200).json({ 
            status: true, 
            data: {
                id: campaign._id,
                title: campaign.title,
                description: campaign.description,
                goalAmount: campaign.goalAmount,
                currentAmount: campaign.currentAmount,
                startDate: campaign.startDate,
                endDate: campaign.endDate,
                createdBy: campaign.createdBy,
                status: campaign.status,
                image: campaign.image // Include image URL if applicable
            },
            message: 'Campaign retrieved successfully' 
        });
    } catch (error) {
        next(error);
    }
};

