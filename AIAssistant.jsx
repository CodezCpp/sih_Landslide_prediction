import { useState } from "react";
import { Bot, Send, X, ShieldAlert } from "lucide-react";

function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I am the AI Safety Assistant. Ask me about landslide risk, warnings, rainfall or safety actions.",
    },
  ]);

  const getResponse = (question) => {
    const q = question.toLowerCase();

    if (q.includes("risk") || q.includes("danger")) {
      return "Aizawl is currently classified as a high-risk zone in this prototype. Check the Risk Map and AI Prediction sections for detailed risk factors.";
    }

    if (q.includes("rain") || q.includes("rainfall")) {
      return "Heavy rainfall can increase landslide risk by saturating soil and reducing slope stability. The system monitors rainfall trends as a key risk factor.";
    }

    if (q.includes("safe") || q.includes("safety")) {
      return "If you observe cracks, slope movement, falling rocks or blocked roads, move to a safe location and submit a Field Report with photo evidence.";
    }

    if (q.includes("warning") || q.includes("alert")) {
      return "High-risk alerts can be communicated through the Warning Center to district authorities, disaster management authorities and local communities.";
    }

    if (q.includes("map")) {
      return "Open the Risk Map to view high, moderate and low-risk areas, vulnerable roads, infrastructure and sensor locations.";
    }

    return "I can help you understand landslide risk, rainfall conditions, warnings, safety actions and the Risk Map.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      { type: "user", text: userMessage },
      { type: "bot", text: getResponse(userMessage) },
    ]);

    setInput("");
  };

  return (
    <>
      {/* Floating Assistant Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-[9999] flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-900/40 transition hover:scale-105 hover:bg-cyan-300 sm:bottom-6 sm:right-6"
        >
          <Bot size={20} />
          AI Safety Assistant
        </button>
      )}

      {/* Chat Window */}
      {open && (
       <div className="fixed bottom-24 right-4 z-[9999] flex h-[600px] w-[calc(100%-24px)] max-w-[450px] flex-col overflow-hidden rounded-2xl border border-slate-600 bg-slate-950 shadow-2xl sm:bottom-6 sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-cyan-400/10 p-2">
                <Bot size={20} className="text-cyan-400" />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  AI Safety Assistant
                </p>
                <p className="text-[10px] text-green-400">
                  ● Monitoring Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.type === "user"
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          <div className="flex gap-2 overflow-x-auto border-t border-slate-800 px-3 py-2">
            <button
              onClick={() => setInput("What is the current risk?")}
              className="whitespace-nowrap rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300"
            >
              Current risk?
            </button>

            <button
              onClick={() => setInput("What should I do for safety?")}
              className="whitespace-nowrap rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300"
            >
              Safety tips
            </button>

            <button
              onClick={() => setInput("Why is rainfall important?")}
              className="whitespace-nowrap rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300"
            >
              Rainfall
            </button>
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-slate-700 bg-slate-900 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask about landslide risk..."
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />

            <button
              onClick={sendMessage}
              className="rounded-xl bg-cyan-400 px-3 text-slate-950 hover:bg-cyan-300"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistant;