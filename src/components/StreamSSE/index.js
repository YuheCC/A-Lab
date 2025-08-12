// components/streamSSE.js
export async function* streamSSE(response) {
  const reader   = response.body.getReader();
  const decoder  = new TextDecoder();
  let   buffer   = "";

  const parseEvent = (raw) => {
    let eventName = "message"; // default
    let data      = "";

    raw.split("\n").forEach((line) => {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        data += line.slice(5).trim();
      }
      // Ignore other fields (id:, retry:, comments, …)
    });

    // Gracefully handle empty payloads (keep‑alives)
    if (!data) return null;

    try {
      const json = JSON.parse(data);
      return eventName === "message" ? json : { event: eventName, ...json };
    } catch (err) {
      console.error("[streamSSE] Failed to parse JSON:", err, data);
      return null;
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let split;
    while ((split = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, split); // ***keep the trailing whitespace for accurate split***
      buffer = buffer.slice(split + 2);

      const parsed = parseEvent(rawEvent);
      if (parsed) yield parsed;
    }
  }
}

// Provide a default export so consumers can use either syntax
export default streamSSE;