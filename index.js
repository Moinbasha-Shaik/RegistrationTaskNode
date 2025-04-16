const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use('/api', require("./routes/authRoutes.js"));

app.listen(8181, () => console.log('Server running on port 3000'));
