import bcrypt from 'bcryptjs';
import { UserProfileModel } from "../models/userProfile_model.js";
import { passwordUpdateValidator, userProfileValidator } from "../validators/userProfile_validator.js";
import { UserModel } from "../models/user_model.js";

// Create a new user profile
export const addUserProfile = async (req, res) => {
    try {
       // console.log('Request Body:', req.body);
       // console.log('Request Files:', req.file);

        const {error, value} = userProfileValidator.validate({
            ...req.body,
            profilePicture: req.file?.filename
        });
    
        if(error) {
            return res.status(400).json({
               message: error.details[0].message
            })
        }
    
        const userId = req.session?.user?.id || req?.user?.id;
    
        const user = await UserModel.findById(userId);
        if(!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            })
        }

        // Check if a profile already exists for this user
        let profile = await UserProfileModel.findOne({ user: userId });
        
        if (profile) {
           // console.log('Existing profile found:', profile);
            // Update the existing profile
            profile = await UserProfileModel.findByIdAndUpdate(profile._id, {
                ...value,
                user: userId,
            },{ new: true });
        } else {
    
        // Create a profile
        const profile = await UserProfileModel.create({
            ...value,
            user: userId
        }, { new: true });
        await profile.save();
       // console.log('New profile created:', profile);

    }

        // Construct the response object without the unnecessary fields
        const response = {
            profilePicture: profile.profilePicture,
            fullname: profile.fullname,
            country: profile.country,
            phoneNumber: profile.phoneNumber,
            professionalActivity: profile.professionalActivity
        }
    
        return res.status(201).json({
            status: true,
            message: 'Profile created/updated successfully',
            profile: response
        }) 
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
    
}

export const updateUserProfile = async (req, res) => {
    try {
        
        const {error, value} = userProfileValidator.validate({
            ...req.body,
            profilePicture: req.files?.profilePicture ? req.files.profilePicture[0].filename : undefined
        });
    
        if(error) {
            return res.status(400).send(error.details[0].message)
        }
    
        const userId = req.session?.user?.id || req?.user.id;
    
        const user = await UserModel.findById(userId);
        if(!user) {
            return res.status(400).json({
                status: false,
                message: 'User not found'
            })
        }
    
        const updatedUserProfile = await UserProfileModel.findByIdAndUpdate(req.params.id, value, {new: true});
        if(!updatedUserProfile) {
            return res.status(400).json({
                status: false,
                message: 'Profile not found'
            })
        }

        // Construct the response object without the unnecessary fields
        const response = {
            profilePicture: updatedUserProfile.profilePicture,
            userName: updatedUserProfile.userName,
            email: updatedUserProfile.email,
            phoneNumber: updatedUserProfile.phoneNumber,
            professionalActivity: updatedUserProfile.professionalActivity
        }

        return res.status(201).json({
            message: `Profile with ID ${req.params.id} has been updated successfully`,
            profile: response
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

export const updatePassword = async (req, res) => {
    try {
        const {error, value} = passwordUpdateValidator.validate(req.body)
        if (error) {
            return res.status(400).json({
                status: false,
                message: error.message
            })
        }

        // Destructure validated values from the request body
        const { email, currentPassword, newPassword } = value;
    
        const user = await UserModel.findOne({email});
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            })
        }
    
        // Check if the current password matches the hashed password in the database
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                status: false,
                message: 'Current password is incorrect' 
            });
        }
    
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        // Update user password
        user.password = hashedPassword;
        await user.save();
    
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
   
}

