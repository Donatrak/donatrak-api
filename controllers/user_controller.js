import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUserValidator, loginValidator, registerValidator, updateUserValidator, } from '../validators/user_validator.js';
import { User} from '../models/user_model.js';
import { createClient } from 'redis';

// Create a function to register
export const register = async (req, res, next) => {
    try {   
        const {error, value} = registerValidator.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: false,
                message: error.message
            });
        }

        // Ensure user agrees to terms and conditions
        if (!value.termsAndConditions) {
            return res.status(400).json({
                status: false,
                message: 'You must accept the terms and conditions to register'
            });
        }

        // Check if the user exists using their email
        const email = value.email;
        const findIfUserExist = await User.findOne({ email });
        if (findIfUserExist) {
            return res.status(401).json({
                status: false,
                message: 'User is already registered'
            });
        }

        // Hash the password
        value.password = await bcrypt.hash(value.password, 10);

        // Create the new user
        const addUser = await User.create(value);
        req.session.user = { id: addUser.id };

        // Response object
        const response = {
            firstName: addUser.firstName,
            lastName: addUser.lastName,
            email: addUser.email,
            role: addUser.role
        };

        return res.status(201).json({
            response: response,
            message: 'User successfully registered'
        });
    } catch (error) {
        return res.status(401).json({
            status: false,
            message: error.message
        });
    }
};

export const loginSession = async (req, res, next) => {
    try {
        const {email, password} = req.body
        // Find user using their unique identifier
        const user = await User.findOne({email})
    
        if(!user) {
            return res.status(401).json('No user found')
        }
    
        // Verify their password
        const correctPassword = bcrypt.compareSync(password, user.password)
        if (!correctPassword) {
            return res.status(401).json({
                status: false,
                message: 'Invalid credentials'
            })
        }
    
        // Generate a session for the user
        req.session.user = {id: user.id};

        res.status(201).json({
            message: 'Login successful'
        })
    } catch (error) {
        next(error)
        res.status(400).json({
            status: false,
            error: error.message
        })
    }
}

export const loginToken = async (req, res, next) => {
    try {
        const { value, error } = loginValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }

        const user = await User.findOne({ email: value.email });
        if (!user) {
            return res.status(401).json('User Not Found');
        }

        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json('Invalid Credentials');
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '10h' }
        );

        res.status(200).json({
            message: 'User Logged In',
            accessToken: token,
            userDetails: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};



export const logout = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];  // Extract token from headers
      
        
        if (!token) {
            return res.status(401).json({ message: 'Token not found' });
        }

        // Decode the token to get expiration time
        const decoded = jwt.decode(token);
      

        const exp = decoded.exp;
        const currentTime = Math.floor(Date.now() / 1000);
        let timeToExpire = exp - currentTime;

        // Adjust if token already expired
        if (timeToExpire <= 0) {
            return res.status(400).json({ message: 'Token has already expired' });
        }


        // Store the token in Redis with an expiry time using the `set` method
        await createClient.set(token, 'blacklisted', {
            EX: timeToExpire // EX is the expiry option for the number of seconds
        });


        // Destroy user session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Failed to destroy session' });
            }
            return res.status(200).json({ message: 'Logout successful' });
        });

    } catch (error) {
        console.error('Logout error:', error);
        next(error);
    }
};


export const getUsers = async (req, res, next) => {
    try {
        // Get all users
        const users = await User.find()
            .select({ password: false });
        // Return response
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

export const createUser = async (req, res, next) => {
    try {
        // Validate request
        const { value, error } = createUserValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }
        // Encrypt user password
        const hashedPassword = bcrypt.hashSync(value.password, 10);
        // Create user
        await User.create({
            ...value,
            password: hashedPassword
        });
        // Send email to user
        await mailTransport.sendMail({
            from: "flogix-api@youth-arise.org",
            to: value.email,
            subject: "User Account Created!",
            text: `Dear user,\n\nA user account has been created for you with the following credentials.\n\nEmail: ${value.email}\nPassword: ${value.password}\nRole: ${value.role}\n\nThank you!`
        });
        // Return response
        res.status(201).json('User Created');
    } catch (error) {
        next(error);
    }
}

export const updateUser = async (req, res, next) => {
    try {
        // Validate request
        const { value, error } = updateUserValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }
        // Update user
        await User.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true }
        );
        // Return response
        res.status(200).json('User Updated');
    } catch (error) {
        next(error);
    }
}


