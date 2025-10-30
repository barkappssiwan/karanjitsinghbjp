// api/vote.js
import { MongoClient } from 'mongodb';

// === CONFIG ===
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'votesdb';
const MONGODB_COLLECTION = 'votes';

// === EARLY ERROR IF URI MISSING ===
if (!MONGODB_URI) {
  console.error('MONGODB_URI is MISSING in environment!');
  throw new Error('MONGODB_URI is not set. Add it in Vercel Environment Variables.');
}

// === REUSABLE CLIENT (Vercel-safe) ===
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Local dev: reuse connection
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect().catch(err => {
      console.error('Local MongoDB connect failed:', err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Vercel: create per invocation (safe)
  const client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect().catch(err => {
    console.error('Vercel MongoDB connect failed:', err);
    throw err;
  });
}

// === HANDLER ===
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Runtime Error in /api/vote:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}
