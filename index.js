import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import 'dotenv/config';
import cors from 'cors';
import { dbConnection } from "./config/db.js";
import { userRouter } from "./routes/user_route.js";
import { restartServer } from "./restart_server.js";
import { passwordResetRouter } from "./routes/passwordReset_route.js";
import { donationRouter } from "./routes/donation_route.js";
import { campaignRouter } from "./routes/campaign_route.js";
import { paymentRouter } from "./routes/payment_route.js";
import expressOasGenerator from "@mickeymond/express-oas-generator";
import mongoose from "mongoose";
import redis from "redis";




// create the express app
const app = express();

// Apply middlewares

expressOasGenerator.handleResponses(app, {
    alwaysServeDocs: true,
    tags: [
      "auth","campaigns","donations","payment" ],
    mongooseModels: mongoose.modelNames(),
  });

  const PORT = process.env.PORT || 3080;
// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors({ credentials: true, origin: '*' }));
app.use(express.static("donatrak"));



export const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    url: process.env.REDIS_URL
  },
  password: process.env.REDIS_PASSWORD
});


client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.connect().then(() => {
  console.log('Connected to Redis')
})
  .catch((err) => {
    console.error('Failed to connect to Redis:', err)
  });



app.use(
  session({
    secret: process.env.SESSION_SECRET, //encrypts the file
    resave: false,
    saveUninitialized: true,
    // cookie: {secure: true}
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL
    })
  }));
  
  app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "UP" });
  });
  
  // Use routes
  app.use('/api/v1', userRouter),
 app.use('/api/v1', userProfileRouter),
app.use('/api/v1', passwordResetRouter);
app.use('/api/v1',donationRouter)
app.use('/api/v1',campaignRouter)
app.use('/api/v1',paymentRouter)

  
  
  
  expressOasGenerator.handleRequests();
  app.use((req,res) => res.redirect("/api-docs/"));
  
  
  const reboot = async () => {
    setInterval(restartServer, process.env.INTERVAL)
  }
  
  // Connect to database
  dbConnection()
.then(() =>{
    app.listen(PORT, () =>{
        reboot().then(() =>{
            console.log(`Server restarted`);
        });
        console.log(`Server is connected to Port ${PORT}`);
    });
})
.catch((err) =>{
    console.log(err);
    process.exit(-1);
});

  
  
 



