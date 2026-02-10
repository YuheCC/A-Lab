// components/streamSSE.js
import JSON5 from 'json5';

export async function* streamSSE(response) {
  const reader   = response.body.getReader();
  const decoder  = new TextDecoder();
  let   buffer   = "";

  const parseEvent = (raw) => {
    let eventName = "message"; // default
    let data      = "";
    let dataLines = [];  // 用于收集多行data
    let inDataBlock = false; // 标记是否处于data段内

    raw.split("\n").forEach((line) => {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
        return;
      }

      if (line.startsWith(":")) {
        // 注释/keep-alive，忽略
        return;
      }

      if (line.startsWith("data:")) {
        // SSE规范：data:后面的内容（包括空格）
        const dataContent = line.slice(5);
        inDataBlock = true;
        // 如果以空格开头，去掉第一个空格
        dataLines.push(dataContent.startsWith(' ') ? dataContent.slice(1) : dataContent);
        return;
      }

      // 非标准行：某些服务端仅第一行带 data:，后续行直接换行续写
      if (inDataBlock) {
        dataLines.push(line);
      }
      // 其它字段(id:, retry: 等)忽略
    });

    // 合并多行data（用换行符连接，符合SSE规范，也兼容服务端续行）
    data = dataLines.join('\n');

    // Gracefully handle empty payloads (keep‑alives)
    if (!data) return null;

    // 尝试解析为 JSON（严格 -> 宽松 JSON5）
    try {
      const json = JSON.parse(data);
      return eventName === "message" ? json : { event: eventName, ...json };
    } catch (err) {
      // 宽松解析（支持单引号、无引号键等）
      try {
        const loose = JSON5.parse(data);
        return eventName === "message" ? loose : { event: eventName, ...loose };
      } catch (e2) {
        // 如果仍然不是 JSON，返回纯文本格式（支持服务器直接发送文本）
        console.log('[streamSSE] Received plain text data:', data.substring(0, 100) + (data.length > 100 ? '...' : ''));
        return eventName === "message" 
          ? { data: data }
          : { event: eventName, data: data };
      }
    }
  };

  console.log('[streamSSE] Starting to read SSE stream...');
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      console.log('[streamSSE] Stream ended, buffer remaining:', buffer.length, 'bytes');
      // 处理 buffer 中剩余的数据（如果有的话）
      if (buffer.trim()) {
        console.log('[streamSSE] Processing remaining buffer:', buffer.substring(0, 200));
        const parsed = parseEvent(buffer);
        if (parsed) {
          console.log('[streamSSE] Yielding final event');
          yield parsed;
        }
      }
      break;
    }
    
    const chunk = decoder.decode(value, { stream: true });
    console.log('[streamSSE] Received chunk:', chunk.length, 'bytes');
    buffer += chunk;

    let split;
    while ((split = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);

      console.log('[streamSSE] Parsing event, raw length:', rawEvent.length);
      const parsed = parseEvent(rawEvent);
      if (parsed) {
        console.log('[streamSSE] Yielding event with data length:', parsed.data?.length || 0);
        yield parsed;
      } else {
        console.log('[streamSSE] Event parsed to null (likely keep-alive)');
      }
    }
  }
  
  console.log('[streamSSE] Stream reading completed');
}

// Provide a default export so consumers can use either syntax
export default streamSSE;