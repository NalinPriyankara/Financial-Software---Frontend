import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply: string = data?.reply || "I couldn't generate a response.";
        const assistantMsg: Message = { id: Date.now().toString() + "-r", role: "assistant", text: reply };
        setMessages((m) => [...m, assistantMsg]);
      } else {
        const assistantMsg: Message = { id: Date.now().toString() + "-r", role: "assistant", text: `Echo: ${text}` };
        await new Promise((r) => setTimeout(r, 600));
        setMessages((m) => [...m, assistantMsg]);
      }
    } catch (err) {
      const assistantMsg: Message = { id: Date.now().toString() + "-r", role: "assistant", text: `Sorry, something went wrong.` };
      setMessages((m) => [...m, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>AI</Avatar>
          <Box>
            <Typography variant="subtitle1">AI Chat</Typography>
            <Typography variant="caption" color="text.secondary">Ask questions and get instant answers</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" onClick={() => { setMessages([]); setInput(""); setLoading(false); }}>New chat</Button>
        </Box>
      </Box>
      <Divider />

      {/* Welcome header (not a chat message) */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h4" component="h2">
          How can I help you today?
        </Typography>
      </Box>

      {/* Messages area */}
      <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "background.default" }}>
        <Box sx={{ maxWidth: 800, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {messages.map((m) => (
            <Box key={m.id} sx={{ display: "flex", gap: 1, alignItems: "flex-end", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>AI</Avatar>
              )}

              <Box sx={{
                maxWidth: "75%",
                p: 1.25,
                borderRadius: 2,
                bgcolor: m.role === "assistant" ? "grey.100" : "primary.main",
                color: m.role === "assistant" ? "text.primary" : "primary.contrastText",
                boxShadow: 1,
                whiteSpace: "pre-wrap",
                fontSize: 14,
              }}>
                <Typography variant="body2">{m.text}</Typography>
              </Box>

              {m.role === "user" && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: "grey.500" }}>U</Avatar>
              )}
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "flex-start" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>AI</Avatar>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "grey.100", boxShadow: 1 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">Thinking...</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Input bar */}
      <Box component="form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }} sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Box sx={{ maxWidth: 800, mx: "auto", display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder={loading ? "Thinking..." : "Ask anything..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            multiline
            maxRows={6}
            disabled={loading}
            sx={{ bgcolor: "background.paper" }}
          />
          <IconButton color="primary" onClick={sendMessage} disabled={loading || !input.trim()} aria-label="send">
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AIChat;
