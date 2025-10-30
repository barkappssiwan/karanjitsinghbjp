// api/vote.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'votesdb';
const MONGODB_COLLECTION = 'votes';

// Global variables to reuse connection
let client;
let clientPromise;

if (!MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env or Vercel Environment Variables');
}

// In development (vercel dev), reuse client
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production (Vercel), create new client per invocation
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let client;
  try {
    client = await clientPromise;
    const db = client.db(MONGODB_DB);
    const collection = db.collection(MONGODB_COLLECTION);

    if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: 'totalVotes' });
      return res.status(200).json({ votes: doc?.count || 0 });
    }

    if (req.method === 'POST') {
      await collection.updateOne(
        { _id: 'totalVotes' },
        { $inc: { count: 1 } },
        { upsert: true }
      );

      const doc = await collection.findOne({ _id: 'totalVotes' });
      return res.status(200).json({ success: true, votes: doc?.count || 1 });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('MongoDB Error:', error.message);
    return res.status(500).json({
      error: 'Database connection failed',
      details: error.message
    });
  }
}
