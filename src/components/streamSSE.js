// components/streamSSE.js
export async function* streamSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let split;
    while ((split = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, split).trim();  // one SSE event
      buffer = buffer.slice(split + 2);
      if (rawEvent.startsWith("data:")) {
        yield JSON.parse(rawEvent.slice(5).trim());
      }  // ignore comments / keep‑alives
    }
  }
}

// Provide a default export so consumers can use either syntax
export default streamSSE;