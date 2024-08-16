import nodemailer from "nodemailer";
import { User} from "../models/user_model.js";
import bcrypt from "bcryptjs";

// Helper function to generate a 4-digit OTP
const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Request Password Reset
export const requestPasswordReset = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json('User not found');
        }

        // Generate OTP and expiration time
        const otp = generateOtp();
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            host: 'mail.youth-arise.org',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please use the following OTP to complete the process:\n\n` +
                `${otp}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error('There was an error', err);
                return res.status(500).json('Failed to send OTP');
            } else {
                res.status(200).json('Password recovery email sent');
            }
        });
    }
    catch (error) {
        next(error);
    }
};

// Confirm OTP
export const confirmOtp = async (req, res, next) => {
    const { email, otp } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user || !user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json('OTP is invalid or has expired');
        }
        if (user.resetPasswordToken !== otp) {
            return res.status(400).json('OTP does not match');
        }
        res.status(200).json('OTP confirmed');
    } catch (error) {
        next(error);
    }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user || !user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json('OTP is invalid or has expired');
        }
        if (user.resetPasswordToken !== otp) {
            return res.status(400).json('OTP does not match');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.confirmPassword = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json('Password has been reset');
    } catch (error) {
        next(error);
    }
}
