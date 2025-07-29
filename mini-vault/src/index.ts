import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const llmUrl = process.env.OLLAMA_URL || "http://localhost:11434/api/chat"

app.post('/generate', async (req, res) => {
  if (!req.body || !req.body.prompt) {
    return res.status(400).json({ error: "Please send correct prompt" });
  }

  const prompt = req.body.prompt;

  const payload = {
    model: "smollm:135m",
    messages: [{role: "user", content: prompt}],
    stream: true
  }

  try {
    const response = await fetch(llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          if (data.message?.content) {
            const content = data.message.content;
            fullResponse += content;
            
            res.write(content);
          }
          
          if (data.done) {
            console.log('Streaming completed');
            break;
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }

    // Log the complete response
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dirPath = path.join(__dirname, "./logs");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const newEntry = { prompt, response: fullResponse };
    const filePath = path.join(dirPath, "log.jsonl");
    fs.appendFileSync(filePath, JSON.stringify(newEntry) + "\n");

    res.end();
  } catch (error) {
    console.error('Error in streaming:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream response from Ollama", details: error.message });
    }
  }
});

app.get('/status', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Convert bytes to MB for better readability
    const formatMemory = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    // Convert uptime to readable format
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    const status = {
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptime,
        formatted: formatUptime(uptime)
      },
      memory: {
        rss: `${formatMemory(memoryUsage.rss)} MB`,
        heapTotal: `${formatMemory(memoryUsage.heapTotal)} MB`,
        heapUsed: `${formatMemory(memoryUsage.heapUsed)} MB`,
        external: `${formatMemory(memoryUsage.external)} MB`
      },
      process: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        cpuUsage: process.cpuUsage()
      },
      server: {
        status: "running",
        port: 8000
      }
    };

    res.json(status);
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: "Failed to get system status" });
  }
});

app.listen(8000, () => {
  console.log("Server started at port: 8000");
});