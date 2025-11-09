# 🤖 Ollama Setup Guide

## 📦 Installation

### macOS

```bash
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows

Download from: https://ollama.com/download

---

## 🚀 Start Ollama Service

```bash
# Start Ollama server
ollama serve

# Or run in background (macOS/Linux)
nohup ollama serve > ollama.log 2>&1 &
```

---

## 🤖 Download AI Models

### Recommended Models

#### 1. **Llama 3.2 (3B)** ⭐ Best for development

```bash
ollama pull llama3.2
```

- Size: ~2GB
- RAM: 6GB
- Speed: Fast
- Quality: Great for journey planning

#### 2. **Gemma 2 (2B)** - Lightest option

```bash
ollama pull gemma2:2b
```

- Size: ~1.6GB
- RAM: 4GB
- Speed: Very fast
- Quality: Good

#### 3. **Llama 3.1 (8B)** - Best quality

```bash
ollama pull llama3.1
```

- Size: ~4.7GB
- RAM: 12GB
- Speed: Slower
- Quality: Excellent

#### 4. **Qwen 2.5 (7B)** - Best for Vietnamese

```bash
ollama pull qwen2.5:7b
```

- Size: ~4.4GB
- RAM: 10GB
- Speed: Medium
- Quality: Excellent for Vietnamese

---

## ⚙️ Configuration

### 1. Add to `.env.development`

```bash
# Ollama Configuration
OLLAMA_ENABLED=true
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 2. Test Ollama

```bash
# Test if Ollama is running
curl http://localhost:11434/api/tags

# Test model
ollama run llama3.2 "Hello, how are you?"
```

---

## 🧪 Usage in Journey Planning

### Enable AI Insights

```bash
# In .env.development
OLLAMA_ENABLED=true
```

### API Response with AI

```json
{
  "locations": [...],
  "totalDistanceKm": 15.5,
  "estimatedTotalTimeMinutes": 180,
  "averagePreferenceScore": 75,
  "optimizationScore": 150,
  "aiInsights": {
    "reasoning": "Các địa điểm này phù hợp với sở thích yên tĩnh của bạn. Bắt đầu với cafe ở quận 1, sau đó đến công viên...",
    "tips": [
      "Nên đi vào buổi sáng để tránh đông người",
      "Mang theo nước uống vì thời tiết nóng",
      "Địa điểm 3 đẹp nhất lúc hoàng hôn"
    ]
  }
}
```

---

## 🔧 Troubleshooting

### Ollama not running

```bash
# Check if running
ps aux | grep ollama

# Restart
pkill ollama
ollama serve
```

### Model not found

```bash
# List installed models
ollama list

# Pull model
ollama pull llama3.2
```

### Out of memory

- Use smaller model (gemma2:2b)
- Close other applications
- Increase system RAM

---

## 📊 Performance Comparison

| Model          | Size  | RAM  | Response Time | Quality    |
| -------------- | ----- | ---- | ------------- | ---------- |
| Gemma 2 (2B)   | 1.6GB | 4GB  | ~2s           | ⭐⭐⭐     |
| Llama 3.2 (3B) | 2GB   | 6GB  | ~3s           | ⭐⭐⭐⭐   |
| Llama 3.1 (8B) | 4.7GB | 12GB | ~5s           | ⭐⭐⭐⭐⭐ |
| Qwen 2.5 (7B)  | 4.4GB | 10GB | ~4s           | ⭐⭐⭐⭐⭐ |

---

## 💡 Tips

1. **Development**: Use `llama3.2` (fast, good quality)
2. **Production**: Use `llama3.1` or `qwen2.5:7b` (best quality)
3. **Low RAM**: Use `gemma2:2b`
4. **Vietnamese**: Use `qwen2.5:7b`

---

## 🚀 Next Steps

1. Install Ollama
2. Pull a model: `ollama pull llama3.2`
3. Start service: `ollama serve`
4. Enable in `.env`: `OLLAMA_ENABLED=true`
5. Test journey planning API!
