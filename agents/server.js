import express from 'express';
import 'dotenv/config';
import { qualifyAgent } from './agents/test-nova-qualify/index.js'; // example agent

const app = express();
app.use(express.json());

// Example route to test agent
app.post('/run', async (req, res) => {
  try {
    const result = await qualifyAgent(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});