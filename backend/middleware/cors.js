const express = require('express');
const app = express();
const cors = require ('cors');

 
const allowOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081'
];



app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json());