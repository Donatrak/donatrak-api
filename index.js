import express from 'express';
import { dbConnection } from './config/db.js';


// calling the database
dbConnection ();


// creating an express app
const app = express();



// listening for incoming requests
const port = process.env.PORT || 3070
app.listen(port, ()=>{
    console.log(`App listening on port ${port}`)
});
 



