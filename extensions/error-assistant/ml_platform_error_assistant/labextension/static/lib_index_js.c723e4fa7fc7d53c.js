"use strict";
(self["rspackChunk_ml_platform_error_assistant"] = self["rspackChunk_ml_platform_error_assistant"] || []).push([["lib_index_js"], {
"./lib/ai-chatbot.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createAIChatbotPanel: () => (createAIChatbotPanel)
});
/* import */ var _request__rspack_import_0 = __webpack_require__("./lib/request.js");

async function requestChatAPI(settings, payload) {
    return (0,_request__rspack_import_0.requestAPI)('api/ai/chat', settings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}
function parseCodeBlocks(text) {
    const segments = [];
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }
        segments.push({ type: 'code', lang: match[1] || 'python', content: match[2].trim() });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        segments.push({ type: 'text', content: text.slice(lastIndex) });
    }
    return { segments };
}
function renderMessageContent(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'mm-chat-msg-content';
    const { segments } = parseCodeBlocks(text);
    segments.forEach(seg => {
        if (seg.type === 'code') {
            const codeWrap = document.createElement('div');
            codeWrap.className = 'mm-chat-code-block';
            const codeLang = document.createElement('div');
            codeLang.className = 'mm-chat-code-lang';
            const langLabel = document.createElement('span');
            langLabel.textContent = seg.lang || 'code';
            const copyBtn = document.createElement('button');
            copyBtn.className = 'mm-chat-copy-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(seg.content);
                    copyBtn.textContent = '✓ Copied';
                    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
                }
                catch (_a) {
                    copyBtn.textContent = 'Failed';
                }
            });
            codeLang.append(langLabel, copyBtn);
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = seg.content;
            pre.appendChild(code);
            codeWrap.append(codeLang, pre);
            wrapper.appendChild(codeWrap);
        }
        else {
            // Render text with basic markdown (bold, inline code)
            const p = document.createElement('div');
            p.className = 'mm-chat-text-seg';
            // Convert **bold**, *italic*, `inline code`
            p.innerHTML = seg.content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code class="mm-chat-inline-code">$1</code>')
                .replace(/\n/g, '<br>');
            wrapper.appendChild(p);
        }
    });
    return wrapper;
}
function createMessageBubble(msg) {
    const wrapper = document.createElement('div');
    wrapper.className = `mm-chat-msg mm-chat-msg-${msg.role}`;
    const avatar = document.createElement('div');
    avatar.className = `mm-chat-avatar mm-chat-avatar-${msg.role}`;
    avatar.textContent = msg.role === 'user' ? '👤' : (msg.provider === 'gemini' ? '✨' : '🦙');
    const container = document.createElement('div');
    container.className = 'mm-chat-bubble-container';
    // Bubble meta header
    const metaHeader = document.createElement('div');
    metaHeader.className = `mm-chat-bubble-header mm-chat-bubble-header-${msg.role}`;
    const senderName = document.createElement('span');
    senderName.className = 'mm-chat-sender-name';
    senderName.textContent = msg.role === 'user' ? 'You' : 'ModelMind AI';
    metaHeader.appendChild(senderName);
    if (msg.role === 'assistant' && msg.provider) {
        const badge = document.createElement('span');
        badge.className = `mm-chat-provider-badge mm-chat-badge-${msg.provider}`;
        badge.textContent = msg.provider === 'gemini' ? 'Gemini Cloud' : 'Ollama Local';
        metaHeader.appendChild(badge);
    }
    const time = document.createElement('span');
    time.className = 'mm-chat-time';
    time.textContent = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    metaHeader.appendChild(time);
    const bubble = document.createElement('div');
    bubble.className = `mm-chat-bubble mm-chat-bubble-${msg.role}`;
    if (msg.isError) {
        bubble.classList.add('mm-chat-bubble-error');
    }
    if (msg.isStreaming) {
        bubble.classList.add('mm-chat-bubble-streaming');
        const dots = document.createElement('div');
        dots.className = 'mm-chat-typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        bubble.appendChild(dots);
    }
    else {
        const content = renderMessageContent(msg.content);
        bubble.appendChild(content);
    }
    container.append(metaHeader, bubble);
    if (msg.role === 'user') {
        wrapper.append(container, avatar);
    }
    else {
        wrapper.append(avatar, container);
    }
    return wrapper;
}
function injectChatStyles() {
    if (document.getElementById('mm-chatbot-styles')) {
        const existing = document.getElementById('mm-chatbot-styles');
        if (existing)
            existing.remove();
    }
    const style = document.createElement('style');
    style.id = 'mm-chatbot-styles';
    style.textContent = `
    /* ═══════════════════════════════════════════════
       AI CHATBOT PANEL — AI Assistant Matching Theme
    ═══════════════════════════════════════════════ */
    .mm-chatbot-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-width: 0;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      color: var(--ml-assistant-text, #253041);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      position: relative;
      border-left: 1px solid var(--ml-assistant-border, #dfe3ea);
      container-name: mm-chatbot;
      container-type: inline-size;
    }

    /* Header matching AI Assistant */
    .mm-chatbot-header {
      flex-shrink: 0;
      padding: 14px 14px 10px;
      background: var(--ml-assistant-card-bg, #ffffff);
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chatbot-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }

    .mm-chatbot-title {
      min-width: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .mm-chatbot-title-icon {
      font-size: 18px;
      line-height: 1;
    }

    /* Provider Switch styled like AI Assistant tabs / buttons */
    .mm-chatbot-provider-switch {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: 6px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
    }

    .mm-chatbot-provider-btn {
      min-width: 0;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--ml-assistant-muted, #5d6b80);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mm-chatbot-provider-btn:hover:not(.active-ollama):not(.active-gemini) {
      color: var(--ml-assistant-text, #253041);
      background: rgba(255, 255, 255, 0.7);
    }

    .mm-chatbot-provider-btn.active-ollama {
      background: var(--ml-assistant-card-bg, #ffffff);
      border-color: var(--ml-assistant-border, #dfe3ea);
      color: #6b21a8;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.08));
    }

    .mm-chatbot-provider-btn.active-gemini {
      background: var(--ml-assistant-card-bg, #ffffff);
      border-color: var(--ml-assistant-border, #dfe3ea);
      color: #173ea5;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.08));
    }

    /* Status row matching AI Assistant */
    .mm-chatbot-status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mm-chatbot-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      background: var(--ml-assistant-success-bg, #dff5eb);
      color: var(--ml-assistant-success-text, #1d7b54);
      border: 1px solid transparent;
    }

    .mm-chatbot-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
    }

    .mm-chatbot-status-pill.offline {
      background: var(--ml-assistant-warn-bg, #fdf0d5);
      color: var(--ml-assistant-warn-text, #9c6b11);
    }

    .mm-chatbot-status-pill.offline .mm-chatbot-status-dot {
      background: #f59e0b;
    }

    /* Context row matching AI Assistant secondary controls */
    .mm-chatbot-context-bar {
      flex-shrink: 0;
      padding: 7px 14px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--ml-assistant-muted, #5d6b80);
      font-weight: 600;
      flex-wrap: wrap;
    }

    .mm-chatbot-context-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      color: var(--ml-assistant-text, #253041);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .mm-chatbot-context-chip:hover {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border-color: var(--ml-assistant-accent, #6d7cff);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    /* Messages thread */
    .mm-chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      scroll-behavior: smooth;
      min-width: 0;
    }

    .mm-chatbot-messages::-webkit-scrollbar {
      width: 5px;
    }
    .mm-chatbot-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .mm-chatbot-messages::-webkit-scrollbar-thumb {
      background: var(--ml-assistant-border, #dfe3ea);
      border-radius: 99px;
    }
    .mm-chatbot-messages::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }

    /* Welcome / Empty State matching AI Assistant */
    .mm-chat-welcome {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 24px 16px;
      text-align: center;
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 12px;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.05));
      margin: auto 0;
    }

    .mm-chat-welcome-icon {
      font-size: 36px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--ml-assistant-accent-soft, #eef1ff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ml-assistant-accent, #6d7cff);
    }

    .mm-chat-welcome-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      margin: 0;
    }

    .mm-chat-welcome-sub {
      font-size: 12px;
      color: var(--ml-assistant-muted, #5d6b80);
      line-height: 1.5;
      max-width: 260px;
      margin: 0;
    }

    .mm-chat-suggestions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      margin-top: 6px;
    }

    .mm-chat-suggestion-chip {
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-panel-bg, #f8fafc);
      color: var(--ml-assistant-text, #253041);
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      line-height: 1.4;
    }

    .mm-chat-suggestion-chip:hover {
      border-color: var(--ml-assistant-accent, #6d7cff);
      background: var(--ml-assistant-accent-soft, #eef1ff);
      color: #312e81;
      transform: translateX(2px);
    }

    /* Message Bubbles */
    .mm-chat-msg {
      display: flex;
      gap: 9px;
      max-width: 100%;
      min-width: 0;
    }

    .mm-chat-msg-user {
      flex-direction: row-reverse;
      align-self: flex-end;
    }

    .mm-chat-msg-assistant {
      align-self: flex-start;
    }

    .mm-chat-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .mm-chat-avatar-user {
      background: #e0e7ff;
      border: 1px solid #c7d2fe;
      color: #4338ca;
    }

    .mm-chat-avatar-assistant {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid rgba(109, 124, 255, 0.3);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    .mm-chat-bubble-container {
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-width: calc(100% - 38px);
      min-width: 0;
    }

    .mm-chat-bubble-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      color: var(--ml-assistant-muted, #5d6b80);
      padding: 0 3px;
    }

    .mm-chat-bubble-header-user {
      justify-content: flex-end;
    }

    .mm-chat-sender-name {
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
    }

    .mm-chat-provider-badge {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 600;
    }

    .mm-chat-badge-gemini {
      background: #edf4ff;
      border: 1px solid #d3e3ff;
      color: #173ea5;
    }

    .mm-chat-badge-ollama {
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      color: #6b21a8;
    }

    .mm-chat-time {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Bubble bodies matching AI Assistant Cards */
    .mm-chat-bubble {
      padding: 11px 13px;
      border-radius: 10px;
      font-size: 12px;
      line-height: 1.55;
      word-break: break-word;
    }

    .mm-chat-bubble-user {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid #d3e3ff;
      border-top-right-radius: 2px;
      color: #1e1b4b;
      box-shadow: 0 1px 2px rgba(109, 124, 255, 0.06);
    }

    .mm-chat-bubble-assistant {
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-top-left-radius: 2px;
      color: var(--ml-assistant-text, #253041);
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.06));
    }

    .mm-chat-bubble-error {
      background: var(--ml-assistant-error-bg, #fff1f1) !important;
      border: 1px solid rgb(163 61 77 / 20%) !important;
      color: var(--ml-assistant-error-text, #a33d4d) !important;
    }

    /* Message content */
    .mm-chat-msg-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chat-text-seg {
      color: inherit;
      font-size: 12px;
      line-height: 1.6;
    }

    .mm-chat-text-seg strong {
      color: #0f172a;
      font-weight: 700;
    }

    .mm-chat-text-seg em {
      color: #4338ca;
    }

    .mm-chat-inline-code {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 1px 5px;
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #0f172a;
    }

    /* Code block matching AI Assistant style */
    .mm-chat-code-block {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      background: #1e293b;
      margin: 4px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .mm-chat-code-lang {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .mm-chat-code-lang span {
      font-size: 10px;
      color: #475569;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .mm-chat-copy-btn {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .mm-chat-copy-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
      color: #1e293b;
    }

    .mm-chat-code-block pre {
      margin: 0;
      padding: 11px 13px;
      overflow-x: auto;
      background: #1e293b;
    }

    .mm-chat-code-block code {
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 11.5px;
      line-height: 1.55;
      color: #f8fafc;
      white-space: pre;
    }

    /* Typing animation */
    .mm-chat-bubble-streaming {
      padding: 12px 16px;
    }

    .mm-chat-typing-dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .mm-chat-typing-dots span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--ml-assistant-accent, #6d7cff);
      animation: mm-typing 1.2s infinite;
    }

    .mm-chat-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .mm-chat-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes mm-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* Input Area matching AI Assistant form inputs */
    .mm-chatbot-input-area {
      flex-shrink: 0;
      padding: 10px 14px 14px;
      border-top: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-card-bg, #ffffff);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chatbot-input-helpers {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }

    .mm-chat-helper-btn {
      padding: 4px 9px;
      border-radius: 6px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-card-bg, #ffffff);
      color: var(--ml-assistant-muted, #5d6b80);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mm-chat-helper-btn:hover {
      border-color: #cbd5e1;
      color: var(--ml-assistant-text, #253041);
      background: var(--ml-assistant-panel-bg, #f8fafc);
    }

    .mm-chatbot-clear-btn {
      padding: 4px 9px;
      border-radius: 6px;
      border: 1px solid rgba(163, 61, 77, 0.2);
      background: #ffffff;
      color: var(--ml-assistant-error-text, #a33d4d);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      margin-left: auto;
    }

    .mm-chatbot-clear-btn:hover {
      background: #fff1f1;
      border-color: rgba(163, 61, 77, 0.4);
    }

    .mm-chatbot-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      min-width: 0;
    }

    .mm-chatbot-textarea {
      flex: 1;
      min-width: 0;
      background: #ffffff;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px;
      color: var(--ml-assistant-text, #253041);
      font-size: 12px;
      padding: 9px 12px;
      resize: none;
      outline: none;
      font-family: inherit;
      line-height: 1.45;
      max-height: 120px;
      min-height: 38px;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .mm-chatbot-textarea:focus {
      border-color: var(--ml-assistant-accent, #6d7cff);
      box-shadow: 0 0 0 3px rgba(109, 124, 255, 0.16);
    }

    .mm-chatbot-textarea::placeholder {
      color: #94a3b8;
    }

    /* Send button matching .ml-assistant-cta-button */
    .mm-chatbot-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-accent, #6d7cff);
      background: var(--ml-assistant-accent, #6d7cff);
      color: #ffffff;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(109, 124, 255, 0.2);
    }

    .mm-chatbot-send-btn:hover:not(:disabled) {
      background: #5b6aff;
      border-color: #5b6aff;
      box-shadow: 0 2px 4px rgba(109, 124, 255, 0.3);
    }

    .mm-chatbot-send-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
    }

    .mm-chatbot-send-btn.gemini-mode {
      background: #2563eb;
      border-color: #2563eb;
    }

    .mm-chatbot-send-btn.gemini-mode:hover:not(:disabled) {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }

    @container mm-chatbot (max-width: 380px) {
      .mm-chatbot-header { padding-inline: 10px; }
      .mm-chatbot-title-row { align-items: flex-start; gap: 7px; }
      .mm-chatbot-title {
        flex: 0 1 92px;
        align-items: flex-start;
        line-height: 1.08;
      }
      .mm-chatbot-provider-switch { flex: 1 1 auto; gap: 3px; }
      .mm-chatbot-provider-btn {
        flex: 1 1 0;
        justify-content: center;
        padding: 5px 6px;
        white-space: nowrap;
      }
      .mm-chatbot-context-bar { padding-inline: 10px; }
      .mm-chatbot-messages { padding: 10px; }
      .mm-chatbot-input-area { padding-inline: 10px; }
      .mm-chatbot-input-helpers { gap: 5px; }
      .mm-chat-helper-btn { flex: 0 1 auto; padding-inline: 7px; }
      .mm-chatbot-clear-btn { margin-left: auto; }
    }
  `;
    document.head.appendChild(style);
}
function createAIChatbotPanel(settings, getActiveCode, getActiveError) {
    injectChatStyles();
    const messages = [];
    let currentProvider = 'ollama';
    let isTyping = false;
    const conversationHistory = [];
    // Root
    const root = document.createElement('div');
    root.className = 'mm-chatbot-root';
    // Header
    const header = document.createElement('div');
    header.className = 'mm-chatbot-header';
    const titleRow = document.createElement('div');
    titleRow.className = 'mm-chatbot-title-row';
    const title = document.createElement('div');
    title.className = 'mm-chatbot-title';
    title.innerHTML = '<span class="mm-chatbot-title-icon">💬</span> AI Chatbot';
    const providerSwitch = document.createElement('div');
    providerSwitch.className = 'mm-chatbot-provider-switch';
    const ollamaBtn = document.createElement('button');
    ollamaBtn.className = 'mm-chatbot-provider-btn active-ollama';
    ollamaBtn.title = 'Use local Ollama (offline, private)';
    ollamaBtn.textContent = '🦙 Ollama';
    const geminiBtn = document.createElement('button');
    geminiBtn.className = 'mm-chatbot-provider-btn';
    geminiBtn.title = 'Switch to Google Gemini (cloud)';
    geminiBtn.textContent = '✨ Gemini';
    providerSwitch.append(ollamaBtn, geminiBtn);
    titleRow.append(title, providerSwitch);
    const statusBar = document.createElement('div');
    statusBar.className = 'mm-chatbot-status-bar';
    const localPill = document.createElement('span');
    localPill.className = 'mm-chatbot-status-pill';
    localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)';
    const cloudPill = document.createElement('span');
    cloudPill.className = 'mm-chatbot-status-pill';
    cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini (Cloud AI)';
    statusBar.append(localPill, cloudPill);
    header.append(titleRow, statusBar);
    // Context bar
    const contextBar = document.createElement('div');
    contextBar.className = 'mm-chatbot-context-bar';
    contextBar.innerHTML = '<span>Context:</span>';
    const codeChip = document.createElement('button');
    codeChip.className = 'mm-chatbot-context-chip';
    codeChip.title = 'Paste active cell code into your message';
    codeChip.innerHTML = '📋 Active Cell';
    const errorChip = document.createElement('button');
    errorChip.className = 'mm-chatbot-context-chip';
    errorChip.style.display = 'none';
    errorChip.title = 'Paste last error into your message';
    errorChip.innerHTML = '🐞 Last Error';
    contextBar.append(codeChip, errorChip);
    // Messages area
    const messagesArea = document.createElement('div');
    messagesArea.className = 'mm-chatbot-messages';
    // Welcome screen
    const welcome = document.createElement('div');
    welcome.className = 'mm-chat-welcome';
    welcome.innerHTML = `
    <div class="mm-chat-welcome-icon">🤖</div>
    <div class="mm-chat-welcome-title">ModelMind AI Chatbot</div>
    <div class="mm-chat-welcome-sub">Ask me anything — code explanations, debugging help, ML concepts, or anything Python.</div>
  `;
    const suggestions = document.createElement('div');
    suggestions.className = 'mm-chat-suggestions';
    const SAMPLE_QUESTIONS = [
        '💡 Explain active cell code',
        '🐞 How to fix the latest error?',
        '📊 How to visualize data with matplotlib?',
        '⚡ Optimize my code performance',
        '🤖 Recommend best ML model for my data',
    ];
    SAMPLE_QUESTIONS.forEach(q => {
        const chip = document.createElement('button');
        chip.className = 'mm-chat-suggestion-chip';
        chip.textContent = q;
        chip.addEventListener('click', () => {
            let question = q.replace(/^[^\s]+\s/, ''); // remove emoji prefix
            if (q.includes('active cell')) {
                const code = getActiveCode();
                if (code) {
                    question = `Explain this code:\n\`\`\`python\n${code}\n\`\`\``;
                }
            }
            else if (q.includes('latest error')) {
                const err = getActiveError();
                if (err) {
                    question = `How do I fix this error?\n${err.error_type}: ${err.error_message}\n\`\`\`python\n${err.code || ''}\n\`\`\``;
                }
            }
            textarea.value = question;
            textarea.dispatchEvent(new Event('input'));
            sendMessage();
        });
        suggestions.appendChild(chip);
    });
    welcome.appendChild(suggestions);
    messagesArea.appendChild(welcome);
    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'mm-chatbot-input-area';
    const helpers = document.createElement('div');
    helpers.className = 'mm-chatbot-input-helpers';
    const helperBtns = [
        { icon: '📋', label: 'Paste Code', action: () => {
                const code = getActiveCode();
                if (code) {
                    textarea.value += (textarea.value ? '\n' : '') + `\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``;
                    adjustTextareaHeight();
                    textarea.focus();
                }
            } },
        { icon: '🐞', label: 'Paste Error', action: () => {
                const err = getActiveError();
                if (err) {
                    textarea.value += (textarea.value ? '\n' : '') +
                        `Error: ${err.error_type}: ${err.error_message}\n` +
                        (err.traceback ? `Traceback:\n\`\`\`\n${err.traceback.slice(0, 1000)}\n\`\`\`` : '');
                    adjustTextareaHeight();
                    textarea.focus();
                }
            } },
        { icon: '📝', label: 'Explain Code', action: () => {
                const code = getActiveCode();
                if (code) {
                    textarea.value = `Please explain this code in detail:\n\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``;
                    adjustTextareaHeight();
                    textarea.focus();
                }
            } },
    ];
    helperBtns.forEach(({ icon, label, action }) => {
        const btn = document.createElement('button');
        btn.className = 'mm-chat-helper-btn';
        btn.textContent = `${icon} ${label}`;
        btn.addEventListener('click', action);
        helpers.appendChild(btn);
    });
    const clearBtn = document.createElement('button');
    clearBtn.className = 'mm-chatbot-clear-btn';
    clearBtn.textContent = '🗑 Clear';
    clearBtn.addEventListener('click', () => {
        messages.length = 0;
        conversationHistory.length = 0;
        messagesArea.replaceChildren(welcome);
    });
    helpers.appendChild(clearBtn);
    const inputRow = document.createElement('div');
    inputRow.className = 'mm-chatbot-input-row';
    const textarea = document.createElement('textarea');
    textarea.className = 'mm-chatbot-textarea';
    textarea.placeholder = 'Ask anything about code, ML, or Python... (Shift+Enter for newline)';
    textarea.rows = 1;
    const sendBtn = document.createElement('button');
    sendBtn.className = 'mm-chatbot-send-btn';
    sendBtn.title = 'Send message';
    sendBtn.innerHTML = '➤';
    inputRow.append(textarea, sendBtn);
    inputArea.append(helpers, inputRow);
    function adjustTextareaHeight() {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    textarea.addEventListener('input', adjustTextareaHeight);
    // Provider switching
    function switchProvider(p) {
        currentProvider = p;
        if (p === 'ollama') {
            ollamaBtn.className = 'mm-chatbot-provider-btn active-ollama';
            geminiBtn.className = 'mm-chatbot-provider-btn';
            localPill.style.borderColor = 'rgba(107, 33, 168, 0.4)';
            localPill.style.background = '#f3e8ff';
            localPill.style.color = '#6b21a8';
            cloudPill.style.borderColor = 'transparent';
            cloudPill.style.background = 'var(--ml-assistant-success-bg, #dff5eb)';
            cloudPill.style.color = 'var(--ml-assistant-success-text, #1d7b54)';
            sendBtn.className = 'mm-chatbot-send-btn';
        }
        else {
            geminiBtn.className = 'mm-chatbot-provider-btn active-gemini';
            ollamaBtn.className = 'mm-chatbot-provider-btn';
            cloudPill.style.borderColor = 'rgba(30, 64, 175, 0.4)';
            cloudPill.style.background = '#eff6ff';
            cloudPill.style.color = '#1e40af';
            localPill.style.borderColor = 'transparent';
            localPill.style.background = 'var(--ml-assistant-success-bg, #dff5eb)';
            localPill.style.color = 'var(--ml-assistant-success-text, #1d7b54)';
            sendBtn.className = 'mm-chatbot-send-btn gemini-mode';
        }
    }
    // Refresh status from server
    async function refreshPlatformStatus() {
        try {
            const keyStatus = await (0,_request__rspack_import_0.requestAPI)('api/settings/gemini-key', settings);
            if (keyStatus.configured) {
                cloudPill.classList.remove('offline');
                cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini configured';
            }
            else {
                cloudPill.classList.add('offline');
                cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini unconfigured';
            }
        }
        catch (_a) {
            cloudPill.classList.add('offline');
            cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini unavailable';
        }
        try {
            const ollama = await (0,_request__rspack_import_0.requestAPI)('api/local-ai/status', settings);
            if (ollama.status === 'connected' && ollama.model_status === 'available') {
                localPill.classList.remove('offline');
                localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)';
            }
            else {
                localPill.classList.add('offline');
                localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama offline';
            }
        }
        catch (_b) {
            localPill.classList.add('offline');
            localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama offline';
        }
        // Re-apply highlight to currently selected provider
        switchProvider(currentProvider);
    }
    void refreshPlatformStatus();
    window.addEventListener('modelmind:gemini-key-updated', () => {
        void refreshPlatformStatus();
    });
    ollamaBtn.addEventListener('click', () => switchProvider('ollama'));
    geminiBtn.addEventListener('click', () => switchProvider('gemini'));
    // Context chips
    codeChip.addEventListener('click', () => {
        const code = getActiveCode();
        if (code) {
            textarea.value += (textarea.value ? '\n' : '') + `\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``;
            adjustTextareaHeight();
            textarea.focus();
        }
    });
    errorChip.addEventListener('click', () => {
        const err = getActiveError();
        if (err) {
            const errText = `Error: ${err.error_type}: ${err.error_message}\n\`\`\`\n${err.traceback.slice(0, 1000)}\n\`\`\``;
            textarea.value += (textarea.value ? '\n' : '') + errText;
            adjustTextareaHeight();
            textarea.focus();
        }
    });
    function appendMessage(msg) {
        // Remove welcome screen on first message
        const welcomeEl = messagesArea.querySelector('.mm-chat-welcome');
        if (welcomeEl) {
            welcomeEl.remove();
        }
        const el = createMessageBubble(msg);
        messagesArea.appendChild(el);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        return el;
    }
    async function sendMessage() {
        const text = textarea.value.trim();
        if (!text || isTyping)
            return;
        isTyping = true;
        sendBtn.disabled = true;
        textarea.value = '';
        adjustTextareaHeight();
        // Add user message
        const userMsg = { role: 'user', content: text, timestamp: new Date() };
        messages.push(userMsg);
        appendMessage(userMsg);
        // Update history
        conversationHistory.push({ role: 'user', content: text });
        // Show typing indicator
        const typingMsg = { role: 'assistant', content: '', timestamp: new Date(), isStreaming: true };
        const typingEl = appendMessage(typingMsg);
        try {
            const result = await requestChatAPI(settings, {
                message: text,
                provider: currentProvider,
                history: conversationHistory.slice(-10), // last 5 exchanges
                context: {
                    active_code: getActiveCode().slice(0, 3000),
                }
            });
            typingEl.remove();
            if (result.status === 'replied' && result.reply) {
                const replyMsg = {
                    role: 'assistant',
                    content: result.reply,
                    provider: result.provider || currentProvider,
                    timestamp: new Date()
                };
                messages.push(replyMsg);
                appendMessage(replyMsg);
                conversationHistory.push({ role: 'assistant', content: result.reply });
            }
            else {
                conversationHistory.pop(); // Remove un-replied user message on error
                let errText = 'I could not respond right now.';
                if (result.status === 'model_missing') {
                    errText = '🦙 Ollama model not found. Please install it first via the AI Assistant.';
                }
                else if (result.status === 'ollama_unavailable') {
                    errText = '🦙 Ollama is not running. Start Ollama, or switch to Gemini.';
                }
                else if (result.status === 'gemini_unconfigured') {
                    errText =
                        '✨ Open the 🔑 API Key tab in the right sidebar to save your Gemini key.';
                }
                else if (result.status === 'gemini_unavailable') {
                    errText = result.message ? `✨ ${result.message}` : '✨ Gemini is temporarily unavailable. Try again or switch to Ollama.';
                }
                else if (result.message) {
                    errText = result.message;
                }
                const errMsg = {
                    role: 'assistant',
                    content: errText,
                    timestamp: new Date(),
                    isError: true
                };
                messages.push(errMsg);
                appendMessage(errMsg);
            }
        }
        catch (e) {
            typingEl.remove();
            conversationHistory.pop(); // Remove un-replied user message on error
            const errMsg = {
                role: 'assistant',
                content: '⚠️ Network error — could not reach the backend. Is the platform running?',
                timestamp: new Date(),
                isError: true
            };
            messages.push(errMsg);
            appendMessage(errMsg);
        }
        finally {
            isTyping = false;
            sendBtn.disabled = false;
            textarea.focus();
        }
    }
    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void sendMessage();
        }
    });
    // Update error chip visibility based on active error
    setInterval(() => {
        const err = getActiveError();
        errorChip.style.display = err ? 'inline-flex' : 'none';
    }, 2000);
    root.append(header, contextBar, messagesArea, inputArea);
    return root;
}


},
"./lib/api-key-settings.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createAPIKeySettingsWidget: () => (createAPIKeySettingsWidget)
});
/* import */ var _lumino_widgets__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@lumino/widgets");
/* import */ var _lumino_widgets__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__rspack_import_0);
/* import */ var _request__rspack_import_1 = __webpack_require__("./lib/request.js");


function createAPIKeySettingsWidget(settings, trans) {
    const widget = new _lumino_widgets__rspack_import_0.Widget();
    widget.id = 'mm-api-key-settings';
    widget.title.label = trans.__('API Key');
    widget.title.caption = trans.__('Manage Gemini credentials stored on this computer');
    widget.addClass('mm-api-key-settings-widget');
    const root = document.createElement('section');
    root.className = 'mm-key-settings';
    const header = document.createElement('header');
    header.className = 'mm-key-settings-header';
    const title = document.createElement('h2');
    title.textContent = 'API Key';
    const subtitle = document.createElement('p');
    subtitle.textContent =
        "Gemini credentials stay in your computer's credential store.";
    header.append(title, subtitle);
    const status = document.createElement('div');
    status.className = 'mm-key-settings-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Checking saved credentials...';
    const setStatus = (message, state = 'info') => {
        status.textContent = message;
        status.dataset.state = state;
    };
    const form = document.createElement('form');
    form.className = 'mm-key-settings-form';
    const label = document.createElement('label');
    label.htmlFor = 'mm-gemini-api-key';
    label.textContent = 'Google Gemini API key';
    const input = document.createElement('input');
    input.id = 'mm-gemini-api-key';
    input.type = 'password';
    input.name = 'api_key';
    input.autocomplete = 'new-password';
    input.maxLength = 512;
    input.placeholder = 'Paste your Gemini API key';
    input.required = true;
    input.setAttribute('aria-describedby', 'mm-key-settings-note');
    const actions = document.createElement('div');
    actions.className = 'mm-key-settings-actions';
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = 'Save key';
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove key';
    removeButton.disabled = true;
    actions.append(saveButton, removeButton);
    const note = document.createElement('p');
    note.id = 'mm-key-settings-note';
    note.className = 'mm-key-settings-note';
    note.textContent =
        'The key is never shown again after saving and is not written to a notebook or browser storage. It is stored on the machine running Jupyter Server, so only save it from a server you trust. Gemini requests send the selected code and error context to Google. Ollama stays local.';
    form.append(label, input, actions, note);
    root.append(header, status, form);
    widget.node.appendChild(root);
    const setBusy = (busy) => {
        input.disabled = busy;
        saveButton.disabled = busy;
        removeButton.disabled =
            busy || removeButton.dataset.source !== 'desktop';
    };
    const refreshStatus = async () => {
        try {
            const result = await (0,_request__rspack_import_1.requestAPI)('api/settings/gemini-key', settings);
            removeButton.dataset.source = result.source || '';
            removeButton.disabled = result.source !== 'desktop';
            input.disabled = false;
            saveButton.disabled = false;
            if (result.source === 'desktop') {
                setStatus('Your personal Gemini key is saved in this computer’s credential store.', 'success');
            }
            else if (result.source === 'environment') {
                setStatus('A server Gemini key is configured. Saving here will use your personal key instead.', 'info');
            }
            else {
                setStatus('No Gemini key saved on this computer.', 'warning');
            }
        }
        catch (_a) {
            setStatus('Could not read the system credential store. Check the Jupyter server log.', 'error');
            input.disabled = true;
            saveButton.disabled = true;
            removeButton.disabled = true;
        }
    };
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const apiKey = input.value.trim();
        if (!apiKey) {
            setStatus('Enter a Gemini API key before saving.', 'warning');
            input.focus();
            return;
        }
        setBusy(true);
        setStatus('Saving to the system credential store...');
        try {
            await (0,_request__rspack_import_1.requestAPI)('api/settings/gemini-key', settings, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: apiKey })
            });
            input.value = '';
            setStatus("Gemini key saved in this computer's credential store.", 'success');
            window.dispatchEvent(new Event('modelmind:gemini-key-updated'));
            await refreshStatus();
        }
        catch (_a) {
            setStatus('Could not save the key. Check that the system credential store is available.', 'error');
        }
        finally {
            setBusy(false);
        }
    });
    removeButton.addEventListener('click', async () => {
        setBusy(true);
        setStatus('Removing saved Gemini key...');
        try {
            await (0,_request__rspack_import_1.requestAPI)('api/settings/gemini-key', settings, {
                method: 'DELETE'
            });
            input.value = '';
            setStatus('Saved Gemini key removed.', 'success');
            window.dispatchEvent(new Event('modelmind:gemini-key-updated'));
            await refreshStatus();
        }
        catch (_a) {
            setStatus('Could not remove the key. Check that the system credential store is available.', 'error');
        }
        finally {
            setBusy(false);
        }
    });
    if (!document.getElementById('mm-key-settings-styles')) {
        const style = document.createElement('style');
        style.id = 'mm-key-settings-styles';
        style.textContent = `
      .mm-key-settings {
        box-sizing: border-box;
        width: 100%; min-width: 0; height: 100%;
        overflow-y: auto; padding: 18px 14px;
        color: #e2e8f0; background: #0f172a;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .mm-key-settings-header {
        margin: -18px -14px 16px; padding: 18px 14px 16px;
        background: linear-gradient(135deg, #1e1b4b, #0f172a);
        border-bottom: 1px solid rgba(167,139,250,.2);
      }
      .mm-key-settings-header h2 { margin: 0; color: #f1f5f9; font-size: 16px; }
      .mm-key-settings-header p, .mm-key-settings-note {
        color: #aab5c8; font-size: 11px; line-height: 1.6;
      }
      .mm-key-settings-header p { margin: 6px 0 0; }
      .mm-key-settings-status {
        box-sizing: border-box; width: 100%; padding: 10px;
        border: 1px solid rgba(167,139,250,.3);
        border-radius: 10px; color: #c4b5fd; background: rgba(30,27,75,.4);
        font-size: 12px; line-height: 1.5;
      }
      .mm-key-settings-status[data-state="success"] {
        border-color: rgba(167,139,250,.38); color: #c4b5fd;
        background: rgba(30,27,75,.48);
      }
      .mm-key-settings-status[data-state="warning"] {
        border-color: rgba(245,158,11,.35); color: #fcd34d;
        background: rgba(120,80,10,.16);
      }
      .mm-key-settings-status[data-state="error"] {
        border-color: rgba(248,113,113,.38); color: #fca5a5;
        background: rgba(127,29,29,.2);
      }
      .mm-key-settings-form { display: flex; flex-direction: column; gap: 9px; margin-top: 18px; }
      .mm-key-settings-form label { color: #dbe4f0; font-size: 11px; font-weight: 600; }
      .mm-key-settings-form input {
        box-sizing: border-box; width: 100%; min-width: 0; padding: 10px;
        border: 1px solid #334155; border-radius: 8px;
        outline: none; color: #f8fafc; background: #1e293b;
        font: inherit; font-size: 13px;
      }
      .mm-key-settings-form input:focus { border-color: #a78bfa; }
      .mm-key-settings-form input::placeholder { color: #aab5c8; opacity: 1; }
      .mm-key-settings-actions { display: flex; gap: 8px; }
      .mm-key-settings-actions button {
        box-sizing: border-box; min-width: 0; min-height: 38px; flex: 1;
        padding: 8px; border: 1px solid #5546a5; border-radius: 8px;
        color: #fff; background: #43358a; font: inherit; font-size: 12px;
        font-weight: 600; cursor: pointer;
      }
      .mm-key-settings-actions button:last-child {
        border-color: #475569; color: #cbd5e1; background: #1e293b;
      }
      .mm-key-settings-actions button:hover:not(:disabled) { filter: brightness(1.12); }
      .mm-key-settings-actions button:disabled { cursor: not-allowed; opacity: .5; }
      .mm-key-settings-note { margin: 2px 0 0; }
    `;
        document.head.appendChild(style);
    }
    void refreshStatus();
    return widget;
}


},
"./lib/debugger-tutor.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  closePanel: () => (closePanel),
  createFAB: () => (createFAB),
  createPanel: () => (createPanel),
  ensureStyles: () => (ensureStyles),
  loadTutorExplanation: () => (loadTutorExplanation),
  openPanel: () => (openPanel),
  renderResultInto: () => (renderResultInto),
  renderTutorInElement: () => (renderTutorInElement),
  showFABAlert: () => (showFABAlert),
  togglePanel: () => (togglePanel)
});
/* import */ var _request__rspack_import_0 = __webpack_require__("./lib/request.js");
/**
 * ModelMind — AI Debugger Tutor (Offline, Rule-based ML Error Assistant)
 * UI and UX match the ModelMind AI Assistant panel design system.
 */

let _panel = null;
let _overlay = null;
let _isOpen = false;
let _currentLevel = 'basic';
let _lastInput = null;
let _serverSettings = null;
function ensureStyles() {
    if (document.getElementById('mm-tutor-styles'))
        return;
    const style = document.createElement('style');
    style.id = 'mm-tutor-styles';
    style.textContent = `
    /* ── Overlay ── */
    #mm-tutor-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      z-index: 9998;
      opacity: 0; transition: opacity .25s ease;
      pointer-events: none; display: none;
    }
    #mm-tutor-overlay.open { opacity: 1; pointer-events: auto; display: block; }

    /* ── Panel — Unified with ModelMind AI Assistant ── */
    #mm-tutor-panel {
      position: fixed; right: 0; bottom: 0; top: 0; width: 420px; max-width: 96vw;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border-left: 1px solid var(--ml-assistant-border, #dfe3ea);
      z-index: 9999; overflow-y: auto; transform: translateX(100%);
      transition: transform .28s cubic-bezier(.4, 0, .2, 1);
      display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--ml-assistant-text, #253041);
      box-shadow: -6px 0 24px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.12));
    }
    #mm-tutor-panel.open { transform: translateX(0); }

    /* ── Header ── */
    #mm-tutor-header {
      padding: 14px 16px 12px;
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: #ffffff;
      position: sticky; top: 0; z-index: 2;
      display: flex; flex-direction: column; gap: 4px;
    }
    .mm-tutor-header-top {
      display: flex; align-items: center; justify-content: space-between;
    }
    #mm-tutor-header h2 {
      margin: 0; font-size: 15px; font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      display: flex; align-items: center; gap: 8px;
    }
    #mm-tutor-header .sub {
      font-size: 11px;
      color: var(--ml-assistant-muted, #5d6b80);
      font-weight: 500;
    }
    #mm-tutor-close {
      background: transparent;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      color: var(--ml-assistant-muted, #5d6b80);
      cursor: pointer; font-size: 16px; line-height: 1;
      padding: 4px 8px; border-radius: 6px;
      transition: all .15s ease;
    }
    #mm-tutor-close:hover {
      background: #f1f5f9;
      color: var(--ml-assistant-text, #253041);
      border-color: #cbd5e1;
    }

    /* ── Body ── */
    #mm-tutor-body, .mm-tutor-embedded-body {
      padding: 14px 16px; flex: 1;
      display: flex; flex-direction: column; gap: 10px;
    }

    /* ── Level Switcher Tabs (Basic / Medium / Advanced) ── */
    .mm-tutor-level-row {
      display: flex; gap: 6px;
      padding: 3px; background: #eaecf1;
      border-radius: 8px; margin-bottom: 6px;
    }
    .mm-tutor-level-btn {
      flex: 1; font-size: 12px; font-weight: 600; padding: 6px 10px;
      border-radius: 6px; cursor: pointer; text-align: center;
      border: none; background: transparent;
      color: var(--ml-assistant-muted, #5d6b80);
      transition: all .15s ease;
    }
    .mm-tutor-level-btn:hover {
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-level-btn.active {
      background: #ffffff;
      color: var(--ml-assistant-accent, #6d7cff);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      font-weight: 700;
    }

    /* ── Error Banner ── */
    .mm-tutor-error-banner {
      background: var(--ml-assistant-error-bg, #f7dfe3);
      border: 1px solid rgba(163, 61, 77, 0.25);
      border-radius: 8px;
      padding: 12px 14px;
    }
    .mm-tutor-error-banner .banner-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700;
      color: var(--ml-assistant-error-text, #a33d4d);
      margin-bottom: 3px;
    }
    .mm-tutor-error-banner .banner-type {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; font-weight: 700;
      color: #991b1b;
    }
    .mm-tutor-error-banner .banner-msg {
      font-size: 12px; color: #7f1d1d; margin-top: 4px; line-height: 1.4;
      word-break: break-word;
    }
    .mm-tutor-error-banner .banner-line {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; color: #b91c1c; margin-top: 6px;
      padding: 4px 8px; background: rgba(255,255,255,0.6);
      border-radius: 4px; overflow-x: auto;
    }

    /* ── Local Engine / Coverage Pill ── */
    .mm-tutor-coverage {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--ml-assistant-success-bg, #dff5eb);
      color: var(--ml-assistant-success-text, #1d7b54);
      border: 1px solid rgba(29, 123, 84, 0.2);
      border-radius: 6px; padding: 6px 10px;
      font-size: 11px; font-weight: 600;
    }
    .mm-tutor-coverage.mm-tutor-low-conf {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid rgba(180, 83, 9, 0.3);
    }
    .mm-tutor-withheld-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px; padding: 12px 14px;
      margin: 2px 0 6px;
    }
    .mm-tutor-withheld-box .withheld-title {
      font-size: 12px; font-weight: 700; color: #92400e;
      margin-bottom: 4px; display: flex; align-items: center; gap: 6px;
    }
    .mm-tutor-withheld-box .withheld-desc {
      font-size: 11.5px; color: #78350f; line-height: 1.5;
    }
    .mm-tutor-ask-ai-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; margin-top: 10px; padding: 9px 14px;
      background: var(--ml-assistant-accent, #6d7cff);
      color: #ffffff; border: none; border-radius: 6px;
      font-size: 12px; font-weight: 700; cursor: pointer;
      transition: all .15s ease;
      box-shadow: 0 2px 8px rgba(109, 124, 255, 0.35);
    }
    .mm-tutor-ask-ai-btn:hover {
      background: #5865f2;
      box-shadow: 0 4px 14px rgba(109, 124, 255, 0.5);
      transform: translateY(-1px);
    }

    /* ── Contextual Smart Hints ── */
    .mm-tutor-hint {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid rgba(109, 124, 255, 0.3);
      border-radius: 8px; padding: 10px 12px;
      font-size: 12px; color: #3730a3; line-height: 1.45;
    }

    /* ── Content Card (What / Why / How to fix) ── */
    .mm-tutor-section {
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px; padding: 12px 14px;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.04));
    }
    .mm-tutor-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
      color: var(--ml-assistant-muted, #5d6b80);
      margin-bottom: 6px; text-transform: uppercase;
    }
    .mm-tutor-section-content {
      font-size: 12.5px; color: var(--ml-assistant-text, #253041);
      line-height: 1.55;
    }

    /* ── Numbered Steps ── */
    .mm-tutor-step {
      display: flex; gap: 8px; margin-bottom: 6px;
      font-size: 12px; line-height: 1.5;
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-step-num {
      width: 18px; height: 18px; border-radius: 50%;
      background: var(--ml-assistant-accent-soft, #eef1ff);
      color: var(--ml-assistant-accent, #6d7cff);
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin-top: 1px; flex-shrink: 0;
    }

    /* ── Code Tip Block ── */
    .mm-tutor-code-wrap {
      position: relative; margin-top: 6px;
    }
    .mm-tutor-code-tip {
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 8px; padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11.5px; line-height: 1.6; color: #e2e8f0;
      overflow-x: auto; white-space: pre;
    }
    .mm-tutor-copy-btn {
      position: absolute; top: 8px; right: 8px;
      font-size: 10px; font-weight: 600; padding: 4px 9px;
      border-radius: 5px; cursor: pointer;
      background: #334155; border: 1px solid #475569; color: #f8fafc;
      transition: all .12s ease;
    }
    .mm-tutor-copy-btn:hover { background: #475569; }

    /* ── Empty State & Quick Presets ── */
    .mm-tutor-empty {
      background: #ffffff;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px; padding: 20px 16px; text-align: center;
    }
    .mm-tutor-empty h3 {
      margin: 8px 0 4px; font-size: 14px; font-weight: 700;
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-empty p {
      margin: 0 0 14px; font-size: 12px;
      color: var(--ml-assistant-muted, #5d6b80);
      line-height: 1.5;
    }
    .mm-tutor-preset-list {
      display: flex; flex-direction: column; gap: 6px;
      text-align: left; margin-top: 12px;
    }
    .mm-tutor-preset-btn {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 6px; padding: 8px 10px;
      font-size: 11.5px; font-weight: 600;
      color: var(--ml-assistant-text, #253041);
      cursor: pointer; transition: all .15s ease;
    }
    .mm-tutor-preset-btn:hover {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border-color: rgba(109, 124, 255, 0.35);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    /* ── FAB button ── */
    #mm-tutor-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 9997;
      width: 48px; height: 48px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #6d7cff 0%, #4f46e5 100%);
      color: #fff; font-size: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(109, 124, 255, 0.4);
      transition: transform .15s, box-shadow .15s;
    }
    #mm-tutor-fab:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(109, 124, 255, 0.6); }
    #mm-tutor-fab .badge {
      position: absolute; top: -2px; right: -2px; width: 15px; height: 15px;
      border-radius: 50%; background: #ef4444; font-size: 9px; font-weight: 800;
      display: none; align-items: center; justify-content: center; color: #fff;
    }
    #mm-tutor-fab .badge.show { display: flex; }
  `;
    document.head.appendChild(style);
}
function createPanel() {
    var _a;
    ensureStyles();
    if (!_overlay) {
        _overlay = document.createElement('div');
        _overlay.id = 'mm-tutor-overlay';
        _overlay.addEventListener('click', closePanel);
        document.body.appendChild(_overlay);
    }
    if (!_panel) {
        _panel = document.createElement('div');
        _panel.id = 'mm-tutor-panel';
        _panel.setAttribute('role', 'dialog');
        _panel.setAttribute('aria-label', 'AI Debugger Tutor');
        const hdr = document.createElement('div');
        hdr.id = 'mm-tutor-header';
        hdr.innerHTML = `
      <div class="mm-tutor-header-top">
        <h2>🎓 AI Debugger Tutor</h2>
        <button id="mm-tutor-close" aria-label="Close tutor panel">✕</button>
      </div>
      <div class="sub">100% Offline · No AI required · ~80% ML Error Coverage</div>
    `;
        (_a = hdr.querySelector('#mm-tutor-close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', closePanel);
        _panel.appendChild(hdr);
        const body = document.createElement('div');
        body.id = 'mm-tutor-body';
        renderEmptyState(body);
        _panel.appendChild(body);
        document.body.appendChild(_panel);
    }
}
function openPanel() {
    if (!_panel)
        createPanel();
    _panel.classList.add('open');
    _overlay === null || _overlay === void 0 ? void 0 : _overlay.classList.add('open');
    _isOpen = true;
}
function closePanel() {
    _panel === null || _panel === void 0 ? void 0 : _panel.classList.remove('open');
    _overlay === null || _overlay === void 0 ? void 0 : _overlay.classList.remove('open');
    _isOpen = false;
}
function togglePanel() {
    if (_isOpen)
        closePanel();
    else
        openPanel();
}
function createFAB(serverSettings) {
    _serverSettings = serverSettings;
    ensureStyles();
    if (!_panel)
        createPanel();
    if (document.getElementById('mm-tutor-fab'))
        return;
    const fab = document.createElement('button');
    fab.id = 'mm-tutor-fab';
    fab.title = 'AI Debugger Tutor (Offline ML Guidance)';
    fab.setAttribute('aria-label', 'Open AI Debugger Tutor');
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = '!';
    fab.innerHTML = `<span>🎓</span>`;
    fab.appendChild(badge);
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);
}
function showFABAlert() {
    var _a;
    const badge = (_a = document.getElementById('mm-tutor-fab')) === null || _a === void 0 ? void 0 : _a.querySelector('.badge');
    badge === null || badge === void 0 ? void 0 : badge.classList.add('show');
}
/**
 * Render empty state with 1-click test scenarios for user testing
 */
function renderEmptyState(container) {
    container.replaceChildren();
    const card = document.createElement('div');
    card.className = 'mm-tutor-empty';
    card.innerHTML = `
    <div style="font-size:32px">🎓</div>
    <h3>AI Debugger Tutor Ready</h3>
    <p>Run any failing notebook cell, and the Tutor will instantly explain what happened with <strong>Basic</strong>, <strong>Medium</strong>, and <strong>Advanced</strong> fixes — 100% offline.</p>
    <div class="mm-tutor-coverage">🔒 Local Engine · Zero API Latency · ~80% ML Coverage</div>
    <div class="mm-tutor-preset-list">
      <div style="font-size:11px;font-weight:700;color:#5d6b80;text-transform:uppercase;margin-bottom:2px">Try Example Scenarios:</div>
      <button type="button" class="mm-tutor-preset-btn" data-type="ValueError" data-msg="Input X contains NaN.">
        <span>⚡ NaN in Model Fit (ValueError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="KeyError" data-msg="KeyError: 'target'">
        <span>⚡ Missing Column 'target' (KeyError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="NameError" data-msg="name 'X_train' is not defined">
        <span>⚡ Undefined 'X_train' (NameError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="ValueError" data-msg="Found input variables with inconsistent numbers of samples: [100, 80]">
        <span>⚡ Shape Mismatch [100, 80] (ValueError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
    </div>
  `;
    card.querySelectorAll('.mm-tutor-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const error_type = btn.getAttribute('data-type') || 'ValueError';
            const error_message = btn.getAttribute('data-msg') || 'Error';
            if (_serverSettings) {
                void loadTutorExplanation({
                    error_type,
                    error_message,
                    traceback: `${error_type}: ${error_message}`,
                    code: 'model.fit(X_train, y_train)'
                }, _serverSettings, true);
            }
        });
    });
    container.appendChild(card);
}
/**
 * Render Tutor results into any container element (slide-out panel or AI Assistant tab)
 */
function renderResultInto(container, result, onLevelSwitch) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    container.replaceChildren();
    if (!result.handled) {
        const msg = document.createElement('div');
        msg.className = 'mm-tutor-empty';
        msg.innerHTML = `
      <div style="font-size:28px">🤔</div>
      <h3>Error Not Diagnosed</h3>
      <p>${(_a = result.error_message) !== null && _a !== void 0 ? _a : 'Could not automatically analyse this error offline.'}</p>
    `;
        container.appendChild(msg);
        return;
    }
    // 1. Level switcher (Basic / Medium / Advanced)
    const levelRow = document.createElement('div');
    levelRow.className = 'mm-tutor-level-row';
    ['basic', 'medium', 'advanced'].forEach(lvl => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `mm-tutor-level-btn${lvl === _currentLevel ? ' active' : ''}`;
        const levelLabels = {
            basic: '🐣 Basic Fix',
            medium: '⚡ Medium (M02)',
            advanced: '🚀 Pipeline (Adv)'
        };
        btn.textContent = levelLabels[lvl];
        btn.addEventListener('click', () => {
            _currentLevel = lvl;
            if (onLevelSwitch) {
                onLevelSwitch(lvl);
            }
            else if (_lastInput && _serverSettings) {
                void loadTutorExplanation(_lastInput, _serverSettings, true);
            }
        });
        levelRow.appendChild(btn);
    });
    container.appendChild(levelRow);
    // 2. Error banner
    const banner = document.createElement('div');
    banner.className = 'mm-tutor-error-banner';
    banner.innerHTML = `
    <div class="banner-title">
      <span style="font-size:16px">${(_b = result.icon) !== null && _b !== void 0 ? _b : '🐛'}</span>
      <span>${(_c = result.title) !== null && _c !== void 0 ? _c : 'Runtime Error'}</span>
    </div>
    <div class="banner-type">${(_d = result.error_type) !== null && _d !== void 0 ? _d : ''}</div>
    ${result.error_message ? `<div class="banner-msg">${result.error_message}</div>` : ''}
    ${result.failing_line ? `<div class="banner-line">→ ${result.failing_line}</div>` : ''}
  `;
    container.appendChild(banner);
    // 3. Local engine status & confidence pill (70% bound restriction)
    const isHighConf = result.can_suggest_code === true && ((_e = result.confidence) !== null && _e !== void 0 ? _e : 0) >= 70;
    const pill = document.createElement('div');
    pill.className = isHighConf ? 'mm-tutor-coverage' : 'mm-tutor-coverage mm-tutor-low-conf';
    pill.innerHTML = isHighConf
        ? `🟢 <strong>Confidence: ${(_f = result.confidence) !== null && _f !== void 0 ? _f : 85}%</strong> (≥70% High) · Level: <strong>${_currentLevel.toUpperCase()}</strong>`
        : `⚠️ <strong>Confidence: ${(_g = result.confidence) !== null && _g !== void 0 ? _g : 45}%</strong> (<70% Threshold) · Fix Code Withheld`;
    container.appendChild(pill);
    // If confidence is below 70%, show the reason why code suggestions are withheld and offer direct redirect to AI Assistant
    if (!isHighConf) {
        const withheldEl = document.createElement('div');
        withheldEl.className = 'mm-tutor-withheld-box';
        withheldEl.innerHTML = `
      <div class="withheld-title">🛡️ Code Fix Withheld (Confidence &lt; 70%)</div>
      <div class="withheld-desc">
        ${(_h = result.confidence_reason) !== null && _h !== void 0 ? _h : 'The exact root cause cannot be verified with ≥70% confidence. Automatic code generation is disabled to prevent recommending incorrect code. Follow the diagnostic steps below or ask the AI Assistant.'}
      </div>
      <button type="button" class="mm-tutor-ask-ai-btn">
        <span>🤖</span>
        <span>Ask AI Assistant for Full Diagnosis</span>
        <span>→</span>
      </button>
    `;
        const askBtn = withheldEl.querySelector('.mm-tutor-ask-ai-btn');
        askBtn === null || askBtn === void 0 ? void 0 : askBtn.addEventListener('click', () => {
            closePanel();
            window.dispatchEvent(new CustomEvent('modelmind:open-ai-assistant', {
                detail: { mode: 'explain', error: _lastInput }
            }));
        });
        container.appendChild(withheldEl);
    }
    // 4. Smart contextual ML hints
    if (result.smart_hints && result.smart_hints.length > 0) {
        result.smart_hints.forEach(h => {
            const hint = document.createElement('div');
            hint.className = 'mm-tutor-hint';
            hint.textContent = h;
            container.appendChild(hint);
        });
    }
    // 5. What happened
    if (result.what) {
        const sec = document.createElement('div');
        sec.className = 'mm-tutor-section';
        sec.innerHTML = `
      <div class="mm-tutor-section-label">What Happened</div>
      <div class="mm-tutor-section-content">${result.what}</div>
    `;
        container.appendChild(sec);
    }
    // 6. Why this happened
    if (result.why) {
        const sec = document.createElement('div');
        sec.className = 'mm-tutor-section';
        sec.innerHTML = `
      <div class="mm-tutor-section-label">Why This Happened</div>
      <div class="mm-tutor-section-content">${result.why}</div>
    `;
        container.appendChild(sec);
    }
    // 7. How to fix it (Numbered steps)
    if (result.steps && result.steps.length > 0) {
        const stepsEl = document.createElement('div');
        stepsEl.className = 'mm-tutor-section';
        stepsEl.innerHTML = `<div class="mm-tutor-section-label">${isHighConf ? `How To Fix It (${_currentLevel.toUpperCase()})` : 'Diagnostic Steps'}</div>`;
        result.steps.forEach((step, i) => {
            const row = document.createElement('div');
            row.className = 'mm-tutor-step';
            row.innerHTML = `<div class="mm-tutor-step-num">${i + 1}</div><div>${step}</div>`;
            stepsEl.appendChild(row);
        });
        container.appendChild(stepsEl);
    }
    // 8. Try this in a new cell (Code Tip) — ONLY when confidence >= 70%
    if (isHighConf && result.code_tip) {
        const tipSec = document.createElement('div');
        tipSec.className = 'mm-tutor-section';
        tipSec.innerHTML = `<div class="mm-tutor-section-label">Recommended Code Fix (${_currentLevel.toUpperCase()})</div>`;
        const wrap = document.createElement('div');
        wrap.className = 'mm-tutor-code-wrap';
        const pre = document.createElement('div');
        pre.className = 'mm-tutor-code-tip';
        pre.textContent = result.code_tip;
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'mm-tutor-copy-btn';
        copyBtn.textContent = 'Copy Code';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(result.code_tip);
                copyBtn.textContent = 'Copied!';
            }
            catch (_a) {
                copyBtn.textContent = 'Copied!';
            }
            setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 1800);
        });
        wrap.append(pre, copyBtn);
        tipSec.appendChild(wrap);
        container.appendChild(tipSec);
    }
    // 9. Note
    if (result.note) {
        const noteEl = document.createElement('div');
        noteEl.style.fontSize = '11px';
        noteEl.style.color = '#94a3b8';
        noteEl.style.padding = '4px 2px';
        noteEl.textContent = result.note;
        container.appendChild(noteEl);
    }
}
/**
 * Fetch tutor analysis from backend and render into the slide-out panel
 */
async function loadTutorExplanation(input, serverSettings, openWhenDone = false) {
    _lastInput = input;
    _serverSettings = serverSettings;
    ensureStyles();
    if (!_panel)
        createPanel();
    if (openWhenDone) {
        openPanel();
    }
    const body = _panel.querySelector('#mm-tutor-body');
    if (body) {
        body.replaceChildren();
        const loading = document.createElement('div');
        loading.style.textAlign = 'center';
        loading.style.padding = '30px 16px';
        loading.style.color = '#5d6b80';
        loading.innerHTML = `<div style="font-size:28px;margin-bottom:8px">⏳</div>Analysing with Local ML Engine…`;
        body.appendChild(loading);
    }
    try {
        const result = await (0,_request__rspack_import_0.requestAPI)('api/ai/tutor', serverSettings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error_type: input.error_type,
                error_message: input.error_message,
                traceback: input.traceback,
                code: input.code,
                level: _currentLevel,
            })
        });
        if (body) {
            renderResultInto(body, result);
        }
        showFABAlert();
    }
    catch (err) {
        if (body) {
            body.replaceChildren();
            const errEl = document.createElement('div');
            errEl.className = 'mm-tutor-empty';
            errEl.innerHTML = `<div style="font-size:24px;margin-bottom:8px">⚠️</div><div style="color:#ef4444">${err instanceof Error ? err.message : 'Tutor unavailable.'}</div>`;
            body.appendChild(errEl);
        }
    }
}
/**
 * Render Tutor explanation directly into an embedded container (e.g., inside the AI Assistant tab)
 */
async function renderTutorInElement(container, input, serverSettings) {
    _serverSettings = serverSettings;
    ensureStyles();
    if (!input) {
        renderEmptyState(container);
        return;
    }
    _lastInput = input;
    container.replaceChildren();
    const loading = document.createElement('div');
    loading.style.textAlign = 'center';
    loading.style.padding = '30px 16px';
    loading.style.color = '#5d6b80';
    loading.innerHTML = `<div style="font-size:28px;margin-bottom:8px">⏳</div>Analysing with Local ML Engine…`;
    container.appendChild(loading);
    try {
        const result = await (0,_request__rspack_import_0.requestAPI)('api/ai/tutor', serverSettings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error_type: input.error_type,
                error_message: input.error_message,
                traceback: input.traceback,
                code: input.code,
                level: _currentLevel,
            })
        });
        renderResultInto(container, result, (lvl) => {
            _currentLevel = lvl;
            void renderTutorInElement(container, input, serverSettings);
        });
    }
    catch (err) {
        container.replaceChildren();
        const errEl = document.createElement('div');
        errEl.className = 'mm-tutor-empty';
        errEl.innerHTML = `<div style="font-size:24px;margin-bottom:8px">⚠️</div><div style="color:#ef4444">${err instanceof Error ? err.message : 'Tutor unavailable.'}</div>`;
        container.appendChild(errEl);
    }
}


},
"./lib/fix-utils.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  applyFixToCellModel: () => (applyFixToCellModel)
});
function applyFixToCellModel(model, fixText) {
    const sharedModel = model === null || model === void 0 ? void 0 : model.sharedModel;
    const source = fixText.trim();
    if (!sharedModel || typeof sharedModel.setSource !== 'function' || !source) {
        return false;
    }
    sharedModel.setSource(source);
    return true;
}


},
"./lib/index.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": () => (__rspack_default_export)
});
/* import */ var _jupyterlab_cells__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/cells");
/* import */ var _jupyterlab_cells__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_cells__rspack_import_0);
/* import */ var _jupyterlab_mainmenu__rspack_import_1 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/mainmenu");
/* import */ var _jupyterlab_mainmenu__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_mainmenu__rspack_import_1);
/* import */ var _jupyterlab_notebook__rspack_import_2 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/notebook");
/* import */ var _jupyterlab_notebook__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_notebook__rspack_import_2);
/* import */ var _jupyterlab_translation__rspack_import_3 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/translation");
/* import */ var _jupyterlab_translation__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_translation__rspack_import_3);
/* import */ var _lumino_widgets__rspack_import_4 = __webpack_require__("webpack/sharing/consume/default/@lumino/widgets");
/* import */ var _lumino_widgets__rspack_import_4_default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__rspack_import_4);
/* import */ var _style_modelmind_logo_png__rspack_import_5 = __webpack_require__("./style/modelmind-logo.png");
/* import */ var _fix_utils__rspack_import_8 = __webpack_require__("./lib/fix-utils.js");
/* import */ var _request__rspack_import_6 = __webpack_require__("./lib/request.js");
/* import */ var _modelmind_studio__rspack_import_10 = __webpack_require__("./lib/modelmind-studio.js");
/* import */ var _debugger_tutor__rspack_import_7 = __webpack_require__("./lib/debugger-tutor.js");
/* import */ var _ai_chatbot__rspack_import_9 = __webpack_require__("./lib/ai-chatbot.js");
/* import */ var _api_key_settings__rspack_import_11 = __webpack_require__("./lib/api-key-settings.js");












const COMMAND_ID = '@ml-platform/error-assistant:open';
const MAX_CODE_LENGTH = 20000;
const MAX_TRACEBACK_LENGTH = 12000;
function setModelMindFavicon() {
    document.querySelectorAll('link[rel~="icon"]').forEach(link => {
        link.remove();
    });
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.setAttribute('sizes', '256x256');
    favicon.href = _style_modelmind_logo_png__rspack_import_5;
    document.head.appendChild(favicon);
}
function removeJupyterSplashOrbitAnimation() {
    const style = document.createElement('style');
    style.id = 'modelmind-splash-branding';
    style.textContent = `
    #jupyterlab-splash #moon1,
    #jupyterlab-splash #moon2,
    #jupyterlab-splash #moon3 {
      display: none !important;
      animation: none !important;
    }
  `;
    document.head.appendChild(style);
}
// Apply while the splash is visible, before JupyterLab activates plugins.
setModelMindFavicon();
removeJupyterSplashOrbitAnimation();
function getTargetCell(notebooks) {
    var _a, _b, _c;
    const active = (_c = (_a = notebooks.activeCell) !== null && _a !== void 0 ? _a : (_b = notebooks.currentWidget) === null || _b === void 0 ? void 0 : _b.content.activeCell) !== null && _c !== void 0 ? _c : null;
    if (active && captureActiveError(active)) {
        return active;
    }
    const currentWidget = notebooks.currentWidget;
    if (currentWidget) {
        const cells = currentWidget.content.widgets;
        for (let i = cells.length - 1; i >= 0; i--) {
            const cell = cells[i];
            if (cell && captureActiveError(cell)) {
                return cell;
            }
        }
    }
    return active;
}
function captureActiveError(cell) {
    if (!cell || !(0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(cell.model)) {
        return null;
    }
    let errorOutput;
    for (const output of cell.model.outputs.toJSON().reverse()) {
        if (isErrorOutput(output)) {
            errorOutput = output;
            break;
        }
    }
    if (!errorOutput) {
        return null;
    }
    const source = cell.model.toJSON().source;
    const code = Array.isArray(source) ? source.join('') : source;
    return {
        cell_id: cell.model.id.slice(0, 256),
        code: code.slice(0, MAX_CODE_LENGTH),
        error_type: errorOutput.ename.slice(0, 200),
        error_message: errorOutput.evalue.slice(0, 2000),
        traceback: errorOutput.traceback.join('\n').slice(0, MAX_TRACEBACK_LENGTH)
    };
}
function getAdjacentNotebookCode(notebook, targetCell) {
    const cells = notebook.content.widgets;
    const targetIndex = cells.indexOf(targetCell);
    if (targetIndex < 0) {
        return '';
    }
    return cells
        .slice(Math.max(0, targetIndex - 1), targetIndex + 2)
        .filter(cell => cell !== targetCell && (0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(cell.model))
        .map(cell => {
        const source = cell.model.toJSON().source;
        return Array.isArray(source) ? source.join('') : source;
    })
        .join('\n')
        .slice(0, 12000);
}
function isErrorOutput(output) {
    return (output.output_type === 'error' &&
        'ename' in output &&
        typeof output.ename === 'string' &&
        'evalue' in output &&
        typeof output.evalue === 'string' &&
        'traceback' in output &&
        Array.isArray(output.traceback) &&
        output.traceback.every((line) => typeof line === 'string'));
}
function createStatusPill(label, tone) {
    const pill = document.createElement('div');
    pill.className = `ml-assistant-status-pill ml-assistant-status-${tone}`;
    pill.textContent = label;
    return pill;
}
function renderAssistantResult(container, payload, fixActions, suggestImmediately = false) {
    container.replaceChildren();
    const header = document.createElement('div');
    header.className = 'ml-assistant-result-header';
    const banner = document.createElement('div');
    banner.className = 'ml-assistant-error-banner';
    const errorIcon = document.createElement('span');
    errorIcon.className = 'ml-assistant-error-icon';
    errorIcon.setAttribute('aria-hidden', 'true');
    errorIcon.textContent = '!';
    const errorText = document.createElement('div');
    errorText.className = 'ml-assistant-error-copy';
    const errorTitle = document.createElement('div');
    errorTitle.className = 'ml-assistant-error-title';
    errorTitle.textContent = payload.errorType;
    const errorMessage = document.createElement('div');
    errorMessage.className = 'ml-assistant-error-message';
    errorMessage.textContent = payload.errorMessage;
    errorText.append(errorTitle, errorMessage);
    banner.append(errorIcon, errorText);
    const traceback = document.createElement('div');
    traceback.className = 'ml-assistant-traceback';
    const tracebackDetails = document.createElement('details');
    const tracebackSummary = document.createElement('summary');
    tracebackSummary.textContent = 'View traceback';
    const tracebackContent = document.createElement('pre');
    tracebackContent.textContent = payload.traceback;
    tracebackDetails.append(tracebackSummary, tracebackContent);
    traceback.append(tracebackDetails);
    const explanation = document.createElement('div');
    explanation.className = 'ml-assistant-card ml-assistant-card-blue';
    const explanationTitle = document.createElement('div');
    explanationTitle.className = 'ml-assistant-card-title';
    explanationTitle.textContent = 'Explanation';
    const explanationSummary = document.createElement('p');
    explanationSummary.textContent = payload.summary;
    const explanationDetails = document.createElement('ul');
    payload.details.forEach(detail => {
        const item = document.createElement('li');
        item.textContent = detail;
        explanationDetails.appendChild(item);
    });
    explanation.append(explanationTitle, explanationSummary, explanationDetails);
    const fixCard = document.createElement('div');
    fixCard.className = 'ml-assistant-card ml-assistant-card-green';
    const fixTitle = document.createElement('div');
    fixTitle.className = 'ml-assistant-card-title';
    fixTitle.textContent = 'Possible solution';
    const fixSummary = document.createElement('p');
    fixSummary.textContent = payload.fix;
    const fixCode = document.createElement('div');
    fixCode.className = 'ml-assistant-code-block';
    fixCode.textContent = 'Generate a suggestion to see corrected code here.';
    let currentFix = null;
    fixCard.append(fixTitle, fixSummary, fixCode);
    const actions = document.createElement('div');
    actions.className = 'ml-assistant-actions';
    const suggestButton = document.createElement('button');
    suggestButton.type = 'button';
    suggestButton.textContent = 'Suggest Fix';
    suggestButton.disabled = !fixActions;
    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.textContent = 'Apply Fix';
    applyButton.disabled = !fixActions;
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy Code';
    copyButton.className = 'ml-assistant-secondary-button';
    const generateFix = async () => {
        if (!fixActions) {
            throw new Error('No fix action is available');
        }
        if (currentFix) {
            return currentFix;
        }
        suggestButton.disabled = true;
        applyButton.disabled = true;
        suggestButton.textContent = 'Generating...';
        try {
            currentFix = await fixActions.suggestFix();
            fixSummary.textContent =
                currentFix.provider === 'gemini'
                    ? `Gemini suggestion: ${currentFix.summary}`
                    : currentFix.summary;
            fixCode.textContent = currentFix.candidate_code;
            copyButton.disabled = false;
            return currentFix;
        }
        finally {
            suggestButton.textContent = 'Suggest Fix';
            suggestButton.disabled = false;
            applyButton.disabled = false;
        }
    };
    suggestButton.addEventListener('click', async () => {
        suggestButton.disabled = true;
        suggestButton.textContent = 'Generating...';
        try {
            await generateFix();
        }
        catch (error) {
            fixSummary.textContent =
                error instanceof Error ? error.message : 'Could not generate a fix';
        }
        finally {
            suggestButton.disabled = false;
            suggestButton.textContent = 'Suggest Fix';
        }
    });
    applyButton.addEventListener('click', async () => {
        if (!fixActions) {
            return;
        }
        applyButton.disabled = true;
        suggestButton.disabled = true;
        applyButton.textContent = currentFix ? 'Applying...' : 'Generating...';
        try {
            const fix = await generateFix();
            await fixActions.applyFix(fix);
            applyButton.textContent = 'Fixed and ran';
        }
        catch (error) {
            applyButton.textContent =
                error instanceof Error ? error.message : 'Could not apply fix';
        }
        finally {
            suggestButton.disabled = false;
        }
        window.setTimeout(() => {
            applyButton.textContent = 'Apply Fix';
            applyButton.disabled = false;
        }, 2500);
    });
    copyButton.addEventListener('click', async () => {
        if (!currentFix) {
            return;
        }
        try {
            await navigator.clipboard.writeText(currentFix.candidate_code);
            copyButton.textContent = 'Copied';
        }
        catch (_a) {
            copyButton.textContent = 'Copy failed';
        }
        window.setTimeout(() => {
            copyButton.textContent = 'Copy Code';
        }, 1200);
    });
    copyButton.disabled = true;
    suggestButton.classList.add('ml-assistant-action-wide');
    actions.append(suggestButton, applyButton, copyButton);
    header.append(banner, traceback);
    container.append(header, explanation, fixCard, actions);
    if (suggestImmediately && fixActions) {
        suggestButton.click();
    }
}
const plugin = {
    id: '@ml-platform/error-assistant:plugin',
    description: 'JupyterLab error assistant frontend and server extension',
    autoStart: true,
    requires: [_jupyterlab_mainmenu__rspack_import_1.IMainMenu, _jupyterlab_notebook__rspack_import_2.INotebookTracker, _jupyterlab_translation__rspack_import_3.ITranslator],
    activate: (app, mainMenu, notebooks, translator) => {
        const trans = translator.load('@ml-platform/error-assistant');
        const panel = new _lumino_widgets__rspack_import_4.Widget();
        panel.id = 'ml-platform-error-assistant-panel';
        panel.title.label = 'Error Assistant';
        panel.title.caption = 'Notebook error assistant';
        panel.addClass('ml-platform-error-assistant-panel');
        const shell = document.createElement('div');
        shell.className = 'ml-assistant-shell';
        const header = document.createElement('div');
        header.className = 'ml-assistant-header';
        const heading = document.createElement('h2');
        heading.textContent = 'AI Assistant';
        const controls = document.createElement('div');
        controls.className = 'ml-assistant-header-controls';
        const installButton = document.createElement('button');
        installButton.type = 'button';
        installButton.className = 'ml-assistant-primary-button';
        installButton.textContent = 'Install Ollama';
        installButton.disabled = true;
        const cloudOption = document.createElement('label');
        cloudOption.className = 'ml-assistant-cloud-option';
        cloudOption.title =
            'When enabled, the failed cell, traceback, and nearby code may be sent to Google Gemini, either directly or as a fallback.';
        const geminiFallbackToggle = document.createElement('input');
        geminiFallbackToggle.type = 'checkbox';
        geminiFallbackToggle.disabled = true;
        const cloudOptionText = document.createElement('span');
        cloudOptionText.textContent = 'Allow Gemini use';
        cloudOption.append(geminiFallbackToggle, cloudOptionText);
        const statusRow = document.createElement('div');
        statusRow.className = 'ml-assistant-status-row';
        const localStatus = createStatusPill('Ollama (Local AI)', 'success');
        const cloudStatus = createStatusPill('Cloud disabled', 'default');
        const providerRow = document.createElement('label');
        providerRow.className = 'ml-assistant-provider-row';
        providerRow.textContent = 'Fix provider';
        const providerSelect = document.createElement('select');
        providerSelect.className = 'ml-assistant-provider-select';
        const ollamaOption = document.createElement('option');
        ollamaOption.value = 'ollama';
        ollamaOption.textContent = 'Ollama (local)';
        const geminiOption = document.createElement('option');
        geminiOption.value = 'gemini';
        geminiOption.textContent = 'Gemini (cloud)';
        providerSelect.append(ollamaOption, geminiOption);
        providerRow.appendChild(providerSelect);
        const tabRow = document.createElement('div');
        tabRow.className = 'ml-assistant-tab-row';
        const tabs = ['Explain Error', 'Suggest Fix', 'Code Help', 'Ask AI'];
        const tabButtons = new Map();
        tabs.forEach((tabText, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `ml-assistant-tab ${index === 0 ? 'active' : ''}`;
            btn.textContent = tabText;
            tabRow.appendChild(btn);
            tabButtons.set(tabText, btn);
        });
        // Error tracking
        let _lastCapturedError = null;
        const ctaWrap = document.createElement('div');
        ctaWrap.className = 'ml-assistant-cta-row';
        const captureButton = document.createElement('button');
        captureButton.type = 'button';
        captureButton.className = 'ml-assistant-cta-button';
        captureButton.textContent = 'Analyze Error';
        ctaWrap.appendChild(captureButton);
        const content = document.createElement('div');
        content.className = 'ml-assistant-content';
        const makePlaceholder = () => {
            const empty = document.createElement('div');
            empty.className = 'ml-assistant-empty';
            empty.textContent = 'Select a failed code cell to capture its error.';
            return empty;
        };
        let analysisMode = 'explain';
        let ollamaConnected = false;
        content.appendChild(makePlaceholder());
        header.append(heading, controls);
        controls.append(installButton, cloudOption);
        statusRow.append(localStatus, cloudStatus);
        shell.append(header, statusRow, providerRow, tabRow, ctaWrap, content);
        panel.node.append(shell);
        const setStatus = async () => {
            try {
                const health = await (0,_request__rspack_import_6.requestAPI)('api/health', app.serviceManager.serverSettings);
                localStatus.textContent =
                    health.status === 'ok' ? 'Ollama (Local AI)' : 'Platform unavailable';
                localStatus.className =
                    health.status === 'ok'
                        ? 'ml-assistant-status-pill ml-assistant-status-success'
                        : 'ml-assistant-status-pill ml-assistant-status-warn';
                geminiFallbackToggle.disabled = !health.gemini_fallback_available;
                geminiOption.disabled = !health.gemini_fallback_available;
                if (geminiOption.disabled && providerSelect.value === 'gemini') {
                    providerSelect.value = 'ollama';
                }
                cloudStatus.textContent = health.gemini_fallback_available
                    ? 'Gemini available (opt-in)'
                    : health.cloud_fallback === 'enabled'
                        ? 'Gemini API key missing'
                        : 'Cloud disabled by server';
                cloudStatus.className = health.gemini_fallback_available
                    ? 'ml-assistant-status-pill ml-assistant-status-success'
                    : 'ml-assistant-status-pill ml-assistant-status-default';
            }
            catch (_a) {
                localStatus.textContent = 'Platform unavailable';
                localStatus.className =
                    'ml-assistant-status-pill ml-assistant-status-warn';
                geminiFallbackToggle.disabled = true;
                cloudStatus.textContent = 'Cloud status unavailable';
                cloudStatus.className =
                    'ml-assistant-status-pill ml-assistant-status-warn';
            }
            try {
                const ollama = await (0,_request__rspack_import_6.requestAPI)('api/local-ai/status', app.serviceManager.serverSettings);
                if (ollama.status === 'connected' &&
                    ollama.model_status === 'available') {
                    ollamaConnected = true;
                    localStatus.textContent = 'Ollama (Local AI)';
                    localStatus.className =
                        'ml-assistant-status-pill ml-assistant-status-success';
                    installButton.textContent = 'Model ready';
                    installButton.disabled = true;
                }
                else if (ollama.status === 'connected') {
                    ollamaConnected = true;
                    localStatus.textContent = 'Model missing';
                    localStatus.className =
                        'ml-assistant-status-pill ml-assistant-status-warn';
                    installButton.textContent = 'Install recommended model';
                    installButton.disabled = false;
                }
                else {
                    ollamaConnected = false;
                    localStatus.textContent = 'Ollama not detected';
                    localStatus.className =
                        'ml-assistant-status-pill ml-assistant-status-warn';
                    installButton.textContent = 'Get Ollama';
                    installButton.disabled = false;
                }
            }
            catch (_b) {
                ollamaConnected = false;
                localStatus.textContent = 'Local AI unavailable';
                localStatus.className =
                    'ml-assistant-status-pill ml-assistant-status-warn';
                installButton.textContent = 'Get Ollama';
                installButton.disabled = false;
            }
        };
        captureButton.addEventListener('click', async () => {
            const targetCell = getTargetCell(notebooks);
            const notebookPanel = notebooks.currentWidget;
            const error = captureActiveError(targetCell);
            if (!error) {
                renderAssistantResult(content, {
                    errorType: 'No error detected',
                    errorMessage: 'The active code cell has no error output.',
                    traceback: 'No traceback available.',
                    summary: 'Select a cell that produced an actual runtime error.',
                    details: ['The selected cell is not currently failing.'],
                    fix: 'print("Select a failing cell and retry.")'
                });
                return;
            }
            content.innerHTML = '';
            captureButton.disabled = true;
            const loading = document.createElement('div');
            loading.className = 'ml-assistant-empty';
            loading.textContent = 'Capturing error...';
            content.appendChild(loading);
            // ── Also auto-trigger the Tutor for every error ──
            if (error) {
                _lastCapturedError = error;
                void (0,_debugger_tutor__rspack_import_7.loadTutorExplanation)({
                    error_type: error.error_type,
                    error_message: error.error_message,
                    traceback: error.traceback,
                    code: error.code,
                }, app.serviceManager.serverSettings);
            }
            try {
                const result = await (0,_request__rspack_import_6.requestAPI)('api/error/analyze', app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(error)
                });
                if (result.status !== 'analyzed') {
                    throw new Error('analysis unavailable');
                }
                let explanationSummary = result.analysis.summary;
                let explanationDetails = result.analysis.details;
                const suggestFix = async () => {
                    if (!targetCell || !notebookPanel) {
                        throw new Error('Select a notebook cell first');
                    }
                    const suggestion = await (0,_request__rspack_import_6.requestAPI)('api/ai/fix', app.serviceManager.serverSettings, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            error,
                            notebook_context: getAdjacentNotebookCode(notebookPanel, targetCell),
                            provider: providerSelect.value,
                            allow_gemini_fallback: geminiFallbackToggle.checked
                        })
                    });
                    if (suggestion.status !== 'suggested' || !suggestion.candidate_code) {
                        throw new Error(suggestion.message ||
                            (suggestion.status === 'gemini_disabled'
                                ? 'Gemini fallback is disabled by server policy'
                                : suggestion.status === 'gemini_opt_in_required'
                                    ? 'Check Allow Gemini use before selecting Gemini'
                                    : suggestion.status === 'gemini_unconfigured'
                                        ? 'Save a Gemini API key in JupyterLab using the API Key tab in the right sidebar'
                                        : suggestion.status === 'gemini_unavailable'
                                            ? 'Gemini is temporarily unavailable; try again later'
                                            : suggestion.status === 'model_missing'
                                                ? `Install ${suggestion.model_id || 'the local Ollama model'} first`
                                                : suggestion.status === 'incomplete_model_response' ||
                                                    suggestion.status === 'incomplete_gemini_response'
                                                    ? 'The AI returned only part of the cell. Nothing was applied; try again or enable Gemini fallback.'
                                                    : 'Neither local Ollama nor the enabled Gemini fallback produced a valid fix'));
                    }
                    return {
                        summary: suggestion.summary || 'A fix candidate is ready.',
                        candidate_code: suggestion.candidate_code,
                        provider: suggestion.provider || 'ollama'
                    };
                };
                const applyFix = async (suggestion) => {
                    if (!targetCell || !notebookPanel) {
                        throw new Error('Select a notebook cell first');
                    }
                    if (!(0,_fix_utils__rspack_import_8.applyFixToCellModel)(targetCell.model, suggestion.candidate_code)) {
                        throw new Error('Could not update the failed cell');
                    }
                    const executed = await _jupyterlab_notebook__rspack_import_2.NotebookActions.runCells(notebookPanel.content, [targetCell], notebookPanel.sessionContext);
                    if (!executed) {
                        throw new Error('Fix applied; cell could not be run');
                    }
                    if (!(0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(targetCell.model) ||
                        targetCell.model.outputs.toJSON().some(isErrorOutput)) {
                        throw new Error('Fix applied, but the cell still reports an error');
                    }
                };
                const fixActions = { suggestFix, applyFix };
                if (result.analysis.is_sufficient) {
                    renderAssistantResult(content, {
                        errorType: error.error_type,
                        errorMessage: error.error_message,
                        traceback: error.traceback,
                        summary: explanationSummary,
                        details: explanationDetails,
                        fix: 'A corrected cell will be generated locally when you apply the fix.'
                    }, fixActions, analysisMode === 'suggest');
                    return;
                }
                const explanation = await (0,_request__rspack_import_6.requestAPI)('api/ai/explain', app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(error)
                });
                if (explanation.status === 'explained' && explanation.explanation) {
                    explanationSummary = explanation.explanation.summary;
                    explanationDetails = explanation.explanation.details;
                }
                renderAssistantResult(content, {
                    errorType: error.error_type,
                    errorMessage: error.error_message,
                    traceback: error.traceback,
                    summary: explanationSummary,
                    details: explanationDetails,
                    fix: 'A corrected cell will be generated locally when you apply the fix.'
                }, fixActions, analysisMode === 'suggest');
            }
            catch (_a) {
                renderAssistantResult(content, {
                    errorType: 'Error analysis unavailable',
                    errorMessage: 'The platform could not diagnose this error.',
                    traceback: 'The backend returned no valid analysis.',
                    summary: 'The local platform could not validate the notebook error.',
                    details: ['Check the notebook output and retry the analysis.'],
                    fix: 'print("Review the failing cell and confirm the variable or column exists.")'
                });
            }
            finally {
                captureButton.disabled = false;
            }
        });
        const showCodeHelp = () => {
            const targetCell = getTargetCell(notebooks);
            if (!targetCell || !(0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(targetCell.model)) {
                const message = document.createElement('div');
                message.className = 'ml-assistant-empty';
                message.textContent =
                    'Select a code cell to ask local Ollama about it.';
                content.replaceChildren(message);
                return;
            }
            const source = targetCell.model.toJSON().source;
            const code = (Array.isArray(source) ? source.join('') : source).slice(0, MAX_CODE_LENGTH);
            const notebookPanel = notebooks.currentWidget;
            const questionInput = document.createElement('textarea');
            questionInput.className = 'ml-assistant-question-input';
            questionInput.maxLength = 1000;
            questionInput.value = 'Explain this cell and point out potential issues.';
            const questionLabel = document.createElement('label');
            questionLabel.className = 'ml-assistant-question-label';
            questionLabel.textContent = 'Ask a question about this cell';
            questionLabel.appendChild(questionInput);
            const askButton = document.createElement('button');
            askButton.type = 'button';
            askButton.className = 'ml-assistant-cta-button';
            askButton.textContent = 'Ask Local Ollama';
            const answer = document.createElement('div');
            answer.className = 'ml-assistant-code-help-answer';
            content.replaceChildren(questionLabel, askButton, answer);
            askButton.addEventListener('click', async () => {
                const question = questionInput.value.trim();
                if (!question) {
                    answer.textContent = 'Enter a question about this code first.';
                    return;
                }
                askButton.disabled = true;
                answer.textContent = 'Asking local Ollama...';
                try {
                    const result = await (0,_request__rspack_import_6.requestAPI)('api/ai/code-help', app.serviceManager.serverSettings, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code,
                            question,
                            notebook_context: notebookPanel && targetCell
                                ? getAdjacentNotebookCode(notebookPanel, targetCell)
                                : ''
                        })
                    });
                    answer.replaceChildren();
                    if (result.status !== 'explained' || !result.explanation) {
                        answer.textContent =
                            result.status === 'model_missing'
                                ? `Install ${result.model_id || 'the local Ollama model'} first.`
                                : 'Local Ollama could not answer this code question.';
                        return;
                    }
                    const summary = document.createElement('p');
                    summary.textContent = result.explanation.summary;
                    const details = document.createElement('ul');
                    result.explanation.details.forEach(detail => {
                        const item = document.createElement('li');
                        item.textContent = detail;
                        details.appendChild(item);
                    });
                    answer.append(summary, details);
                }
                catch (_a) {
                    answer.textContent = 'Local code help is unavailable right now.';
                }
                finally {
                    askButton.disabled = false;
                }
            });
        };
        tabButtons.forEach((tabButton, tabText) => {
            tabButton.addEventListener('click', () => {
                tabButtons.forEach(button => button.classList.remove('active'));
                tabButton.classList.add('active');
                if (tabText === 'Code Help' || tabText === 'Ask AI') {
                    analysisMode = 'explain';
                    showCodeHelp();
                    return;
                }
                analysisMode = tabText === 'Suggest Fix' ? 'suggest' : 'explain';
                void captureButton.click();
            });
        });
        installButton.addEventListener('click', async () => {
            if (!ollamaConnected) {
                window.open('https://ollama.com/download', '_blank', 'noopener,noreferrer');
                return;
            }
            installButton.disabled = true;
            try {
                const result = await (0,_request__rspack_import_6.requestAPI)('api/local-ai/install', app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ allow_download: true })
                });
                if (result.status === 'installed') {
                    await setStatus();
                    renderAssistantResult(content, {
                        errorType: 'Model installed',
                        errorMessage: result.message || 'Local model ready',
                        traceback: 'Installation completed successfully.',
                        summary: 'The recommended local model is available for notebook error explanations.',
                        details: ['The local Ollama path is now active.'],
                        fix: 'print("Model ready. Re-run the failing cell to explain the error.")'
                    });
                    return;
                }
                renderAssistantResult(content, {
                    errorType: 'Local model installation failed',
                    errorMessage: result.message || 'The recommended Ollama model could not be installed.',
                    traceback: 'No notebook code was sent to a cloud service.',
                    summary: 'ModelMind could not finish downloading the local model.',
                    details: [
                        'Check that Ollama is running and that this computer has an internet connection.',
                        'Retry after resolving the issue; the model is not installed until Ollama confirms it.'
                    ],
                    fix: 'Restart Ollama and retry the model installation.'
                });
            }
            catch (error) {
                renderAssistantResult(content, {
                    errorType: 'Local model installation failed',
                    errorMessage: error instanceof Error ? error.message : 'The local model request failed.',
                    traceback: 'No notebook code was sent to a cloud service.',
                    summary: 'ModelMind could not finish downloading the local model.',
                    details: ['Check the local Jupyter server and Ollama status, then retry.'],
                    fix: 'Restart the local ModelMind services and retry.'
                });
            }
            finally {
                await setStatus();
            }
        });
        app.shell.add(panel, 'right', { rank: 900 });
        // ── Redirect listener: switch to AI Assistant when requested by Tutor (<70% confidence) ──
        window.addEventListener('modelmind:open-ai-assistant', (e) => {
            var _a;
            app.shell.activateById(panel.id);
            const mode = ((_a = e === null || e === void 0 ? void 0 : e.detail) === null || _a === void 0 ? void 0 : _a.mode) === 'suggest' ? 'Suggest Fix' : 'Explain Error';
            const targetTab = tabButtons.get(mode) || tabButtons.get('Explain Error');
            if (targetTab) {
                targetTab.click();
            }
            else {
                void captureButton.click();
            }
        });
        // ── Initialise the AI Debugger Tutor FAB (bottom-right slide panel) ──
        (0,_debugger_tutor__rspack_import_7.createFAB)(app.serviceManager.serverSettings);
        // ═══════════════════════════════════════════════════════════
        // RIGHT SIDEBAR — AI Chatbot Panel
        // ═══════════════════════════════════════════════════════════
        const chatbotWidget = new _lumino_widgets__rspack_import_4.Widget();
        chatbotWidget.id = 'mm-ai-chatbot-panel';
        chatbotWidget.title.label = '💬 AI Chat';
        chatbotWidget.title.caption = 'AI Chatbot — powered by Ollama & Gemini';
        chatbotWidget.addClass('mm-chatbot-widget');
        // Context getters: provide live notebook context to chatbot
        const getActiveCodeForChat = () => {
            const cell = getTargetCell(notebooks);
            if (!cell || !(0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(cell.model))
                return '';
            const src = cell.model.toJSON().source;
            return (Array.isArray(src) ? src.join('') : src).slice(0, MAX_CODE_LENGTH);
        };
        const getActiveErrorForChat = () => {
            const cell = getTargetCell(notebooks);
            return captureActiveError(cell) || _lastCapturedError;
        };
        const chatbotRoot = (0,_ai_chatbot__rspack_import_9.createAIChatbotPanel)(app.serviceManager.serverSettings, getActiveCodeForChat, getActiveErrorForChat);
        chatbotWidget.node.style.cssText = 'height:100%;overflow:hidden;';
        chatbotWidget.node.appendChild(chatbotRoot);
        app.shell.add(chatbotWidget, 'right', { rank: 800 });
        // ═══════════════════════════════════════════════════════════
        // AUTO-TRIGGER: Fire the Tutor immediately when any cell fails
        // No click required — the moment a cell produces an error,
        // the Tutor panel opens and explains it automatically.
        // ═══════════════════════════════════════════════════════════
        _jupyterlab_notebook__rspack_import_2.NotebookActions.executed.connect((_, args) => {
            const { cell, success } = args;
            if (success)
                return; // only handle failures
            setTimeout(() => {
                const error = captureActiveError(cell);
                if (error) {
                    _lastCapturedError = error;
                    void (0,_debugger_tutor__rspack_import_7.loadTutorExplanation)({
                        error_type: error.error_type,
                        error_message: error.error_message,
                        traceback: error.traceback,
                        code: error.code,
                    }, app.serviceManager.serverSettings);
                }
            }, 75);
        });
        // ═══════════════════════════════════════════════════════════
        // LEFT SIDEBAR — Unified ModelMind Studio Panel (Single Slide Bar)
        // ═══════════════════════════════════════════════════════════
        const studioWidget = (0,_modelmind_studio__rspack_import_10.createModelMindStudioWidget)(app, notebooks);
        app.shell.add(studioWidget, 'left', { rank: 300 });
        const apiKeyWidget = (0,_api_key_settings__rspack_import_11.createAPIKeySettingsWidget)(app.serviceManager.serverSettings, trans);
        apiKeyWidget.title.label = '🔑 API Key';
        apiKeyWidget.title.caption = trans.__('Save Gemini credentials in this computer’s credential store');
        app.shell.add(apiKeyWidget, 'right', { rank: 700 });
        const STUDIO_COMMAND = 'modelmind:open-studio';
        app.commands.addCommand(STUDIO_COMMAND, {
            label: 'Open ModelMind Studio',
            caption: 'Open the unified ModelMind ML Studio slide bar in the left panel',
            execute: () => {
                app.shell.activateById(studioWidget.id);
            }
        });
        mainMenu.viewMenu.addGroup([{ command: STUDIO_COMMAND }], 899);
        // ─── Inject CSS for all left panels ───
        if (!document.getElementById('mm-left-panel-styles')) {
            const s = document.createElement('style');
            s.id = 'mm-left-panel-styles';
            s.textContent = `
        /* Sidebar icon SVG stubs */
        .mm-sidebar-icon { background-size: 16px; background-repeat: no-repeat; background-position: center; }
        .mm-icon-xray::before  { content: '🔬'; font-size:16px; }
        .mm-icon-prep::before  { content: '🧠'; font-size:16px; }
        .mm-icon-lab::before   { content: '⚗️'; font-size:16px; }

        .mm-left-panel { overflow: hidden; }
        .mm-left-panel-root {
          height: 100%; overflow-y: auto; padding: 0;
          background: #0f172a; color: #e2e8f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
          display: flex; flex-direction: column;
        }

        .mm-left-panel-header {
          padding: 14px 14px 10px;
          background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
          border-bottom: 1px solid rgba(167,139,250,.2);
          flex-shrink: 0;
        }
        .mm-left-panel-title {
          font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 6px;
          background: linear-gradient(90deg, #a78bfa, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mm-left-panel-sub { font-size: 10px; opacity: .5; margin-top: 3px; }

        .mm-left-panel-input-wrap {
          padding: 10px 12px 6px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
        }
        .mm-left-panel-input {
          background: #1e293b; border: 1px solid rgba(255,255,255,.12);
          color: #e2e8f0; padding: 7px 10px; border-radius: 7px; font-size: 11px;
          outline: none; width: 100%;
        }
        .mm-left-panel-input:focus { border-color: #a78bfa; }
        .mm-left-panel-note {
          padding: 0 12px 6px; font-size: 10px; opacity: .4; flex-shrink: 0;
        }
        .mm-left-panel-btn {
          padding: 8px 14px; border-radius: 7px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; width: 100%; transition: all .15s;
        }
        .mm-btn-primary { background: linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff; }
        .mm-btn-primary:hover { opacity:.85; transform:translateY(-1px); }

        .mm-left-level-row {
          display: flex; gap: 5px; padding: 4px 12px 8px; flex-shrink: 0;
        }
        .mm-level-btn {
          flex: 1; padding: 4px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,.12);
          background: transparent; color: #94a3b8; font-size: 10px; cursor: pointer;
          transition: all .15s;
        }
        .mm-level-btn.active {
          border-color: #a78bfa; background: rgba(167,139,250,.18); color: #a78bfa; font-weight: 700;
        }

        .mm-left-panel-content {
          flex: 1; overflow-y: auto; padding: 8px 10px;
        }
        .mm-left-empty {
          text-align: center; opacity: .45; font-size: 12px; padding: 20px 0;
        }

        /* Model Lab cards */
        .mm-model-card {
          margin: 8px 10px; border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px; padding: 12px;
          background: rgba(255,255,255,.03); transition: all .2s;
        }
        .mm-model-card:not(.mm-model-soon):hover {
          border-color: rgba(167,139,250,.4); background: rgba(167,139,250,.07);
        }
        .mm-model-soon { opacity: .45; }
        .mm-model-card-top {
          display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;
        }
        .mm-model-icon { font-size: 18px; }
        .mm-model-name { font-size: 12px; font-weight: 700; }
        .mm-model-cat { font-size: 9px; opacity: .5; letter-spacing:.5px; margin-top: 2px; }
        .mm-model-desc { font-size: 11px; opacity: .65; line-height: 1.4; }
        .mm-soon-tag {
          display: inline-block; font-size: 8px; padding: 1px 5px; border-radius: 99px;
          background: rgba(100,116,139,.2); color: #94a3b8; vertical-align: middle; margin-left: 4px;
        }
      `;
            document.head.appendChild(s);
        }
        app.commands.addCommand(COMMAND_ID, {
            label: 'Open Error Assistant',
            execute: () => {
                app.shell.activateById(panel.id);
                void setStatus();
            }
        });
        const helpMenu = mainMenu.helpMenu;
        mainMenu.viewMenu.addGroup([{ command: COMMAND_ID }], 900);
        helpMenu.hide();
        void setStatus();
        // ── Setup Left Sidebar Section Names for the 5 tabs ──
        setupLeftSidebarSectionLabels();
    }
};
/**
 * Enhances the JupyterLab left activity bar tabs with clear, readable section names
 * so new users immediately know where to upload datasets, find ML Studio, etc.
 */
function setupLeftSidebarSectionLabels() {
    const SECTIONS = [
        {
            match: (id, title) => id === 'filebrowser' || title.toLowerCase().includes('file browser'),
            shortName: 'Upload / Files',
            fullName: 'Upload Dataset & Files',
            description: 'Upload CSV, Excel datasets & manage notebook files'
        },
        {
            match: (id, title) => id === 'jp-running-sessions' || title.toLowerCase().includes('running'),
            shortName: 'Running',
            fullName: 'Active Kernels & Sessions',
            description: 'Monitor active kernels, terminals & running sessions'
        },
        {
            match: (id, title) => id.includes('modelmind') || title.toLowerCase().includes('modelmind'),
            shortName: 'ML Studio',
            fullName: 'ModelMind ML Studio & Preprocessing',
            description: 'Dataset Intelligence, Preprocessing Advisor & Model Selection'
        },
        {
            match: (id, title) => id.includes('api-key') || title.toLowerCase().includes('api key'),
            shortName: 'API Key',
            fullName: 'ModelMind API Key Settings',
            description: 'Store Gemini credentials in the computer’s credential store'
        },
        {
            match: (id, title) => id === 'table-of-contents' || title.toLowerCase().includes('table of contents') || title.toLowerCase().includes('outline'),
            shortName: 'Outline',
            fullName: 'Notebook Outline',
            description: 'Table of contents, markdown headers & notebook outline'
        },
        {
            match: (id, title) => id.includes('extension') || title.toLowerCase().includes('extension'),
            shortName: 'Extensions',
            fullName: 'Extensions & Tools',
            description: 'Manage JupyterLab extensions and platform plugins'
        }
    ];
    let isUpdating = false;
    const updateTabs = () => {
        if (isUpdating)
            return;
        isUpdating = true;
        try {
            const tabs = document.querySelectorAll('.jp-SideBar.jp-mod-left .lm-TabBar-tab');
            if (!tabs || tabs.length === 0)
                return;
            tabs.forEach(tab => {
                const dataId = tab.getAttribute('data-id') || '';
                const tabTitle = tab.getAttribute('title') || '';
                const matched = SECTIONS.find(s => s.match(dataId, tabTitle));
                if (!matched)
                    return;
                // Set informative title attribute only once
                const expectedTitle = `${matched.fullName} — ${matched.description}`;
                if (tab.title !== expectedTitle) {
                    tab.title = expectedTitle;
                }
                // Check or create our custom label element
                let labelEl = tab.querySelector('.mm-sidebar-tab-label');
                if (!labelEl) {
                    labelEl = document.createElement('div');
                    labelEl.className = 'mm-sidebar-tab-label';
                    tab.appendChild(labelEl);
                }
                if (labelEl.textContent !== matched.shortName) {
                    labelEl.textContent = matched.shortName;
                }
                // Hide default rotated label if present
                const luminoLabel = tab.querySelector('.lm-TabBar-tabLabel');
                if (luminoLabel && luminoLabel.style.display !== 'none') {
                    luminoLabel.style.display = 'none';
                }
            });
        }
        finally {
            isUpdating = false;
        }
    };
    // Run on startup and staggered intervals
    updateTabs();
    const intervals = [100, 300, 700, 1500, 3000, 5000];
    intervals.forEach(ms => setTimeout(updateTabs, ms));
    // Observe ONLY direct child additions on the tab bar content list (NO attributes, NO subtree)
    const tabContentList = document.querySelector('.jp-SideBar.jp-mod-left .lm-TabBar-content');
    if (tabContentList) {
        const observer = new MutationObserver(() => updateTabs());
        observer.observe(tabContentList, { childList: true });
    }
    else {
        setTimeout(() => {
            const lateList = document.querySelector('.jp-SideBar.jp-mod-left .lm-TabBar-content');
            if (lateList) {
                const observer = new MutationObserver(() => updateTabs());
                observer.observe(lateList, { childList: true });
            }
        }, 1000);
    }
}
/* export default */ const __rspack_default_export = (plugin);


},
"./lib/model-code-utils.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  applyTunedModelCode: () => (applyTunedModelCode),
  normalizeModelName: () => (normalizeModelName),
  removeModelAdvisorRaiseGuards: () => (removeModelAdvisorRaiseGuards),
  resetTunedModelCode: () => (resetTunedModelCode)
});
function parenthesisDelta(line) {
    let depth = 0;
    let quote = null;
    let escaped = false;
    for (const character of line) {
        if (quote) {
            if (escaped) {
                escaped = false;
            }
            else if (character === '\\') {
                escaped = true;
            }
            else if (character === quote) {
                quote = null;
            }
            continue;
        }
        if (character === '"' || character === "'") {
            quote = character;
        }
        else if (character === '(') {
            depth += 1;
        }
        else if (character === ')') {
            depth -= 1;
        }
    }
    return depth;
}
function getRaiseStatementEnd(lines, start) {
    let depth = 0;
    for (let index = start; index < lines.length; index += 1) {
        depth += parenthesisDelta(lines[index]);
        if (depth <= 0) {
            return index;
        }
    }
    return lines.length - 1;
}
function removeModelAdvisorRaiseGuards(code) {
    var _a;
    const lines = code.split('\n');
    const result = [];
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const conditional = line.match(/^(\s*)if\b.*:\s*$/);
        const raiseIndex = index + 1;
        const raiseLine = lines[raiseIndex];
        const raiseIndent = raiseLine === null || raiseLine === void 0 ? void 0 : raiseLine.match(/^(\s*)raise\b/);
        if (conditional &&
            raiseIndent &&
            raiseIndent[1].length > conditional[1].length) {
            index = getRaiseStatementEnd(lines, raiseIndex);
            continue;
        }
        if (raiseIndent) {
            let previousLine = result.length - 1;
            while (previousLine >= 0 && !result[previousLine].trim()) {
                previousLine -= 1;
            }
            const previousConditional = (_a = result[previousLine]) === null || _a === void 0 ? void 0 : _a.match(/^(\s*)if\b.*:\s*$/);
            if (previousConditional &&
                previousConditional[1].length < raiseIndent[1].length) {
                result.splice(previousLine);
            }
            index = getRaiseStatementEnd(lines, index);
            continue;
        }
        result.push(line);
    }
    return result.join('\n').replace(/\n{3,}/g, '\n\n');
}
function normalizeModelName(name) {
    return name
        .toLowerCase()
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/regressor$/, 'regression')
        .replace(/classifier$/, 'classification');
}
function resetTunedModelCode(models) {
    models.forEach(model => {
        var _a;
        model.code = model.defaultCode;
        delete model.tuned_code;
        model.code_available = Boolean(model.defaultCode);
        model.tuned_configuration_applied = false;
        delete model.tuned_params;
        delete model.tuned_changes;
        delete model.tuned_score;
        delete model.tuned_code_error;
        (_a = model.refreshCode) === null || _a === void 0 ? void 0 : _a.call(model);
    });
}
function applyTunedModelCode(models, results) {
    if (!Array.isArray(results)) {
        return { updated: 0, errors: [] };
    }
    let updated = 0;
    const errors = [];
    results.forEach(result => {
        var _a, _b, _c;
        if (!result || typeof result !== 'object') {
            return;
        }
        const item = result;
        if (typeof item.model !== 'string') {
            return;
        }
        const itemModelName = item.model.trim();
        const itemNorm = normalizeModelName(itemModelName);
        // Exact match first, then normalized and abbreviation matching
        const model = models.find(candidate => {
            if (candidate.name === itemModelName)
                return true;
            const candidateNorm = normalizeModelName(candidate.name);
            if (candidateNorm === itemNorm)
                return true;
            // SVM / SVR matching
            if ((itemNorm.includes('svr') || itemNorm.includes('supportvectorreg')) &&
                (candidateNorm.includes('svr') || candidateNorm.includes('supportvectorreg'))) {
                return true;
            }
            if ((itemNorm.includes('svm') || itemNorm.includes('supportvector')) &&
                (candidateNorm.includes('svm') || candidateNorm.includes('supportvector'))) {
                return true;
            }
            return false;
        });
        if (!model) {
            return;
        }
        if (typeof item.code === 'string' && item.code.trim()) {
            // IMPORTANT: Do NOT overwrite model.code — it is the baseline used by the
            // "Insert into Notebook" button. Only store tuned code in model.tuned_code.
            model.tuned_code = item.code;
            model.code_available = true;
            model.tuned_configuration_applied = true;
            model.tuned_params =
                item.best_params && typeof item.best_params === 'object' && !Array.isArray(item.best_params)
                    ? item.best_params
                    : undefined;
            model.tuned_changes = Array.isArray(item.recommended_changes)
                ? item.recommended_changes
                : undefined;
            const scoreVal = (_b = (_a = item.best_score) !== null && _a !== void 0 ? _a : item.mean_score) !== null && _b !== void 0 ? _b : item.score;
            model.tuned_score = typeof scoreVal === 'number' ? scoreVal : undefined;
            delete model.tuned_code_error;
            (_c = model.refreshCode) === null || _c === void 0 ? void 0 : _c.call(model);
            updated += 1;
        }
        else if (typeof item.code_error === 'string') {
            model.tuned_code_error = item.code_error;
            errors.push(`${model.name}: ${item.code_error}`);
        }
    });
    return { updated, errors };
}


},
"./lib/modelmind-studio.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ModelMindStudioWidget: () => (ModelMindStudioWidget),
  createModelMindStudioWidget: () => (createModelMindStudioWidget)
});
/* import */ var _lumino_widgets__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@lumino/widgets");
/* import */ var _lumino_widgets__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__rspack_import_0);
/* import */ var _jupyterlab_cells__rspack_import_1 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/cells");
/* import */ var _jupyterlab_cells__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_cells__rspack_import_1);
/* import */ var _request__rspack_import_2 = __webpack_require__("./lib/request.js");
/* import */ var _model_code_utils__rspack_import_4 = __webpack_require__("./lib/model-code-utils.js");
/* import */ var _preprocessing_code_utils__rspack_import_3 = __webpack_require__("./lib/preprocessing-code-utils.js");
/**
 * ModelMind Studio — Unified Left Sidebar Panel
 *
 * Combines all ModelMind ML Intelligence features into a single slide bar:
 *  1. 🔬 Dataset X-Ray (Overview, Health, Preview, Column Stats)
 *  2. 🎯 Target Analyzer (ML Task Detection, Class Balance, Regression Stats)
 *  3. 📊 Feature Analyzer (Distribution Plots, Cardinality, Stats)
 *  4. 🧠 Smart Preprocessing Adviser 2.0 (Recommendations, Live Preview, Apply & Undo, Code Gen)
 *  5. ⚗️ Model Visualization Lab (Interactive Gradient Descent, Decision Tree, KNN, K-Means, PCA)
 *  6. ⚠️ ML Inspector (Static AST Data Leakage & Methodology Checker)
 *  7. 📖 Preprocessing & ML Guide (Educational Best Practices)
 */





class ModelMindStudioWidget extends _lumino_widgets__rspack_import_0.Widget {
    constructor(app, notebooks) {
        super();
        this._activeTab = 'xray';
        this._currentPath = '50_Startups.csv';
        this._resolvedDatasetPath = '';
        this._dataset = null;
        this._prepLevel = 'basic';
        this._targetCol = '';
        this._featureCol = '';
        this._tabButtons = new Map();
        this._app = app;
        this._notebooks = notebooks;
        this.id = 'modelmind-studio-sidebar';
        this.title.caption = 'ModelMind Studio';
        this.title.iconClass = 'mm-sidebar-icon mm-icon-modelmind';
        this.addClass('mm-modelmind-panel');
        this._root = document.createElement('div');
        this._root.className = 'mm-studio-root';
        this.node.appendChild(this._root);
        this._buildHeader();
        this._buildTabs();
        this._buildContentArea();
        this._bindNotebookTracker();
        // Auto-load initial dataset if present
        setTimeout(() => {
            void this._loadDataset(this._currentPath);
        }, 100);
    }
    // ═════════════════════════════════════════════════════════════════
    // HEADER & DATASET SELECTOR
    // ═════════════════════════════════════════════════════════════════
    _buildHeader() {
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-header';
        const brand = document.createElement('div');
        brand.className = 'mm-studio-brand';
        brand.innerHTML = `
      <div class="mm-studio-logo">◈</div>
      <div class="mm-studio-title-box">
        <div class="mm-studio-title">ModelMind Studio</div>
        <div class="mm-studio-sub">AI ML Intelligence & Laboratory</div>
      </div>
    `;
        // Dataset Path Row
        const pathWrap = document.createElement('div');
        pathWrap.className = 'mm-studio-path-wrap';
        const inputRow = document.createElement('div');
        inputRow.className = 'mm-studio-input-row';
        this._pathInput = document.createElement('input');
        this._pathInput.type = 'text';
        this._pathInput.className = 'mm-studio-input';
        this._pathInput.placeholder = 'e.g. 50_Startups.csv';
        this._pathInput.value = this._currentPath;
        const loadBtn = document.createElement('button');
        loadBtn.type = 'button';
        loadBtn.className = 'mm-studio-btn mm-btn-primary';
        loadBtn.innerHTML = '🔍 Analyze';
        loadBtn.title = 'Analyze Dataset';
        loadBtn.addEventListener('click', () => {
            const p = this._pathInput.value.trim();
            if (p)
                void this._loadDataset(p);
        });
        inputRow.append(this._pathInput, loadBtn);
        // Quick Select Samples / Auto-detect helper
        const quickRow = document.createElement('div');
        quickRow.className = 'mm-studio-quick-row';
        const autoBtn = document.createElement('button');
        autoBtn.type = 'button';
        autoBtn.className = 'mm-studio-quick-pill';
        autoBtn.innerHTML = '⚡ Auto-Detect';
        autoBtn.title = 'Detect dataset from open notebook cell';
        autoBtn.addEventListener('click', () => this._autoDetectDataset());
        const s1 = document.createElement('button');
        s1.type = 'button';
        s1.className = 'mm-studio-quick-pill';
        s1.textContent = '50_Startups.csv';
        s1.addEventListener('click', () => {
            this._pathInput.value = '50_Startups.csv';
            void this._loadDataset('50_Startups.csv');
        });
        const s2 = document.createElement('button');
        s2.type = 'button';
        s2.className = 'mm-studio-quick-pill';
        s2.textContent = 'test_dataset.csv';
        s2.addEventListener('click', () => {
            this._pathInput.value = 'test_dataset.csv';
            void this._loadDataset('test_dataset.csv');
        });
        quickRow.append(autoBtn, s1, s2);
        this._statusPill = document.createElement('div');
        this._statusPill.className = 'mm-studio-status-pill';
        this._statusPill.textContent = 'Ready to analyze';
        pathWrap.append(inputRow, quickRow, this._statusPill);
        hdr.append(brand, pathWrap);
        this._root.appendChild(hdr);
    }
    // ═════════════════════════════════════════════════════════════════
    // SLIDE BAR TABS
    // ═════════════════════════════════════════════════════════════════
    _buildTabs() {
        this._tabRow = document.createElement('div');
        this._tabRow.className = 'mm-studio-tab-bar';
        const tabsConfig = [
            { id: 'xray', label: '🔬 X-Ray' },
            { id: 'target', label: '🎯 Target' },
            { id: 'feature', label: '📊 Feature' },
            { id: 'prep', label: '🧠 Preprocessing' },
            { id: 'model-advisor', label: '🤖 Model Advisor' },
            { id: 'lab', label: '⚗️ Model Lab' },
            { id: 'inspector', label: '⚠️ ML Inspector' },
            { id: 'guide', label: '📖 Guide' },
        ];
        tabsConfig.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `mm-studio-tab ${t.id === this._activeTab ? 'active' : ''}`;
            btn.textContent = t.label;
            btn.addEventListener('click', () => {
                this._activeTab = t.id;
                this._tabButtons.forEach((b, k) => {
                    b.classList.toggle('active', k === t.id);
                });
                this._renderCurrentTab();
            });
            this._tabRow.appendChild(btn);
            this._tabButtons.set(t.id, btn);
        });
        this._root.appendChild(this._tabRow);
    }
    _buildContentArea() {
        this._contentArea = document.createElement('div');
        this._contentArea.className = 'mm-studio-content';
        this._root.appendChild(this._contentArea);
    }
    _bindNotebookTracker() {
        this._notebooks.activeCellChanged.connect(() => {
            const cell = this._notebooks.activeCell;
            if (!cell || !(0,_jupyterlab_cells__rspack_import_1.isCodeCellModel)(cell.model))
                return;
            const src = cell.model.toJSON().source;
            const code = Array.isArray(src) ? src.join('') : src;
            const match = code.match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);
            if (match) {
                const found = match[1];
                if (found && found !== this._currentPath) {
                    this._pathInput.value = found;
                }
            }
        });
    }
    _autoDetectDataset() {
        const cell = this._notebooks.activeCell;
        if (!cell || !(0,_jupyterlab_cells__rspack_import_1.isCodeCellModel)(cell.model)) {
            this._showToast('Select a notebook cell containing dataset path.');
            return;
        }
        const src = cell.model.toJSON().source;
        const code = Array.isArray(src) ? src.join('') : src;
        const match = code.match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);
        if (match) {
            this._pathInput.value = match[1];
            void this._loadDataset(match[1]);
            this._showToast(`Auto-detected: ${match[1]}`);
        }
        else {
            this._showToast('No .csv/.xlsx/.json found in active cell.');
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // DATA LOAD & API CALLS
    // ═════════════════════════════════════════════════════════════════
    async _loadDataset(path) {
        var _a, _b, _c;
        this._currentPath = path;
        this._statusPill.textContent = '⏳ Analyzing dataset...';
        this._statusPill.className = 'mm-studio-status-pill loading';
        try {
            const res = await (0,_request__rspack_import_2.requestAPI)('api/dataset/xray', this._app.serviceManager.serverSettings, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_path: path })
            });
            this._dataset = res;
            if (!res.supported) {
                this._statusPill.textContent = `❌ ${res.message || 'Dataset not supported'}`;
                this._statusPill.className = 'mm-studio-status-pill error';
                this._renderError(res.message || 'Dataset format not supported.');
                return;
            }
            const rows = (_a = res.rows) !== null && _a !== void 0 ? _a : 0;
            const cols = (_b = res.columns) !== null && _b !== void 0 ? _b : 0;
            const miss = (_c = res.total_missing_values) !== null && _c !== void 0 ? _c : 0;
            this._statusPill.textContent = `✓ ${res.filename || path}: ${rows} rows × ${cols} cols • ${miss} missing`;
            this._statusPill.className = 'mm-studio-status-pill success';
            // Set default target & feature column
            if (res.column_names && res.column_names.length > 0) {
                if (!this._targetCol || !res.column_names.includes(this._targetCol)) {
                    this._targetCol = res.column_names[res.column_names.length - 1];
                }
                if (!this._featureCol || !res.column_names.includes(this._featureCol)) {
                    this._featureCol = res.column_names[0];
                }
            }
            this._renderCurrentTab();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load dataset';
            this._statusPill.textContent = `❌ Error: ${msg}`;
            this._statusPill.className = 'mm-studio-status-pill error';
            this._renderError(msg);
        }
    }
    _renderError(msg) {
        this._contentArea.replaceChildren();
        const errBox = document.createElement('div');
        errBox.className = 'mm-studio-card mm-card-error';
        errBox.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:6px;">⚠️ Dataset Error</div>
      <div style="font-size:11px; opacity:.9;">${msg}</div>
      <div style="font-size:10px; opacity:.6; margin-top:8px;">Ensure the file exists in the workspace. Supported: .csv, .xlsx, .json</div>
    `;
        this._contentArea.appendChild(errBox);
    }
    _renderCurrentTab() {
        this._contentArea.replaceChildren();
        switch (this._activeTab) {
            case 'xray':
                this._renderXRayTab();
                break;
            case 'target':
                this._renderTargetTab();
                break;
            case 'feature':
                this._renderFeatureTab();
                break;
            case 'prep':
                this._renderPreprocessingTab();
                break;
            case 'model-advisor':
                this._renderModelAdvisorTab();
                break;
            case 'lab':
                this._renderModelLabTab();
                break;
            case 'inspector':
                this._renderInspectorTab();
                break;
            case 'guide':
                this._renderGuideTab();
                break;
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 1: 🔬 DATASET X-RAY
    // ═════════════════════════════════════════════════════════════════
    _renderXRayTab() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Enter a dataset file path above and click 🔍 Analyze.</div>';
            return;
        }
        const d = this._dataset;
        const frag = document.createDocumentFragment();
        // 1. Health Grid
        const healthSec = document.createElement('div');
        healthSec.className = 'mm-studio-section';
        healthSec.innerHTML = `<div class="mm-studio-sec-title"><span>🔬</span> Dataset Health Profile</div>`;
        const grid = document.createElement('div');
        grid.className = 'mm-studio-stats-grid';
        const numCols = (_b = (_a = d.numeric_columns) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        const catCols = (_d = (_c = d.categorical_columns) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
        const miss = (_e = d.total_missing_values) !== null && _e !== void 0 ? _e : 0;
        const dups = (_f = d.duplicate_rows) !== null && _f !== void 0 ? _f : 0;
        grid.appendChild(this._createStatCard('Rows', (_g = d.rows) !== null && _g !== void 0 ? _g : 0));
        grid.appendChild(this._createStatCard('Columns', `${(_h = d.columns) !== null && _h !== void 0 ? _h : 0} (${numCols}N / ${catCols}C)`));
        grid.appendChild(this._createStatCard('Missing', miss, miss > 0 ? 'warn' : 'ok'));
        grid.appendChild(this._createStatCard('Duplicates', dups, dups > 0 ? 'warn' : 'ok'));
        healthSec.appendChild(grid);
        // Likely ID columns warning
        if (d.likely_id_columns && d.likely_id_columns.length > 0) {
            const idWarn = document.createElement('div');
            idWarn.className = 'mm-studio-alert mm-alert-warning';
            idWarn.innerHTML = `⚠️ <b>Likely ID Column(s):</b> ${d.likely_id_columns.join(', ')} — These should not be used as training features.`;
            healthSec.appendChild(idWarn);
        }
        frag.appendChild(healthSec);
        // 2. Missing Values Breakdown
        if (d.missing_values && Object.keys(d.missing_values).length > 0) {
            const missEntries = Object.entries(d.missing_values).filter(([, c]) => c > 0);
            if (missEntries.length > 0) {
                const missSec = document.createElement('div');
                missSec.className = 'mm-studio-section';
                missSec.innerHTML = `<div class="mm-studio-sec-title"><span>⚠️</span> Missing Values Breakdown</div>`;
                missEntries.forEach(([col, count]) => {
                    const pct = d.rows ? Math.round((count / d.rows) * 100) : 0;
                    const barRow = document.createElement('div');
                    barRow.className = 'mm-studio-bar-row';
                    barRow.innerHTML = `
            <div class="mm-studio-bar-label">
              <span>${col}</span>
              <span class="mm-studio-bar-val">${count} (${pct}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${pct}%; background:#f87171;"></div>
            </div>
          `;
                    missSec.appendChild(barRow);
                });
                frag.appendChild(missSec);
            }
        }
        // 3. Data Preview Table
        if (d.preview && d.preview.length > 0) {
            const prevSec = document.createElement('div');
            prevSec.className = 'mm-studio-section';
            prevSec.innerHTML = `<div class="mm-studio-sec-title"><span>👁️</span> Data Preview (First 5 Rows)</div>`;
            const tableWrap = document.createElement('div');
            tableWrap.className = 'mm-studio-table-wrap';
            const table = document.createElement('table');
            table.className = 'mm-studio-table';
            const cols = d.column_names || Object.keys(d.preview[0] || {});
            const thead = document.createElement('thead');
            const trh = document.createElement('tr');
            cols.forEach(col => {
                var _a;
                const th = document.createElement('th');
                const dt = ((_a = d.dtypes) === null || _a === void 0 ? void 0 : _a[col]) || '';
                th.innerHTML = `<div>${col}</div><span class="mm-th-dtype">${dt}</span>`;
                trh.appendChild(th);
            });
            thead.appendChild(trh);
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            d.preview.slice(0, 5).forEach((row, i) => {
                const tr = document.createElement('tr');
                cols.forEach(col => {
                    const td = document.createElement('td');
                    const val = row[col];
                    td.textContent = val !== null && val !== undefined ? String(val) : '—';
                    if (val === null || val === undefined)
                        td.style.color = '#ef4444';
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            tableWrap.appendChild(table);
            prevSec.appendChild(tableWrap);
            frag.appendChild(prevSec);
        }
        // 4. Column Statistics
        if (d.column_stats && d.column_stats.length > 0) {
            const statsSec = document.createElement('div');
            statsSec.className = 'mm-studio-section';
            statsSec.innerHTML = `<div class="mm-studio-sec-title"><span>📋</span> Column Statistics</div>`;
            d.column_stats.forEach(cs => {
                var _a;
                const row = document.createElement('div');
                row.className = 'mm-studio-col-card';
                row.innerHTML = `
          <div class="mm-studio-col-hdr">
            <span class="mm-studio-col-name">${cs.name}</span>
            <span class="mm-studio-badge ${cs.is_numeric ? 'badge-num' : 'badge-cat'}">${cs.dtype}</span>
          </div>
          <div class="mm-studio-col-meta">
            <span>Missing: <b>${cs.missing_count} (${cs.missing_pct}%)</b></span>
            <span>Unique: <b>${cs.unique_count}</b></span>
            ${cs.is_numeric && cs.mean !== undefined ? `<span>Mean: <b>${cs.mean.toFixed(2)}</b></span>` : ''}
            ${cs.is_numeric && cs.min !== undefined ? `<span>Min/Max: <b>${cs.min.toFixed(1)} / ${(_a = cs.max) === null || _a === void 0 ? void 0 : _a.toFixed(1)}</b></span>` : ''}
          </div>
        `;
                statsSec.appendChild(row);
            });
            frag.appendChild(statsSec);
        }
        this._contentArea.appendChild(frag);
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 2: 🎯 TARGET ANALYZER & TARGET HEALTH
    // ═════════════════════════════════════════════════════════════════
    _renderTargetTab() {
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to use Target Intelligence.</div>';
            return;
        }
        const frag = document.createDocumentFragment();
        const pickerSec = document.createElement('div');
        pickerSec.className = 'mm-studio-section';
        pickerSec.innerHTML = `
      <div class="mm-studio-sec-title"><span>🎯</span> Target Variable Analyzer</div>
      <div class="mm-studio-sec-sub">Select the dependent variable you want your ML model to predict.</div>
    `;
        const selectRow = document.createElement('div');
        selectRow.className = 'mm-studio-select-row';
        const select = document.createElement('select');
        select.className = 'mm-studio-select';
        (this._dataset.column_names || []).forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            if (col === this._targetCol)
                opt.selected = true;
            select.appendChild(opt);
        });
        const analyzeBtn = document.createElement('button');
        analyzeBtn.type = 'button';
        analyzeBtn.className = 'mm-studio-btn mm-btn-primary';
        analyzeBtn.textContent = '🎯 Inspect Target';
        selectRow.append(select, analyzeBtn);
        pickerSec.appendChild(selectRow);
        frag.appendChild(pickerSec);
        const targetResultDiv = document.createElement('div');
        targetResultDiv.className = 'mm-studio-target-result';
        frag.appendChild(targetResultDiv);
        const runTargetAnalysis = async (col) => {
            this._targetCol = col;
            targetResultDiv.innerHTML = '<div class="mm-studio-loading">Analyzing target health...</div>';
            try {
                const res = await (0,_request__rspack_import_2.requestAPI)('api/dataset/target', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file_path: this._currentPath, target_column: col })
                });
                this._displayTargetResult(targetResultDiv, res);
            }
            catch (err) {
                targetResultDiv.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Target analysis failed.'}</div>`;
            }
        };
        analyzeBtn.addEventListener('click', () => runTargetAnalysis(select.value));
        select.addEventListener('change', () => runTargetAnalysis(select.value));
        this._contentArea.appendChild(frag);
        if (this._targetCol) {
            void runTargetAnalysis(this._targetCol);
        }
    }
    _displayTargetResult(container, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        container.replaceChildren();
        // 1. Task Badge & Health summary
        const card = document.createElement('div');
        card.className = 'mm-studio-card';
        const taskColor = res.task === 'classification' ? '#4f46e5' : '#059669';
        card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${res.target_column || res.target || this._targetCol || 'Target'}</span>
        <span class="mm-studio-badge" style="background:${res.task === 'classification' ? '#eef2ff' : '#ecfdf5'}; color:${taskColor}; border:1px solid ${res.task === 'classification' ? '#c7d2fe' : '#a7f3d0'}; font-size:11px; font-weight:700;">
          ${(res.task_type || res.task || 'ML').toUpperCase()} TASK
        </span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${res.unique_count}</div><div class="mm-stat-lbl">Unique Values</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" style="color:${((_a = res.missing_count) !== null && _a !== void 0 ? _a : 0) > 0 ? '#dc2626' : '#059669'}">${(_b = res.missing_count) !== null && _b !== void 0 ? _b : 0}</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.dtype}</div><div class="mm-stat-lbl">Data Type</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.is_imbalanced ? 'Imbalanced' : 'Healthy'}</div><div class="mm-stat-lbl">Target Health</div></div>
      </div>
    `;
        // Missing target warning
        if (((_c = res.missing_count) !== null && _c !== void 0 ? _c : 0) > 0) {
            const missWarn = document.createElement('div');
            missWarn.className = 'mm-studio-alert mm-alert-error';
            missWarn.style.marginTop = '10px';
            missWarn.innerHTML = `❌ <b>Critical:</b> Target variable has ${res.missing_count} missing values. Supervised models cannot train on missing targets. Drop these rows before fitting.`;
            card.appendChild(missWarn);
        }
        container.appendChild(card);
        // 2. Classification Health (Class Distribution & Imbalance)
        if (res.task === 'classification') {
            const classSec = document.createElement('div');
            classSec.className = 'mm-studio-section';
            classSec.innerHTML = `<div class="mm-studio-sec-title"><span>⚖️</span> Class Distribution & Imbalance</div>`;
            const encodingNotice = document.createElement('div');
            encodingNotice.className = 'mm-studio-alert mm-alert-info';
            encodingNotice.textContent = res.is_numeric
                ? 'This numeric classification target is already encoded. This inspection does not change your data.'
                : 'This is a categorical target. This inspection does not encode or change your data. When you run generated classification code from Model Advisor, LabelEncoder is applied for training, its mapping is shown, and predictions are converted back to the original labels. Encoding does not improve model accuracy; clean inconsistent labels before training.';
            classSec.appendChild(encodingNotice);
            if (res.class_percentages) {
                if (res.imbalance_ratio !== undefined) {
                    const imbPill = document.createElement('div');
                    imbPill.className = `mm-studio-alert ${res.is_imbalanced ? 'mm-alert-warning' : 'mm-alert-info'}`;
                    imbPill.innerHTML = `Imbalance Ratio: <b>${res.imbalance_ratio.toFixed(2)} : 1</b> — ${res.is_imbalanced ? '⚠️ Significant class imbalance detected.' : '✓ Well balanced target.'}`;
                    classSec.appendChild(imbPill);
                }
                Object.entries(res.class_percentages).forEach(([cls, pct]) => {
                    var _a, _b;
                    const count = (_b = (_a = res.class_counts) === null || _a === void 0 ? void 0 : _a[cls]) !== null && _b !== void 0 ? _b : '';
                    const barRow = document.createElement('div');
                    barRow.className = 'mm-studio-bar-row';
                    barRow.innerHTML = `
            <div class="mm-studio-bar-label">
              <span>Class <b>"${cls}"</b></span>
              <span class="mm-studio-bar-val">${count} (${pct}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${pct}%; background:#818cf8;"></div>
            </div>
          `;
                    classSec.appendChild(barRow);
                });
            }
            container.appendChild(classSec);
        }
        // 3. Regression Health (Distribution & Outliers)
        if (res.task === 'regression') {
            const regSec = document.createElement('div');
            regSec.className = 'mm-studio-section';
            regSec.innerHTML = `<div class="mm-studio-sec-title"><span>📈</span> Continuous Target Stats</div>`;
            const statsGrid = document.createElement('div');
            statsGrid.className = 'mm-studio-stats-grid';
            statsGrid.innerHTML = `
        <div class="mm-stat-box"><div class="mm-stat-val">${(_e = (_d = res.mean) === null || _d === void 0 ? void 0 : _d.toFixed(2)) !== null && _e !== void 0 ? _e : '—'}</div><div class="mm-stat-lbl">Mean</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${(_g = (_f = res.median) === null || _f === void 0 ? void 0 : _f.toFixed(2)) !== null && _g !== void 0 ? _g : '—'}</div><div class="mm-stat-lbl">Median</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${(_j = (_h = res.std) === null || _h === void 0 ? void 0 : _h.toFixed(2)) !== null && _j !== void 0 ? _j : '—'}</div><div class="mm-stat-lbl">Std Dev</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${(_l = (_k = res.skewness) === null || _k === void 0 ? void 0 : _k.toFixed(2)) !== null && _l !== void 0 ? _l : '—'}</div><div class="mm-stat-lbl">Skewness</div></div>
      `;
            regSec.appendChild(statsGrid);
            if (res.skewness && Math.abs(res.skewness) > 1.0) {
                const skewAlert = document.createElement('div');
                skewAlert.className = 'mm-studio-alert mm-alert-warning';
                skewAlert.innerHTML = `⚠️ <b>High Skewness (${res.skewness.toFixed(2)}):</b> Target is heavily skewed. Consider applying <code>np.log1p()</code> or Box-Cox transformation.`;
                regSec.appendChild(skewAlert);
            }
            if (res.outlier_count && res.outlier_count > 0) {
                const outAlert = document.createElement('div');
                outAlert.className = 'mm-studio-alert mm-alert-warning';
                outAlert.innerHTML = `⚠️ <b>Outliers (${res.outlier_count}):</b> Target contains ${res.outlier_count} potential outliers (1.5 × IQR rule).`;
                regSec.appendChild(outAlert);
            }
            container.appendChild(regSec);
        }
        // 4. Action Recommendations
        if (res.recommendations && res.recommendations.length > 0) {
            const recSec = document.createElement('div');
            recSec.className = 'mm-studio-section';
            recSec.innerHTML = `<div class="mm-studio-sec-title"><span>💡</span> Target Engineering Advice</div>`;
            const list = document.createElement('ul');
            list.className = 'mm-studio-list';
            res.recommendations.forEach(r => {
                const li = document.createElement('li');
                li.textContent = r;
                list.appendChild(li);
            });
            recSec.appendChild(list);
            container.appendChild(recSec);
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 3: 📊 FEATURE ANALYZER & DISTRIBUTION
    // ═════════════════════════════════════════════════════════════════
    _renderFeatureTab() {
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to use Feature Deep-Dive.</div>';
            return;
        }
        const frag = document.createDocumentFragment();
        const pickerSec = document.createElement('div');
        pickerSec.className = 'mm-studio-section';
        pickerSec.innerHTML = `
      <div class="mm-studio-sec-title"><span>📊</span> Feature Deep-Dive & Distribution</div>
      <div class="mm-studio-sec-sub">Examine individual feature distribution, outliers, and correlations.</div>
    `;
        const selectRow = document.createElement('div');
        selectRow.className = 'mm-studio-select-row';
        const select = document.createElement('select');
        select.className = 'mm-studio-select';
        (this._dataset.column_names || []).forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            if (col === this._featureCol)
                opt.selected = true;
            select.appendChild(opt);
        });
        const inspectBtn = document.createElement('button');
        inspectBtn.type = 'button';
        inspectBtn.className = 'mm-studio-btn mm-btn-primary';
        inspectBtn.textContent = '📊 Inspect Feature';
        selectRow.append(select, inspectBtn);
        pickerSec.appendChild(selectRow);
        frag.appendChild(pickerSec);
        const featResultDiv = document.createElement('div');
        featResultDiv.className = 'mm-studio-feat-result';
        frag.appendChild(featResultDiv);
        const runFeatureAnalysis = async (col) => {
            this._featureCol = col;
            featResultDiv.innerHTML = '<div class="mm-studio-loading">Analyzing feature distribution...</div>';
            try {
                const res = await (0,_request__rspack_import_2.requestAPI)('api/dataset/feature', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file_path: this._currentPath, feature_column: col })
                });
                this._displayFeatureResult(featResultDiv, res);
            }
            catch (err) {
                featResultDiv.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Feature analysis failed.'}</div>`;
            }
        };
        inspectBtn.addEventListener('click', () => runFeatureAnalysis(select.value));
        select.addEventListener('change', () => runFeatureAnalysis(select.value));
        this._contentArea.appendChild(frag);
        if (this._featureCol) {
            void runFeatureAnalysis(this._featureCol);
        }
    }
    _displayFeatureResult(container, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        container.replaceChildren();
        // Stats Grid
        const card = document.createElement('div');
        card.className = 'mm-studio-card';
        card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${(_b = (_a = res.feature_column) !== null && _a !== void 0 ? _a : res.feature) !== null && _b !== void 0 ? _b : '—'}</span>
        <span class="mm-studio-badge ${((_c = res.type) !== null && _c !== void 0 ? _c : res.feature_type) === 'numerical' ? 'badge-num' : 'badge-cat'}">${((_e = (_d = res.type) !== null && _d !== void 0 ? _d : res.feature_type) !== null && _e !== void 0 ? _e : 'unknown').toUpperCase()}</span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${(_f = res.missing_count) !== null && _f !== void 0 ? _f : 0} (${((_g = res.missing_percentage) !== null && _g !== void 0 ? _g : 0).toFixed(1)}%)</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${(_h = res.unique_count) !== null && _h !== void 0 ? _h : 0}</div><div class="mm-stat-lbl">Unique</div></div>
        ${res.mean !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.mean.toFixed(2)}</div><div class="mm-stat-lbl">Mean</div></div>` : ''}
        ${res.median !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.median.toFixed(2)}</div><div class="mm-stat-lbl">Median</div></div>` : ''}
        ${((_j = res.std) !== null && _j !== void 0 ? _j : res.standard_deviation) !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${((_k = res.std) !== null && _k !== void 0 ? _k : res.standard_deviation).toFixed(2)}</div><div class="mm-stat-lbl">Std Dev</div></div>` : ''}
        ${res.skewness !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.skewness.toFixed(2)}</div><div class="mm-stat-lbl">Skewness</div></div>` : ''}
        ${res.outlier_count !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val" style="color:${res.outlier_count > 0 ? '#f87171' : 'inherit'}">${res.outlier_count}</div><div class="mm-stat-lbl">Outliers</div></div>` : ''}
      </div>
    `;
        container.appendChild(card);
        // Distribution Histogram / Value counts
        const distSec = document.createElement('div');
        distSec.className = 'mm-studio-section';
        distSec.innerHTML = `<div class="mm-studio-sec-title"><span>📊</span> Distribution</div>`;
        // Backend returns histogram_counts + histogram_edges arrays (numerical)
        // or category_distribution array (categorical), or legacy value_counts dict
        if (res.histogram_counts && res.histogram_edges && res.histogram_counts.length > 0) {
            const counts = res.histogram_counts;
            const edges = res.histogram_edges;
            const maxCount = Math.max(...counts, 1);
            const histDiv = document.createElement('div');
            histDiv.className = 'mm-studio-hist-container';
            counts.forEach((count, i) => {
                var _a, _b;
                const hPct = Math.round((count / maxCount) * 100);
                const colEl = document.createElement('div');
                colEl.className = 'mm-hist-col';
                const lo = ((_a = edges[i]) !== null && _a !== void 0 ? _a : 0).toFixed(0);
                const hi = ((_b = edges[i + 1]) !== null && _b !== void 0 ? _b : 0).toFixed(0);
                colEl.title = `[${lo} – ${hi}]: ${count}`;
                colEl.innerHTML = `
          <div class="mm-hist-bar" style="height:${Math.max(hPct, 4)}%;"></div>
          <div class="mm-hist-label">${lo}</div>
        `;
                histDiv.appendChild(colEl);
            });
            distSec.appendChild(histDiv);
        }
        else if (res.histogram && res.histogram.length > 0) {
            // Legacy: histogram as array of {bin_start, bin_end, count}
            const maxCount = Math.max(...res.histogram.map(b => b.count), 1);
            const histDiv = document.createElement('div');
            histDiv.className = 'mm-studio-hist-container';
            res.histogram.forEach(b => {
                const hPct = Math.round((b.count / maxCount) * 100);
                const colEl = document.createElement('div');
                colEl.className = 'mm-hist-col';
                colEl.title = `[${b.bin_start.toFixed(1)} – ${b.bin_end.toFixed(1)}]: ${b.count}`;
                colEl.innerHTML = `
          <div class="mm-hist-bar" style="height:${Math.max(hPct, 4)}%;"></div>
          <div class="mm-hist-label">${b.bin_start.toFixed(0)}</div>
        `;
                histDiv.appendChild(colEl);
            });
            distSec.appendChild(histDiv);
        }
        else if (res.category_distribution && res.category_distribution.length > 0) {
            // Backend categorical response: array of {value, count, percentage}
            res.category_distribution.slice(0, 10).forEach(item => {
                const pct = Math.round(item.percentage);
                const barRow = document.createElement('div');
                barRow.className = 'mm-studio-bar-row';
                barRow.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>"${item.value}"</span>
            <span class="mm-studio-bar-val">${item.count} (${pct}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${pct}%; background:#38bdf8;"></div>
          </div>
        `;
                distSec.appendChild(barRow);
            });
        }
        else if (res.value_counts) {
            // Legacy: value_counts dict
            const entries = Object.entries(res.value_counts).slice(0, 8);
            const total = res.total_rows || 1;
            entries.forEach(([cat, cnt]) => {
                const pct = Math.round((cnt / total) * 100);
                const barRow = document.createElement('div');
                barRow.className = 'mm-studio-bar-row';
                barRow.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>"${cat}"</span>
            <span class="mm-studio-bar-val">${cnt} (${pct}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${pct}%; background:#38bdf8;"></div>
          </div>
        `;
                distSec.appendChild(barRow);
            });
        }
        container.appendChild(distSec);
        // Correlations
        if (res.correlations && Object.keys(res.correlations).length > 0) {
            const corrSec = document.createElement('div');
            corrSec.className = 'mm-studio-section';
            corrSec.innerHTML = `<div class="mm-studio-sec-title"><span>🔗</span> Correlations with Other Features</div>`;
            const selfName = (_l = res.feature_column) !== null && _l !== void 0 ? _l : res.feature;
            Object.entries(res.correlations).forEach(([other, r]) => {
                if (other === selfName)
                    return;
                const absR = Math.abs(r);
                const color = r > 0 ? '#059669' : '#dc2626';
                const row = document.createElement('div');
                row.className = 'mm-studio-bar-row';
                row.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>${other}</span>
            <span class="mm-studio-bar-val" style="color:${color}; font-weight:700;">r = ${r.toFixed(3)}</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${Math.round(absR * 100)}%; background:${color};"></div>
          </div>
        `;
                corrSec.appendChild(row);
            });
            container.appendChild(corrSec);
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 4: 🧠 SMART PREPROCESSING ADVISER 2.0
    // ═════════════════════════════════════════════════════════════════
    _renderPreprocessingTab() {
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to get Smart Preprocessing recommendations.</div>';
            return;
        }
        this._contentArea.replaceChildren();
        const frag = document.createDocumentFragment();
        // ── Level Selector Header ──
        const topBar = document.createElement('div');
        topBar.className = 'mm-studio-section';
        // Level description banner
        const levelDescriptions = {
            basic: '🟢 Basic — Fill missing values with mean/mode. Perfect for beginners.',
            medium: '🟡 Medium — Fill NA + detect & cap outliers + encoding with pandas.',
            advanced: '🔴 Advanced — Full sklearn Pipeline with ColumnTransformer, StandardScaler, OneHotEncoder & OrdinalEncoder.',
        };
        const lvlRow = document.createElement('div');
        lvlRow.className = 'mm-studio-level-row';
        lvlRow.id = 'mm-prep-level-row';
        const lbl = document.createElement('span');
        lbl.style.cssText = 'font-size:11px; opacity:.7; margin-right:6px; font-weight:600;';
        lbl.textContent = 'Skill Level:';
        lvlRow.appendChild(lbl);
        const levelDescBanner = document.createElement('div');
        levelDescBanner.style.cssText = `
      font-size:11px; padding:8px 12px; border-radius:8px; margin-bottom:10px; margin-top:6px;
      background:rgba(167,139,250,0.08); border:1px solid rgba(167,139,250,0.2); color:#c4b5fd;
      line-height:1.5;
    `;
        levelDescBanner.textContent = levelDescriptions[this._prepLevel];
        const updateLevelUI = () => {
            // Update pill active states
            lvlRow.querySelectorAll('.mm-level-pill').forEach((el) => {
                const btn = el;
                const isActive = btn.dataset['level'] === this._prepLevel;
                btn.className = `mm-level-pill${isActive ? ' active' : ''}`;
            });
            levelDescBanner.textContent = levelDescriptions[this._prepLevel];
        };
        ['basic', 'medium', 'advanced'].forEach(lvl => {
            const b = document.createElement('button');
            b.type = 'button';
            b.dataset['level'] = lvl;
            b.className = `mm-level-pill ${this._prepLevel === lvl ? 'active' : ''}`;
            b.textContent = lvl.charAt(0).toUpperCase() + lvl.slice(1);
            b.addEventListener('click', () => {
                this._prepLevel = lvl;
                updateLevelUI();
                void this._loadPreprocessingAdvice(prepCardsContainer);
            });
            lvlRow.appendChild(b);
        });
        topBar.appendChild(lvlRow);
        topBar.appendChild(levelDescBanner);
        frag.appendChild(topBar);
        // Container for cards
        const prepCardsContainer = document.createElement('div');
        prepCardsContainer.className = 'mm-studio-prep-cards';
        frag.appendChild(prepCardsContainer);
        this._contentArea.appendChild(frag);
        void this._loadPreprocessingAdvice(prepCardsContainer);
    }
    async _loadPreprocessingAdvice(container) {
        container.innerHTML = '<div class="mm-studio-loading">Generating smart preprocessing recommendations...</div>';
        try {
            const datasetPath = this._pathInput.value.trim() || this._currentPath;
            const res = await (0,_request__rspack_import_2.requestAPI)('api/dataset/preprocessing', this._app.serviceManager.serverSettings, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_path: datasetPath, level: this._prepLevel })
            });
            this._resolvedDatasetPath = res.resolved_path || datasetPath;
            container.replaceChildren();
            // Warnings banner
            if (res.dataset_warnings && res.dataset_warnings.length > 0) {
                const warnCard = document.createElement('div');
                warnCard.className = 'mm-studio-alert mm-alert-warning';
                warnCard.innerHTML = `<b>Dataset Observations:</b><br/>${res.dataset_warnings.map(w => `• ${w}`).join('<br/>')}`;
                container.appendChild(warnCard);
            }
            if (!res.recommendations || res.recommendations.length === 0) {
                container.innerHTML = '<div class="mm-studio-empty">No preprocessing needed! Dataset is clean.</div>';
                return;
            }
            res.recommendations.forEach(rec => {
                const card = this._createRecommendationCard(rec, res.recommendations);
                container.appendChild(card);
            });
            // ── Advanced: Show full pipeline suggestion banner ──
            if (this._prepLevel === 'advanced' && res.pipeline_code) {
                const pipelineSection = document.createElement('div');
                pipelineSection.style.cssText = `
          margin-top:18px; padding:16px; border-radius:12px;
          background:rgba(99,102,241,0.07); border:1px solid rgba(99,102,241,0.25);
        `;
                const pipelineTitle = document.createElement('div');
                pipelineTitle.style.cssText = 'font-size:13px; font-weight:700; margin-bottom:4px; color:#4338ca;';
                pipelineTitle.innerHTML = '🚀 Suggested Full ColumnTransformer Pipeline';
                const pipelineSub = document.createElement('div');
                pipelineSub.style.cssText = 'font-size:11px; color:#5d6b80; margin-bottom:10px;';
                pipelineSub.textContent = 'This pipeline combines all numerical and categorical columns with proper imputation, scaling, and encoding.';
                const pipelineCode = document.createElement('pre');
                pipelineCode.style.cssText = `
          background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
          padding:12px 14px; font-size:10.5px; overflow-x:auto; margin:0;
          font-family:ui-monospace,SFMono-Regular,monospace; line-height:1.65; color:#1e293b;
        `;
                pipelineCode.textContent = res.pipeline_code;
                const pipelineBtnRow = document.createElement('div');
                pipelineBtnRow.style.cssText = 'display:flex; gap:8px; margin-top:10px;';
                const pipelineCopyBtn = document.createElement('button');
                pipelineCopyBtn.type = 'button';
                pipelineCopyBtn.className = 'mm-studio-btn mm-btn-sm';
                pipelineCopyBtn.innerHTML = '📋 Copy Pipeline';
                pipelineCopyBtn.addEventListener('click', async () => {
                    await navigator.clipboard.writeText(res.pipeline_code);
                    pipelineCopyBtn.textContent = 'Copied!';
                    setTimeout(() => { pipelineCopyBtn.innerHTML = '📋 Copy Pipeline'; }, 1500);
                });
                const pipelineInsertBtn = document.createElement('button');
                pipelineInsertBtn.type = 'button';
                pipelineInsertBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
                pipelineInsertBtn.innerHTML = '📥 Insert Pipeline';
                pipelineInsertBtn.addEventListener('click', () => {
                    const ok = this._insertPreprocessingCode(res.pipeline_code);
                    this._showToast(ok ? '✓ Pipeline code inserted!' : 'Open a notebook first.');
                });
                pipelineBtnRow.append(pipelineCopyBtn, pipelineInsertBtn);
                pipelineSection.append(pipelineTitle, pipelineSub, pipelineCode, pipelineBtnRow);
                container.appendChild(pipelineSection);
            }
        }
        catch (err) {
            container.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Failed to generate recommendations.'}</div>`;
        }
    }
    _createRecommendationCard(rec, recommendations) {
        const card = document.createElement('div');
        card.className = 'mm-studio-card mm-prep-card';
        const sevColor = {
            none: '#059669',
            low: '#d97706',
            moderate: '#ea580c',
            high: '#dc2626',
            very_high: '#991b1b',
        }[rec.missing_severity] || '#64748b';
        // Header
        const hdr = document.createElement('div');
        hdr.className = 'mm-prep-hdr';
        hdr.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:700; font-size:13px;">${rec.feature}</span>
        <span class="mm-studio-badge ${rec.feature_type === 'numerical' ? 'badge-num' : 'badge-cat'}">${rec.feature_type.toUpperCase()}</span>
      </div>
      <span class="mm-studio-badge" style="background:${sevColor}22; color:${sevColor}; border:1px solid ${sevColor}44;">
        ${rec.missing_count} MISSING (${rec.missing_pct}%)
      </span>
    `;
        // Action summary
        const act = document.createElement('div');
        act.className = 'mm-prep-action';
        act.innerHTML = `<b>Recommended:</b> ${rec.recommended_action || rec.imputation_strategy}`;
        // Why & Risks
        const whyEl = document.createElement('div');
        whyEl.className = 'mm-prep-text';
        whyEl.innerHTML = `<b>Why:</b> ${rec.why || rec.explanation}`;
        // Strategy selector
        const stratWrap = document.createElement('div');
        stratWrap.className = 'mm-prep-strategy-row';
        const stratSelect = document.createElement('select');
        stratSelect.className = 'mm-studio-select mm-select-sm';
        const strategies = rec.feature_type === 'numerical'
            ? ['mean', 'median', 'most_frequent', 'constant', 'standard_scaler', 'minmax_scaler', 'robust_scaler', 'cap_outliers_iqr', 'drop_column']
            : ['most_frequent', 'unknown', 'one_hot_encode', 'ordinal_encode', 'frequency_encode', 'drop_column'];
        strategies.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s.replace(/_/g, ' ').toUpperCase();
            if (s === rec.imputation_strategy || s === 'median')
                opt.selected = true;
            stratSelect.appendChild(opt);
        });
        stratWrap.innerHTML = '<span style="font-size:10px; opacity:.7;">Strategy:</span>';
        stratWrap.appendChild(stratSelect);
        // Live preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'mm-prep-preview-box';
        previewContainer.style.display = 'none';
        // Toolbar Buttons
        const toolRow = document.createElement('div');
        toolRow.className = 'mm-prep-btn-row';
        // 1. Live Preview Button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'mm-studio-btn mm-btn-sm';
        prevBtn.innerHTML = '👁️ Preview';
        prevBtn.title = 'Preview before and after';
        prevBtn.addEventListener('click', async () => {
            prevBtn.disabled = true;
            prevBtn.textContent = '⏳ Loading...';
            try {
                const preview = await (0,_request__rspack_import_2.requestAPI)('api/dataset/preprocessing/preview', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_path: this._currentPath,
                        feature: rec.feature,
                        strategy: stratSelect.value
                    })
                });
                this._renderLivePreview(previewContainer, preview);
                previewContainer.style.display = 'block';
            }
            catch (err) {
                previewContainer.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Preview failed.'}</div>`;
                previewContainer.style.display = 'block';
            }
            finally {
                prevBtn.disabled = false;
                prevBtn.innerHTML = '👁️ Preview';
            }
        });
        // 2. Apply to Dataset
        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
        applyBtn.innerHTML = '⚡ Apply to File';
        applyBtn.title = 'Apply transformation directly to dataset with backup';
        applyBtn.addEventListener('click', async () => {
            if (!confirm(`Apply '${stratSelect.value}' to column '${rec.feature}' in ${this._currentPath}?\nA .bak backup will be created.`))
                return;
            applyBtn.disabled = true;
            applyBtn.textContent = 'Applying...';
            try {
                const applied = await (0,_request__rspack_import_2.requestAPI)('api/dataset/preprocessing/apply', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_path: this._currentPath,
                        feature: rec.feature,
                        strategy: stratSelect.value
                    })
                });
                this._showToast(`✓ Applied ${stratSelect.value} to ${rec.feature}! Backup created.`);
                if (applied.dataset)
                    this._dataset = applied.dataset;
                void this._loadDataset(this._currentPath);
            }
            catch (err) {
                this._showToast(`❌ Apply failed: ${err instanceof Error ? err.message : 'Error'}`);
            }
            finally {
                applyBtn.disabled = false;
                applyBtn.innerHTML = '⚡ Apply to File';
            }
        });
        // 3. Undo
        const undoBtn = document.createElement('button');
        undoBtn.type = 'button';
        undoBtn.className = 'mm-studio-btn mm-btn-sm';
        undoBtn.innerHTML = '↩️ Undo';
        undoBtn.title = 'Restore original dataset from backup';
        undoBtn.addEventListener('click', async () => {
            if (!confirm(`Undo changes and restore ${this._currentPath} from backup?`))
                return;
            try {
                const undone = await (0,_request__rspack_import_2.requestAPI)('api/dataset/preprocessing/undo', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file_path: this._currentPath })
                });
                this._showToast('✓ Restored dataset from backup!');
                if (undone.dataset)
                    this._dataset = undone.dataset;
                void this._loadDataset(this._currentPath);
            }
            catch (err) {
                this._showToast(`❌ Undo failed: ${err instanceof Error ? err.message : 'Error'}`);
            }
        });
        // 4. Insert Code
        const insertBtn = document.createElement('button');
        insertBtn.type = 'button';
        insertBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        insertBtn.innerHTML = '📥 Insert Code';
        insertBtn.title = 'Insert complete runnable preprocessing code, including loading the selected dataset';
        insertBtn.addEventListener('click', () => {
            const code = this._buildFullPreprocessingCode(rec, stratSelect.value);
            const ok = this._insertPreprocessingCode(code);
            if (ok) {
                this._showToast('✓ Full preprocessing code inserted below active cell!');
            }
            else {
                this._showToast('Please open a notebook first.');
            }
        });
        // 5. Copy Code
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'mm-studio-btn mm-btn-sm';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(this._buildFullPreprocessingCode(rec, stratSelect.value));
                copyBtn.textContent = 'Copied!';
                setTimeout(() => { copyBtn.innerHTML = '📋 Copy'; }, 1500);
            }
            catch (_a) {
                copyBtn.textContent = 'Error';
            }
        });
        // 6. Preview Code — show syntax-highlighted code in a modal
        const previewCodeBtn = document.createElement('button');
        previewCodeBtn.type = 'button';
        previewCodeBtn.className = 'mm-studio-btn mm-btn-sm';
        previewCodeBtn.innerHTML = '🔍 Preview Code';
        previewCodeBtn.title = 'View the generated code in a readable panel';
        previewCodeBtn.addEventListener('click', () => {
            this._showCodePreviewModal(rec.feature, this._buildFullPreprocessingCode(rec, stratSelect.value), this._prepLevel);
        });
        toolRow.append(prevBtn, applyBtn, undoBtn, insertBtn, copyBtn, previewCodeBtn);
        card.append(hdr, act, whyEl, stratWrap, previewContainer, toolRow);
        return card;
    }
    _buildFullPreprocessingCode(rec, selectedStrategy) {
        const selectedPath = this._resolvedDatasetPath || this._pathInput.value.trim() || this._currentPath;
        return (0,_preprocessing_code_utils__rspack_import_3.buildFullPreprocessingCode)(selectedPath, rec, selectedStrategy);
    }
    // ── Code Preview Modal ────────────────────────────────────────────────────
    _showCodePreviewModal(feature, code, level) {
        var _a;
        // Remove existing modal if any
        (_a = document.getElementById('mm-code-preview-modal')) === null || _a === void 0 ? void 0 : _a.remove();
        const levelColors = {
            basic: '#059669',
            medium: '#d97706',
            advanced: '#4f46e5',
        };
        const levelColor = levelColors[level] || '#4f46e5';
        const overlay = document.createElement('div');
        overlay.id = 'mm-code-preview-modal';
        overlay.style.cssText = `
      position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,0.75); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center;
      padding:20px;
    `;
        const modal = document.createElement('div');
        modal.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:12px;
      padding:0; width:min(680px, 95vw); max-height:85vh;
      display:flex; flex-direction:column; box-shadow:0 20px 45px rgba(0,0,0,0.12);
      overflow:hidden; color:#253041;
    `;
        // Modal header
        const modalHdr = document.createElement('div');
        modalHdr.style.cssText = `
      display:flex; align-items:center; gap:10px; padding:16px 20px;
      border-bottom:1px solid #dfe3ea;
      background:#f8fafc;
    `;
        modalHdr.innerHTML = `
      <span style="font-size:16px;">🔍</span>
      <div style="flex:1;">
        <div style="font-size:13px; font-weight:700; color:#172554;">Code Preview — <code style="color:${levelColor};">${feature}</code></div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">
          Skill Level: <span style="color:${levelColor}; font-weight:600; text-transform:capitalize;">${level}</span>
        </div>
      </div>
    `;
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
      background:#f1f5f9; border:1px solid #dfe3ea;
      color:#475569; border-radius:8px; width:28px; height:28px;
      cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;
    `;
        closeBtn.addEventListener('click', () => overlay.remove());
        modalHdr.appendChild(closeBtn);
        // Code body
        const codeBody = document.createElement('div');
        codeBody.style.cssText = 'flex:1; overflow-y:auto; padding:16px 20px; background:#f8fafc;';
        // Level badge row
        const badgeRow = document.createElement('div');
        badgeRow.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:12px;';
        badgeRow.innerHTML = `
      <span style="
        font-size:9.5px; font-weight:700; padding:3px 9px; border-radius:99px;
        background:${levelColor}15; color:${levelColor}; border:1px solid ${levelColor}35;
        text-transform:uppercase; letter-spacing:0.5px;
      ">${level} level</span>
      <span style="font-size:10.5px; color:#64748b;">Python code for column: ${feature}</span>
    `;
        const pre = document.createElement('pre');
        pre.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:16px 18px; font-size:11.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:0; white-space:pre;
    `;
        pre.textContent = code;
        codeBody.append(badgeRow, pre);
        // Modal footer
        const modalFtr = document.createElement('div');
        modalFtr.style.cssText = `
      display:flex; gap:8px; padding:14px 20px;
      border-top:1px solid #dfe3ea;
      background:#ffffff;
    `;
        const ftrCopy = document.createElement('button');
        ftrCopy.type = 'button';
        ftrCopy.className = 'mm-studio-btn mm-btn-sm';
        ftrCopy.innerHTML = '📋 Copy Code';
        ftrCopy.addEventListener('click', async () => {
            await navigator.clipboard.writeText(code);
            ftrCopy.textContent = 'Copied!';
            setTimeout(() => { ftrCopy.innerHTML = '📋 Copy Code'; }, 1500);
        });
        const ftrInsert = document.createElement('button');
        ftrInsert.type = 'button';
        ftrInsert.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        ftrInsert.innerHTML = '📥 Insert into Notebook';
        ftrInsert.addEventListener('click', () => {
            const ok = this._insertCodeBelow(code);
            this._showToast(ok ? '✓ Code inserted into notebook!' : 'Please open a notebook first.');
            overlay.remove();
        });
        const ftrClose = document.createElement('button');
        ftrClose.type = 'button';
        ftrClose.className = 'mm-studio-btn mm-btn-sm';
        ftrClose.innerHTML = 'Close';
        ftrClose.addEventListener('click', () => overlay.remove());
        modalFtr.append(ftrCopy, ftrInsert, ftrClose);
        modal.append(modalHdr, codeBody, modalFtr);
        overlay.appendChild(modal);
        // Close on backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay)
                overlay.remove();
        });
        document.body.appendChild(overlay);
    }
    _renderLivePreview(container, preview) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        container.replaceChildren();
        const title = document.createElement('div');
        title.style.cssText = 'font-weight:700; font-size:11px; margin-bottom:8px; color:#818cf8;';
        title.innerHTML = `👁️ Live Preview: Strategy <code>${preview.strategy}</code> on <code>${preview.feature}</code>`;
        const beforeMiss = (_c = (_b = (_a = preview.before.statistics) === null || _a === void 0 ? void 0 : _a.missing_count) !== null && _b !== void 0 ? _b : preview.before.missing_count) !== null && _c !== void 0 ? _c : 0;
        const afterMiss = (_f = (_e = (_d = preview.after.statistics) === null || _d === void 0 ? void 0 : _d.missing_count) !== null && _e !== void 0 ? _e : preview.after.missing_count) !== null && _f !== void 0 ? _f : 0;
        const beforeMean = (_h = (_g = preview.before.statistics) === null || _g === void 0 ? void 0 : _g.mean) !== null && _h !== void 0 ? _h : preview.before.mean;
        const afterMean = (_k = (_j = preview.after.statistics) === null || _j === void 0 ? void 0 : _j.mean) !== null && _k !== void 0 ? _k : preview.after.mean;
        const beforeSample = preview.before.sample || preview.before.sample_values || [];
        const afterSample = preview.after.sample || preview.after.sample_values || [];
        const grid = document.createElement('div');
        grid.className = 'mm-studio-stats-grid';
        grid.innerHTML = `
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#dc2626;">${beforeMiss}</div>
        <div class="mm-stat-lbl">Missing Before</div>
      </div>
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#059669;">${afterMiss}</div>
        <div class="mm-stat-lbl">Missing After</div>
      </div>
      ${beforeMean !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${typeof beforeMean === 'number' ? beforeMean.toFixed(2) : beforeMean}</div>
          <div class="mm-stat-lbl">Mean Before</div>
        </div>
      ` : ''}
      ${afterMean !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${typeof afterMean === 'number' ? afterMean.toFixed(2) : afterMean}</div>
          <div class="mm-stat-lbl">Mean After</div>
        </div>
      ` : ''}
    `;
        // Sample Values Comparison
        const sampleBox = document.createElement('div');
        sampleBox.className = 'mm-prep-sample-box';
        sampleBox.innerHTML = `
      <div style="font-size:10px; font-weight:600; margin-bottom:4px; opacity:.8;">Sample Values (Before vs After):</div>
      <div style="display:flex; gap:10px; font-family:monospace; font-size:10px;">
        <div style="flex:1;">
          <div style="opacity:.6; margin-bottom:2px;">Before:</div>
          <div style="color:#fca5a5;">${beforeSample.slice(0, 5).map((v) => v === null ? 'NaN' : typeof v === 'number' ? v.toFixed(1) : v).join(', ')}</div>
        </div>
        <div style="flex:1;">
          <div style="opacity:.6; margin-bottom:2px;">After:</div>
          <div style="color:#86efac;">${afterSample.slice(0, 5).map((v) => v === null ? 'NaN' : typeof v === 'number' ? v.toFixed(1) : v).join(', ')}</div>
        </div>
      </div>
    `;
        container.append(title, grid, sampleBox);
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 4.5: 🤖 MODEL ADVISOR
    // ═════════════════════════════════════════════════════════════════
    _renderModelAdvisorTab() {
        var _a;
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset first to get model recommendations.</div>';
            return;
        }
        this._contentArea.replaceChildren();
        const frag = document.createDocumentFragment();
        // ── Header ──
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-section';
        hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>🤖</span> Intelligent Model Advisor</div>
      <div class="mm-studio-sec-sub">
        ModelMind analyses your dataset's size, feature types, and missing values
        to recommend the best ML models — ranked by suitability score.
      </div>
    `;
        // ── Target column selector ──
        const targetRow = document.createElement('div');
        targetRow.style.cssText = 'display:flex; align-items:center; gap:10px; margin-top:10px;';
        const targetLbl = document.createElement('span');
        targetLbl.style.cssText = 'font-size:11px; opacity:.7; font-weight:600;';
        targetLbl.textContent = '🎯 Target Column:';
        const targetSel = document.createElement('select');
        targetSel.className = 'mm-studio-select mm-select-sm';
        targetSel.style.maxWidth = '200px';
        ((_a = this._dataset.column_names) !== null && _a !== void 0 ? _a : []).forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            if (col === this._targetCol || col === this._dataset.column_names[this._dataset.column_names.length - 1])
                opt.selected = true;
            targetSel.appendChild(opt);
        });
        const runBtn = document.createElement('button');
        runBtn.type = 'button';
        runBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
        runBtn.innerHTML = '🚀 Get Recommendations';
        targetRow.append(targetLbl, targetSel, runBtn);
        targetSel.addEventListener('change', () => {
            this._targetCol = targetSel.value;
        });
        hdr.appendChild(targetRow);
        frag.appendChild(hdr);
        // ── Results container ──
        // Phase 11: opt-in empirical evaluation, separate from heuristic ranking.
        const evaluationPanel = document.createElement('div');
        evaluationPanel.style.cssText =
            'background:#fff;border:1px solid #c7d2fe;border-radius:12px;' +
                'padding:14px;margin-bottom:16px;';
        const evaluationTitle = document.createElement('div');
        evaluationTitle.style.cssText =
            'font-size:14px;font-weight:800;color:#1e293b;margin-bottom:5px;';
        evaluationTitle.textContent = 'Measured Model Performance';
        const evaluationDescription = document.createElement('div');
        evaluationDescription.style.cssText =
            'font-size:11px;color:#64748b;line-height:1.6;margin-bottom:10px;';
        evaluationDescription.textContent =
            'Run real 3-fold cross-validation on your selected dataset. ' +
                'These measured scores are different from the suitability scores ' +
                'shown in the original recommendations below.';
        const evaluationControls = document.createElement('div');
        evaluationControls.style.cssText =
            'display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
        const evaluationButton = document.createElement('button');
        evaluationButton.type = 'button';
        evaluationButton.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
        evaluationButton.textContent = 'Evaluate Models on My Dataset';
        const evaluationCancel = document.createElement('button');
        evaluationCancel.type = 'button';
        evaluationCancel.className = 'mm-studio-btn mm-btn-sm';
        evaluationCancel.textContent = 'Cancel Evaluation';
        evaluationCancel.disabled = true;
        const evaluationStatus = document.createElement('div');
        evaluationStatus.style.cssText =
            'font-size:11px;color:#475569;margin-top:10px;';
        evaluationStatus.textContent =
            'Evaluation has not started.';
        const evaluationResults = document.createElement('div');
        evaluationResults.style.cssText = 'margin-top:12px;';
        evaluationControls.append(evaluationButton, evaluationCancel);
        evaluationPanel.append(evaluationTitle, evaluationDescription, evaluationControls, evaluationStatus, evaluationResults);
        frag.appendChild(evaluationPanel);
        let activeEvaluationJob = null;
        let evaluationBusy = false;
        const evaluationSettings = this._app.serviceManager.serverSettings;
        const setEvaluationBusy = (busy) => {
            evaluationBusy = busy;
            evaluationButton.disabled = busy;
            evaluationCancel.disabled = !busy || !activeEvaluationJob;
        };
        const showMeasuredResults = (jobResult, evaluationJobId, datasetPath, targetColumn) => {
            var _a, _b, _c, _d, _e, _f, _g;
            evaluationResults.replaceChildren();
            const evaluation = jobResult === null || jobResult === void 0 ? void 0 : jobResult.empirical_evaluation;
            if (!evaluation || evaluation.success !== true) {
                evaluationStatus.textContent =
                    'Evaluation did not return a successful comparison.';
                return;
            }
            const metric = String((_a = evaluation.metric) !== null && _a !== void 0 ? _a : 'score');
            const higherIsBetter = evaluation.higher_is_better === true;
            const heading = document.createElement('div');
            heading.style.cssText =
                'font-size:12px;font-weight:700;margin-bottom:8px;';
            heading.textContent =
                `Best measured model: ${String((_b = evaluation.recommended_model) !== null && _b !== void 0 ? _b : 'Unknown')}` +
                    ` | ${metric}: ${String((_c = evaluation.recommended_score) !== null && _c !== void 0 ? _c : 'N/A')}`;
            const explanation = document.createElement('div');
            explanation.style.cssText =
                'font-size:10px;color:#64748b;margin-bottom:10px;';
            explanation.textContent =
                `${String((_d = evaluation.cv_folds) !== null && _d !== void 0 ? _d : 3)}-fold cross-validation. ` +
                    (higherIsBetter
                        ? 'Higher scores are better.'
                        : 'Lower scores are better.') +
                    ' Results depend on this dataset and are not guarantees.';
            const table = document.createElement('table');
            table.style.cssText =
                'width:100%;border-collapse:collapse;font-size:11px;';
            const header = document.createElement('tr');
            for (const name of [
                'Model', 'Status', 'Mean score', 'Std. dev.', 'Scaler'
            ]) {
                const cell = document.createElement('th');
                cell.textContent = name;
                cell.style.cssText =
                    'padding:8px;border-bottom:1px solid #e2e8f0;' +
                        'text-align:left;background:#f8fafc;';
                header.appendChild(cell);
            }
            table.appendChild(header);
            const ranking = Array.isArray(evaluation.ranking)
                ? evaluation.ranking
                : [];
            for (const item of ranking) {
                const row = document.createElement('tr');
                const score = typeof item.mean_score === 'number'
                    ? item.mean_score.toFixed(4)
                    : 'N/A';
                const deviation = typeof item.std_score === 'number'
                    ? item.std_score.toFixed(4)
                    : 'N/A';
                for (const value of [
                    (_e = item.model) !== null && _e !== void 0 ? _e : 'Unknown',
                    (_f = item.status) !== null && _f !== void 0 ? _f : 'Unknown',
                    score,
                    deviation,
                    (_g = item.scaler) !== null && _g !== void 0 ? _g : 'None'
                ]) {
                    const cell = document.createElement('td');
                    cell.textContent = String(value);
                    cell.style.cssText =
                        'padding:8px;border-bottom:1px solid #e2e8f0;';
                    row.appendChild(cell);
                }
                table.appendChild(row);
            }
            evaluationResults.append(heading, explanation, table);
            if (Array.isArray(evaluation.warnings) &&
                evaluation.warnings.length > 0) {
                const warning = document.createElement('div');
                warning.style.cssText =
                    'font-size:10px;color:#92400e;margin-top:10px;';
                warning.textContent = evaluation.warnings
                    .filter((item) => typeof item === 'string')
                    .join(' ');
                evaluationResults.appendChild(warning);
            }
            const automl = jobResult === null || jobResult === void 0 ? void 0 : jobResult.automl_recommendations;
            if ((automl === null || automl === void 0 ? void 0 : automl.success) === true &&
                Array.isArray(automl.recommendations) &&
                evaluation.success === true) {
                this._renderFastTuneTopFive(evaluationResults, evaluationJobId, datasetPath, targetColumn, automl, evaluation);
            }
        };
        evaluationCancel.addEventListener('click', async () => {
            if (!activeEvaluationJob) {
                return;
            }
            evaluationCancel.disabled = true;
            try {
                await (0,_request__rspack_import_2.requestAPI)(`api/dataset/evaluation-jobs/${activeEvaluationJob}/cancel`, evaluationSettings, { method: 'POST' });
                evaluationStatus.textContent =
                    'Cancellation requested. Waiting for worker to stop...';
            }
            catch (error) {
                evaluationStatus.textContent =
                    `Cancellation request failed: ${String(error)}`;
                evaluationCancel.disabled = false;
            }
        });
        evaluationButton.addEventListener('click', async () => {
            var _a, _b;
            // Do not start two competing evaluations in one panel.
            // The main AutoML loader disables runBtn while active.
            if (evaluationBusy || runBtn.disabled) {
                return;
            }
            const selectedTarget = targetSel.value;
            const selectedPath = this._currentPath;
            if (!selectedPath || !selectedTarget) {
                evaluationStatus.textContent =
                    'Select a dataset and target column first.';
                return;
            }
            // Every result belongs to the exact dataset, target
            // and panel from which its evaluation started.
            const isEvaluationCurrent = () => {
                return (evaluationPanel.isConnected &&
                    this._activeTab === 'model-advisor' &&
                    this._currentPath === selectedPath &&
                    targetSel.value === selectedTarget);
            };
            evaluationResults.replaceChildren();
            activeEvaluationJob = null;
            setEvaluationBusy(true);
            runBtn.disabled = true;
            evaluationStatus.textContent =
                'Submitting measured model evaluation...';
            let submittedJobId = null;
            const cancelObsoleteJob = async () => {
                if (!submittedJobId) {
                    return;
                }
                try {
                    await (0,_request__rspack_import_2.requestAPI)(`api/dataset/evaluation-jobs/${submittedJobId}/cancel`, evaluationSettings, { method: 'POST' });
                }
                catch (_a) {
                    // The job may already be finished or no longer
                    // available. The server owns job timeout/cleanup.
                }
            };
            try {
                const submitted = await (0,_request__rspack_import_2.requestAPI)('api/dataset/evaluation-jobs', evaluationSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_path: selectedPath,
                        target_col: selectedTarget,
                        cv_folds: 3,
                        evaluate_scalers: false
                    })
                });
                if (typeof submitted.job_id !== 'string' ||
                    !submitted.job_id) {
                    throw new Error('Evaluation job ID was not returned.');
                }
                submittedJobId = submitted.job_id;
                activeEvaluationJob = submitted.job_id;
                // The panel might have changed while the
                // submission request was in flight.
                if (!isEvaluationCurrent()) {
                    await cancelObsoleteJob();
                    return;
                }
                evaluationCancel.disabled = false;
                let finished = false;
                for (let attempt = 0; attempt < 180; attempt++) {
                    // Check before sending the next HTTP request.
                    if (!isEvaluationCurrent()) {
                        await cancelObsoleteJob();
                        return;
                    }
                    const job = await (0,_request__rspack_import_2.requestAPI)(`api/dataset/evaluation-jobs/${submitted.job_id}`, evaluationSettings);
                    // A dataset, target or navigation change may have
                    // happened while the HTTP request was in flight.
                    if (!isEvaluationCurrent()) {
                        await cancelObsoleteJob();
                        return;
                    }
                    const status = String((_a = job.status) !== null && _a !== void 0 ? _a : 'unknown');
                    evaluationStatus.textContent =
                        `Dataset target: ${selectedTarget} | Job: ${status}`;
                    if (status === 'completed') {
                        finished = true;
                        // Results are rendered only for the original
                        // dataset, target and active Model Advisor panel.
                        showMeasuredResults(job.result, submitted.job_id, selectedPath, selectedTarget);
                        break;
                    }
                    if (['failed', 'cancelled', 'timed_out'].includes(status)) {
                        finished = true;
                        evaluationStatus.textContent =
                            `Evaluation ${status}: ${String((_b = job.error) !== null && _b !== void 0 ? _b : '')}`;
                        break;
                    }
                    await new Promise(resolve => {
                        setTimeout(resolve, 1000);
                    });
                }
                if (!finished && isEvaluationCurrent()) {
                    evaluationStatus.textContent =
                        'Still waiting. The evaluation may continue on the server.';
                }
            }
            catch (error) {
                if (isEvaluationCurrent()) {
                    evaluationStatus.textContent =
                        `Evaluation error: ${String(error)}`;
                }
            }
            finally {
                activeEvaluationJob = null;
                setEvaluationBusy(false);
                runBtn.disabled = false;
            }
        });
        const resultsContainer = document.createElement('div');
        frag.appendChild(resultsContainer);
        this._contentArea.appendChild(frag);
        let recommendationBusy = false;
        const loadRecommendations = async () => {
            var _a, _b;
            if (recommendationBusy) {
                return;
            }
            const chosenTarget = targetSel.value;
            const chosenPath = this._currentPath;
            // A recommendation belongs to one dataset and target.
            // Never display it for a different selection or panel.
            const isRequestCurrent = () => {
                return (resultsContainer.isConnected &&
                    this._activeTab === 'model-advisor' &&
                    this._currentPath === chosenPath &&
                    targetSel.value === chosenTarget);
            };
            if (!chosenTarget || !chosenPath) {
                resultsContainer.textContent =
                    'Select a dataset and target column first.';
                return;
            }
            if (evaluationBusy) {
                resultsContainer.textContent =
                    'An evaluation is already running in this panel. ' +
                        'Wait for it to finish before requesting recommendations.';
                return;
            }
            recommendationBusy = true;
            runBtn.disabled = true;
            resultsContainer.replaceChildren();
            const statusEl = document.createElement('div');
            statusEl.className = 'mm-studio-loading';
            statusEl.textContent =
                'Starting measured AutoML evaluation...';
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'mm-studio-btn mm-btn-sm';
            cancelBtn.textContent = 'Cancel AutoML';
            cancelBtn.disabled = true;
            resultsContainer.append(statusEl, cancelBtn);
            let jobId = null;
            let cancellationRequested = false;
            cancelBtn.addEventListener('click', async () => {
                if (!jobId || cancellationRequested) {
                    return;
                }
                cancellationRequested = true;
                cancelBtn.disabled = true;
                statusEl.textContent = 'Requesting cancellation...';
                try {
                    await (0,_request__rspack_import_2.requestAPI)(`api/dataset/evaluation-jobs/${jobId}/cancel`, this._app.serviceManager.serverSettings, { method: 'POST' });
                }
                catch (error) {
                    cancellationRequested = false;
                    cancelBtn.disabled = false;
                    statusEl.textContent =
                        `Cancellation request failed: ${String(error)}`;
                }
            });
            try {
                const settings = this._app.serviceManager.serverSettings;
                const submitted = await (0,_request__rspack_import_2.requestAPI)('api/dataset/evaluation-jobs', settings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_path: chosenPath,
                        target_col: chosenTarget,
                        cv_folds: 3,
                        evaluate_scalers: false
                    })
                });
                if (typeof submitted.job_id !== 'string') {
                    throw new Error('Evaluation job ID is missing.');
                }
                jobId = submitted.job_id;
                cancelBtn.disabled = false;
                if (!isRequestCurrent()) {
                    try {
                        await (0,_request__rspack_import_2.requestAPI)(`api/dataset/evaluation-jobs/${jobId}/cancel`, settings, { method: 'POST' });
                    }
                    catch (_c) {
                        // The server will still enforce its job timeout.
                    }
                    return;
                }
                let finished = false;
                for (let attempt = 0; attempt < 180; attempt++) {
                    if (!isRequestCurrent()) {
                        try {
                            await (0,_request__rspack_import_2.requestAPI)(`api/dataset/evaluation-jobs/${jobId}/cancel`, settings, { method: 'POST' });
                        }
                        catch (_d) {
                            // Panel has closed; the server still owns job cleanup.
                        }
                        return;
                    }
                    const job = await (0,_request__rspack_import_2.requestAPI)(`api/dataset/evaluation-jobs/${jobId}`, settings);
                    // Ignore results belonging to an obsolete selection.
                    if (!isRequestCurrent()) {
                        try {
                            await (0,_request__rspack_import_2.requestAPI)(`api/dataset/evaluation-jobs/${jobId}/cancel`, settings, { method: 'POST' });
                        }
                        catch (_e) {
                            // A completed job cannot necessarily be cancelled.
                        }
                        return;
                    }
                    const status = String((_a = job.status) !== null && _a !== void 0 ? _a : 'unknown');
                    statusEl.textContent =
                        `AutoML: ${status} — comparing regression or ` +
                            `classification algorithms using cross-validation.`;
                    if (status === 'completed') {
                        finished = true;
                        const original = job.result;
                        const automl = original === null || original === void 0 ? void 0 : original.automl_recommendations;
                        if (!(original === null || original === void 0 ? void 0 : original.handled) ||
                            !(automl === null || automl === void 0 ? void 0 : automl.success) ||
                            !Array.isArray(automl.recommendations) ||
                            automl.recommendations.length === 0) {
                            throw new Error('Completed evaluation has no valid AutoML recommendations.');
                        }
                        const models = automl.recommendations.map((item, index) => ({
                            name: item.name,
                            rank: index + 1,
                            medal: index === 0 ? '🥇' :
                                index === 1 ? '🥈' :
                                    index === 2 ? '🥉' : '🏅',
                            score: 0,
                            tags: [
                                'Measured CV',
                                automl.task === 'regression'
                                    ? 'Regression'
                                    : 'Classification'
                            ],
                            why: 'Selected using measured cross-validation ' +
                                'performance among the evaluated finalists. ' +
                                'The score is an estimate, not a guarantee ' +
                                'of performance on new data.',
                            strengths: [
                                'Evaluated on the selected dataset',
                                'Preprocessing fitted within CV folds'
                            ],
                            weaknesses: [
                                'Performance depends on the dataset',
                                'Final holdout performance may differ'
                            ],
                            best_for: 'Datasets where this algorithm performs well ' +
                                'under the selected evaluation procedure.',
                            training_speed: 'Dataset dependent',
                            complexity: 'Model dependent',
                            interpretability: 'Model dependent',
                            code: item.code_available ? item.code : '',
                            defaultCode: item.code_available ? item.code : '',
                            automl_measured: true,
                            measured_score: item.measured_score,
                            measured_std: item.std_score,
                            automl_task: automl.task,
                            code_available: item.code_available,
                            code_error: item.code_error
                        }));
                        const rendered = {
                            ...original,
                            models,
                            automl_measured: true,
                            automl_candidate_count: automl.candidate_count,
                            automl_task: automl.task
                        };
                        resultsContainer.replaceChildren();
                        this._renderModelAdvisorResults(resultsContainer, rendered);
                        // Optional Fast Tune. Existing results remain unchanged.
                        this._renderFastTuneTopFive(resultsContainer, jobId, chosenPath, chosenTarget, automl, original.empirical_evaluation, models);
                        break;
                    }
                    if (['failed', 'cancelled', 'timed_out'].includes(status)) {
                        finished = true;
                        statusEl.textContent =
                            `AutoML ${status}: ${String((_b = job.error) !== null && _b !== void 0 ? _b : '')}`;
                        cancelBtn.disabled = true;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                if (!finished) {
                    statusEl.textContent =
                        'Evaluation is still pending on the server.';
                    cancelBtn.disabled = true;
                }
            }
            catch (error) {
                statusEl.textContent =
                    `AutoML failed: ${String(error)}`;
                cancelBtn.disabled = true;
            }
            finally {
                recommendationBusy = false;
                runBtn.disabled = false;
            }
        };
        runBtn.addEventListener('click', loadRecommendations);
        void loadRecommendations();
    }
    _renderModelAdvisorResults(container, res) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!res.handled) {
            container.innerHTML = `<div class="mm-studio-alert mm-alert-error">${(_a = res.error) !== null && _a !== void 0 ? _a : 'Analysis failed.'}</div>`;
            return;
        }
        const frag = document.createDocumentFragment();
        // ── Dataset + Task Summary cards ──
        const summaryGrid = document.createElement('div');
        summaryGrid.style.cssText = 'display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px;';
        const addMeta = (label, value, color = '#4f46e5') => {
            const card = document.createElement('div');
            card.style.cssText = `
        padding:12px; border-radius:10px; border:1px solid #dfe3ea;
        background:#ffffff; box-shadow:0 1px 3px rgba(31,41,55,0.03);
      `;
            card.innerHTML = `
        <div style="font-size:16px; font-weight:800; color:${color};">${value}</div>
        <div style="font-size:9.5px; color:#5d6b80; text-transform:uppercase; letter-spacing:0.3px; font-weight:600; margin-top:2px;">${label}</div>
      `;
            summaryGrid.appendChild(card);
        };
        addMeta('Rows', (_c = (_b = res.rows) === null || _b === void 0 ? void 0 : _b.toLocaleString()) !== null && _c !== void 0 ? _c : '—');
        addMeta('Features', `${res.n_numeric_features} num · ${res.n_categorical_features} cat`);
        addMeta('Missing Data', res.has_missing ? `${res.missing_pct}%` : 'None', res.has_missing ? '#dc2626' : '#059669');
        frag.appendChild(summaryGrid);
        // ── Task badge ──
        const taskBadge = document.createElement('div');
        taskBadge.style.cssText = `
      padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:12px; font-weight:600;
      background:${res.task === 'regression' ? '#eef2ff' : '#ecfdf5'};
      border:1px solid ${res.task === 'regression' ? '#c7d2fe' : '#a7f3d0'};
      color:${res.task === 'regression' ? '#4338ca' : '#065f46'};
    `;
        taskBadge.innerHTML = `
      <b>Detected Task:</b> ${res.task_label}
      &nbsp;·&nbsp; <b>Target Column:</b> <code>${res.target_column}</code>
      &nbsp;·&nbsp; <b>Dataset Size:</b> ${res.dataset_size_label}
    `;
        frag.appendChild(taskBadge);
        if (res.target_encoding === 'LabelEncoder') {
            const encodingNotice = document.createElement('div');
            encodingNotice.className = 'mm-studio-alert mm-alert-info';
            encodingNotice.style.marginBottom = '16px';
            encodingNotice.textContent =
                'LabelEncoder is included in the generated classification code: target categories are encoded for training, the code prints the label-to-number mapping, and predictions are converted back to the original category names. The source CSV is not changed.';
            frag.appendChild(encodingNotice);
        }
        // ── Section title ──
        const secTitle = document.createElement('div');
        secTitle.style.cssText = 'font-size:13px; font-weight:700; margin-bottom:12px; color:#1e293b;';
        secTitle.innerHTML = `🏆 Ranked Model Recommendations <span style="color:#64748b; font-weight:400; font-size:11px;">(${(_e = (_d = res.models) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0} models analysed)</span>`;
        if (res.automl_measured) {
            secTitle.textContent =
                `Measured AutoML Rankings (${res.models.length} finalists ` +
                    `from ${(_f = res.automl_candidate_count) !== null && _f !== void 0 ? _f : 'multiple'} candidates)`;
        }
        frag.appendChild(secTitle);
        // ── Model cards ──
        ((_g = res.models) !== null && _g !== void 0 ? _g : []).forEach((model) => {
            frag.appendChild(this._buildModelCard(model, res.target_column));
        });
        container.appendChild(frag);
    }
    /**
     * Optional Fast Tune Top 5.
     *
     * Runs only after a completed AutoML evaluation and only
     * when the student explicitly clicks the tuning button.
     *
     * No changes to Model Advisor ranking or existing cards.
     */
    _renderFastTuneTopFive(container, evaluationJobId, datasetPath, targetColumn, automl, empirical, advisorModels = []) {
        const recommendations = automl === null || automl === void 0 ? void 0 : automl.recommendations;
        const featureColumns = empirical === null || empirical === void 0 ? void 0 : empirical.features;
        const task = empirical === null || empirical === void 0 ? void 0 : empirical.task;
        if (!Array.isArray(recommendations) ||
            recommendations.length < 1 ||
            recommendations.length > 5 ||
            !Array.isArray(featureColumns) ||
            featureColumns.length === 0 ||
            !['classification', 'regression'].includes(task)) {
            return;
        }
        const names = recommendations.map((item) => item.name);
        if (!names.every((name) => typeof name === 'string' && name.length > 0)) {
            return;
        }
        const section = document.createElement('section');
        section.className = 'mm-studio-section';
        section.style.cssText =
            'margin-top:18px;padding:16px;border:1px solid #c7d2fe;' +
                'border-radius:12px;background:#f8faff;';
        const heading = document.createElement('div');
        heading.style.cssText =
            'font-size:15px;font-weight:800;color:#1e293b;';
        heading.textContent = 'Fast Hyperparameter Tuning';
        const explanation = document.createElement('p');
        explanation.style.cssText =
            'font-size:12px;line-height:1.6;color:#475569;' +
                'margin:8px 0 12px;';
        explanation.textContent =
            'Search important parameters for your measured Top 5. ' +
                'Basic tests fewer configurations. Advanced explores ' +
                'more important settings. Only useful changes are shown.';
        const modeRow = document.createElement('div');
        modeRow.style.cssText =
            'display:flex;gap:8px;align-items:center;margin-bottom:10px;';
        const modeLabel = document.createElement('label');
        modeLabel.textContent = 'Tuning level:';
        modeLabel.style.cssText =
            'font-size:12px;font-weight:700;color:#334155;';
        const modeSelect = document.createElement('select');
        modeSelect.className = 'mm-studio-select';
        ['basic', 'advanced'].forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent =
                level === 'basic' ? 'Basic' : 'Advanced';
            modeSelect.appendChild(option);
        });
        modeRow.append(modeLabel, modeSelect);
        const modeHelp = document.createElement('div');
        modeHelp.style.cssText =
            'font-size:11px;color:#64748b;margin-bottom:10px;';
        const updateModeHelp = () => {
            modeHelp.textContent = modeSelect.value === 'advanced'
                ? 'Advanced: up to 20 configurations per model. ' +
                    'More exploration; time limit may stop the search.'
                : 'Basic: up to 8 configurations per model. ' +
                    'Focuses on high-impact hyperparameters.';
        };
        modeSelect.addEventListener('change', updateModeHelp);
        updateModeHelp();
        const buttonRow = document.createElement('div');
        buttonRow.style.cssText =
            'display:flex;gap:8px;flex-wrap:wrap;';
        const tuneButton = document.createElement('button');
        tuneButton.type = 'button';
        tuneButton.className =
            'mm-studio-btn mm-btn-sm mm-btn-primary';
        tuneButton.textContent = '⚡ Fast Tune Top 5';
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'mm-studio-btn mm-btn-sm';
        cancelButton.textContent = 'Cancel Tuning';
        cancelButton.disabled = true;
        cancelButton.style.display = 'none';
        const status = document.createElement('div');
        status.setAttribute('role', 'status');
        status.style.cssText =
            'font-size:12px;color:#475569;margin-top:10px;';
        status.textContent = 'Tuning has not started.';
        const output = document.createElement('div');
        output.style.cssText = 'margin-top:12px;';
        buttonRow.append(tuneButton, cancelButton);
        section.append(heading, explanation, modeRow, modeHelp, buttonRow, status, output);
        container.appendChild(section);
        let activeJobId = null;
        let busy = false;
        const isCurrent = () => section.isConnected &&
            this._activeTab === 'model-advisor' &&
            this._currentPath === datasetPath &&
            this._targetCol === targetColumn;
        const settings = this._app.serviceManager.serverSettings;
        const printResult = (result) => {
            var _a, _b;
            output.replaceChildren();
            const title = document.createElement('div');
            title.style.cssText =
                'font-size:13px;font-weight:800;margin-bottom:8px;';
            title.textContent = 'Tuned Models — Tested Results';
            output.appendChild(title);
            const note = document.createElement('p');
            note.style.cssText =
                'font-size:11px;color:#64748b;line-height:1.5;';
            note.textContent =
                `Uses the Model Advisor metric (${String((_a = result === null || result === void 0 ? void 0 : result.metric) !== null && _a !== void 0 ? _a : 'CV score')}), ` +
                    `${String((_b = result === null || result === void 0 ? void 0 : result.cv_folds) !== null && _b !== void 0 ? _b : 'matching')} CV folds and its evaluated ` +
                    'dataset sample, so default scores are directly comparable to ' +
                    'the original finalists. Parameter selection can still overfit CV; ' +
                    'confirm a final model on a separate test set before deployment.';
            output.appendChild(note);
            const ranking = Array.isArray(result === null || result === void 0 ? void 0 : result.results)
                ? result.results
                : Array.isArray(result === null || result === void 0 ? void 0 : result.ranking)
                    ? result.ranking
                    : [];
            if (!ranking.length) {
                const message = document.createElement('pre');
                message.style.cssText =
                    'font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;';
                message.textContent = JSON.stringify(result, null, 2);
                output.appendChild(message);
                return;
            }
            const formattedScore = (item) => {
                var _a, _b, _c, _d, _e;
                const raw = (_c = (_b = (_a = item === null || item === void 0 ? void 0 : item.best_score) !== null && _a !== void 0 ? _a : item === null || item === void 0 ? void 0 : item.mean_score) !== null && _b !== void 0 ? _b : item === null || item === void 0 ? void 0 : item.score) !== null && _c !== void 0 ? _c : (_d = item === null || item === void 0 ? void 0 : item.best) === null || _d === void 0 ? void 0 : _d.score;
                if (typeof raw !== 'number' || !Number.isFinite(raw)) {
                    return 'No valid CV score';
                }
                if (task === 'regression') {
                    return `RMSE: ${Math.abs(raw).toFixed(4)} (lower is better)`;
                }
                const label = String((_e = result === null || result === void 0 ? void 0 : result.metric) !== null && _e !== void 0 ? _e : 'Accuracy');
                if (/accuracy|f1|precision|recall|roc.?auc/i.test(label)) {
                    return `${label}: ${(raw * 100).toFixed(2)}%`;
                }
                return `${label}: ${raw.toFixed(4)}`;
            };
            const formatValue = (value) => {
                if (value === null)
                    return 'None';
                if (typeof value === 'string')
                    return value;
                return JSON.stringify(value);
            };
            ranking.forEach((item, index) => {
                var _a, _b, _c;
                const card = document.createElement('div');
                card.style.cssText =
                    'padding:12px;margin:8px 0;' +
                        'border:1px solid #e2e8f0;' +
                        'border-radius:10px;background:#fff;';
                const name = document.createElement('div');
                name.style.cssText =
                    'font-size:13px;font-weight:700;color:#0f172a;';
                const modelName = String((_b = (_a = item === null || item === void 0 ? void 0 : item.model) !== null && _a !== void 0 ? _a : item === null || item === void 0 ? void 0 : item.name) !== null && _b !== void 0 ? _b : 'Model');
                name.textContent = `${index + 1}. ${modelName}`;
                const score = document.createElement('div');
                score.style.cssText =
                    'font-size:12px;font-weight:600;' +
                        'color:#059669;margin-top:6px;';
                score.textContent = formattedScore(item);
                const parameterText = document.createElement('div');
                parameterText.style.cssText =
                    'font-size:11px;color:#475569;margin-top:7px;line-height:1.6;';
                const recommendations = Array.isArray(item === null || item === void 0 ? void 0 : item.recommended_changes) ? item.recommended_changes : [];
                const params = (item === null || item === void 0 ? void 0 : item.best_params) &&
                    typeof item.best_params === 'object' &&
                    !Array.isArray(item.best_params)
                    ? item.best_params
                    : {};
                if (recommendations.length > 0 ||
                    Object.keys(params).length > 0) {
                    const heading = document.createElement('div');
                    heading.style.fontWeight = '700';
                    heading.textContent = (item === null || item === void 0 ? void 0 : item.completed) === false
                        ? 'Promising changes found (search incomplete):'
                        : 'Recommended parameter changes:';
                    parameterText.appendChild(heading);
                    if (recommendations.length > 0) {
                        recommendations.forEach((rec) => {
                            const row = document.createElement('div');
                            row.textContent =
                                `${String(rec.parameter)}: ` +
                                    `${formatValue(rec.default)} → ` +
                                    `${formatValue(rec.recommended)}`;
                            parameterText.appendChild(row);
                        });
                    }
                    else {
                        Object.entries(params).forEach(([key, value]) => {
                            const row = document.createElement('div');
                            row.textContent =
                                `${key}: ${formatValue(value)}`;
                            parameterText.appendChild(row);
                        });
                    }
                }
                else {
                    const state = String((_c = item === null || item === void 0 ? void 0 : item.recommendation_status) !== null && _c !== void 0 ? _c : '');
                    if (state === 'partial_defaults_recommended') {
                        parameterText.textContent =
                            'Default parameters performed best so far. ' +
                                'Search incomplete — more configurations remain untested.';
                    }
                    else if (state === 'insufficient_validation') {
                        parameterText.textContent =
                            'No parameter changes recommended: the evaluation had fewer ' +
                                'than three CV folds, which is not enough to assess tuning ' +
                                'improvements reliably.';
                    }
                    else if (state === 'partial_parameter_changes') {
                        parameterText.textContent =
                            'Promising changes found, but the search is incomplete.';
                    }
                    else if (state === 'defaults_recommended') {
                        parameterText.textContent =
                            'Keep default parameters. Tested alternatives ' +
                                'did not provide a meaningful improvement.';
                    }
                    else if (state === 'baseline_unavailable') {
                        parameterText.textContent =
                            'The default baseline was unavailable. ' +
                                'No parameter changes can be recommended reliably.';
                    }
                    else if (state === 'no_valid_configuration' ||
                        (item === null || item === void 0 ? void 0 : item.status) === 'failed') {
                        parameterText.textContent =
                            'No valid configuration was evaluated.';
                    }
                    else {
                        parameterText.textContent =
                            'No parameter changes recommended.';
                    }
                }
                const baseline = item === null || item === void 0 ? void 0 : item.baseline_score;
                const bestTested = item === null || item === void 0 ? void 0 : item.best_tested_score;
                if (typeof baseline === 'number' &&
                    Number.isFinite(baseline) &&
                    typeof bestTested === 'number' &&
                    Number.isFinite(bestTested)) {
                    const comparison = document.createElement('div');
                    comparison.style.cssText =
                        'font-size:10px;color:#64748b;margin-top:6px;';
                    comparison.textContent =
                        `Default CV: ${baseline.toFixed(4)} • ` +
                            `Best tested CV: ${bestTested.toFixed(4)}`;
                    parameterText.appendChild(comparison);
                }
                const testedCount = item === null || item === void 0 ? void 0 : item.configurations_tested;
                const plannedCount = item === null || item === void 0 ? void 0 : item.configurations_planned;
                if (typeof testedCount === 'number' &&
                    typeof plannedCount === 'number' &&
                    plannedCount > 0) {
                    const progress = document.createElement('div');
                    progress.style.cssText =
                        'font-size:11px;color:#475569;margin-top:7px;';
                    progress.textContent =
                        `Configurations tested: ${testedCount}/${plannedCount}`;
                    parameterText.appendChild(progress);
                }
                if ((item === null || item === void 0 ? void 0 : item.completed) === false) {
                    const warning = document.createElement('div');
                    warning.style.cssText =
                        'font-size:11px;color:#b45309;margin-top:6px;';
                    warning.textContent =
                        'Partial search: not all configurations were tested.';
                    parameterText.appendChild(warning);
                }
                if (typeof (item === null || item === void 0 ? void 0 : item.code) === 'string' && item.code.trim()) {
                    const tunedCode = item.code;
                    const codeNotice = document.createElement('div');
                    codeNotice.style.cssText =
                        'font-size:10.5px;color:#047857;margin-top:6px;font-weight:600;display:flex;align-items:center;gap:4px;';
                    codeNotice.innerHTML = '<span>⚡ Tuned! Recommendations shown on Model Advisor card above. The main insert button still inserts <b>baseline code</b> — apply changes manually.</span>';
                    parameterText.appendChild(codeNotice);
                    const actionRow = document.createElement('div');
                    actionRow.style.cssText = 'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;';
                    const insertTunedBtn = document.createElement('button');
                    insertTunedBtn.type = 'button';
                    insertTunedBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
                    insertTunedBtn.style.cssText = 'background:#059669;border-color:#047857;color:#fff;font-weight:600;';
                    insertTunedBtn.innerHTML = '📥 Insert Tuned Code into Notebook';
                    insertTunedBtn.addEventListener('click', () => {
                        const ok = this._insertCodeBelow(tunedCode);
                        this._showToast(ok ? `✓ Tuned ${modelName} code inserted into notebook!` : 'Open a notebook first.');
                    });
                    const copyTunedBtn = document.createElement('button');
                    copyTunedBtn.type = 'button';
                    copyTunedBtn.className = 'mm-studio-btn mm-btn-sm';
                    copyTunedBtn.innerHTML = '📋 Copy Code';
                    copyTunedBtn.addEventListener('click', async () => {
                        await navigator.clipboard.writeText(tunedCode);
                        copyTunedBtn.textContent = 'Copied!';
                        setTimeout(() => { copyTunedBtn.innerHTML = '📋 Copy Code'; }, 1500);
                    });
                    const previewTunedBtn = document.createElement('button');
                    previewTunedBtn.type = 'button';
                    previewTunedBtn.className = 'mm-studio-btn mm-btn-sm';
                    previewTunedBtn.innerHTML = '🔍 Preview Code';
                    previewTunedBtn.addEventListener('click', () => {
                        this._showCodePreviewModal(modelName + ' (Tuned)', tunedCode, 'advanced');
                    });
                    actionRow.append(insertTunedBtn, copyTunedBtn, previewTunedBtn);
                    card.appendChild(actionRow);
                }
                else if (typeof (item === null || item === void 0 ? void 0 : item.code_error) === 'string') {
                    const codeWarning = document.createElement('div');
                    codeWarning.style.cssText =
                        'font-size:10px;color:#b45309;margin-top:6px;';
                    codeWarning.textContent =
                        `Could not synchronize generated code: ${item.code_error}`;
                    parameterText.appendChild(codeWarning);
                }
                const details = document.createElement('details');
                details.style.cssText =
                    'margin-top:9px;font-size:11px;color:#475569;';
                const summary = document.createElement('summary');
                summary.textContent = 'Advanced Details';
                summary.style.cssText =
                    'cursor:pointer;font-weight:600;color:#4338ca;';
                const technical = document.createElement('pre');
                technical.style.cssText =
                    'margin:8px 0 0;padding:9px;' +
                        'background:#f8fafc;border-radius:8px;' +
                        'white-space:pre-wrap;overflow-wrap:anywhere;' +
                        'font-size:10px;';
                const technicalResult = { ...item };
                delete technicalResult.code;
                technical.textContent = JSON.stringify(technicalResult, null, 2);
                details.append(summary, technical);
                card.append(name, score, parameterText, details);
                output.appendChild(card);
            });
        };
        cancelButton.addEventListener('click', async () => {
            if (!activeJobId)
                return;
            cancelButton.disabled = true;
            status.textContent = 'Cancellation requested...';
            try {
                await (0,_request__rspack_import_2.requestAPI)(`api/dataset/tuning-jobs/${activeJobId}/cancel`, settings, { method: 'POST' });
            }
            catch (error) {
                status.textContent =
                    `Cancellation request failed: ${String(error)}`;
                cancelButton.disabled = false;
            }
        });
        tuneButton.addEventListener('click', async () => {
            var _a, _b, _c, _d, _e, _f;
            if (busy || !isCurrent())
                return;
            busy = true;
            activeJobId = null;
            tuneButton.disabled = true;
            cancelButton.disabled = true;
            cancelButton.style.display = 'none';
            output.replaceChildren();
            modeSelect.disabled = true;
            const chosenLevel = modeSelect.value;
            status.textContent = `Submitting ${chosenLevel} tuning for Top 5...`;
            try {
                const submitted = await (0,_request__rspack_import_2.requestAPI)('api/dataset/tuning-jobs', settings, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        evaluation_job_id: evaluationJobId,
                        file_path: datasetPath,
                        target_column: targetColumn,
                        feature_columns: featureColumns,
                        task,
                        model_names: names,
                        time_budget_seconds: chosenLevel === 'advanced' ? 120 : 60,
                        level: chosenLevel
                    })
                });
                if (typeof (submitted === null || submitted === void 0 ? void 0 : submitted.job_id) !== 'string') {
                    throw new Error('Tuning job ID is missing.');
                }
                activeJobId = submitted.job_id;
                cancelButton.disabled = false;
                cancelButton.style.display = 'inline-flex';
                let terminal = false;
                for (let attempt = 0; attempt < 240; attempt++) {
                    if (!isCurrent()) {
                        status.textContent =
                            'Panel changed. Tuning continues on the server ' +
                                'unless it is cancelled or reaches its timeout.';
                        break;
                    }
                    const job = await (0,_request__rspack_import_2.requestAPI)(`api/dataset/tuning-jobs/${activeJobId}`, settings);
                    const jobStatus = String((_a = job === null || job === void 0 ? void 0 : job.status) !== null && _a !== void 0 ? _a : 'unknown');
                    status.textContent = `Fast tuning: ${jobStatus}`;
                    if (jobStatus === 'completed') {
                        terminal = true;
                        (0,_model_code_utils__rspack_import_4.resetTunedModelCode)(advisorModels);
                        printResult(job.result);
                        const codeSync = (0,_model_code_utils__rspack_import_4.applyTunedModelCode)(advisorModels, (_b = job.result) === null || _b === void 0 ? void 0 : _b.results);
                        status.textContent =
                            `Tuning finished: ${String((_d = (_c = job.result) === null || _c === void 0 ? void 0 : _c.models_completed) !== null && _d !== void 0 ? _d : 0)}/` +
                                `${names.length} models fully searched.` +
                                (((_e = job.result) === null || _e === void 0 ? void 0 : _e.timed_out) ? ' Time budget reached.' : '') +
                                ` ${codeSync.updated} Model Advisor card(s) now show tuning recommendations.` +
                                ' The "Insert into Notebook" button still inserts baseline code — apply the shown parameter changes manually!';
                        break;
                    }
                    if (['failed', 'cancelled', 'timed_out'].includes(jobStatus)) {
                        terminal = true;
                        status.textContent =
                            `Fast tuning ${jobStatus}: ` +
                                String((_f = job === null || job === void 0 ? void 0 : job.error) !== null && _f !== void 0 ? _f : '');
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                if (!terminal && isCurrent()) {
                    status.textContent =
                        'Tuning is taking longer than expected. ' +
                            'Check the job status before starting another run.';
                }
            }
            catch (error) {
                if (isCurrent()) {
                    status.textContent =
                        `Fast Tune error: ${String(error)}`;
                }
            }
            finally {
                busy = false;
                modeSelect.disabled = false;
                tuneButton.disabled = !isCurrent();
                cancelButton.disabled = true;
                cancelButton.style.display = 'none';
            }
        });
    }
    _buildModelCard(model, targetCol) {
        var _a, _b, _c, _d, _e, _f, _g;
        // ── Preserve baseline code at card build time ──
        // defaultCode is the ORIGINAL code from the API — never overwritten by tuning.
        // This must be set before any tuning occurs so getBaselineCode() always returns
        // the clean pre-tuning version regardless of what happens to model.code later.
        if (typeof model.defaultCode !== 'string' || !model.defaultCode.trim()) {
            model.defaultCode = typeof model.code === 'string' ? model.code : '';
        }
        const getBaselineCode = () => {
            const src = (typeof model.defaultCode === 'string' && model.defaultCode.trim())
                ? model.defaultCode
                : model.code;
            return typeof src === 'string' ? (0,_model_code_utils__rspack_import_4.removeModelAdvisorRaiseGuards)(src) : '';
        };
        const getTunedCode = () => {
            const src = (typeof model.tuned_code === 'string' && model.tuned_code.trim())
                ? model.tuned_code
                : (typeof model.code === 'string' ? model.code : model.defaultCode);
            return typeof src === 'string' ? (0,_model_code_utils__rspack_import_4.removeModelAdvisorRaiseGuards)(src) : '';
        };
        // The Model Advisor card always provides the clean baseline model code without tuning
        const getModelCode = () => getBaselineCode();
        const rankColors = {
            1: { bg: '#fef3c7', border: '#fde68a', text: '#b45309' },
            2: { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
            3: { bg: '#ffedd5', border: '#fed7aa', text: '#c2410c' }
        };
        const rankStyle = (_a = rankColors[model.rank]) !== null && _a !== void 0 ? _a : { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
        const scoreColor = model.score >= 85 ? '#059669' : model.score >= 70 ? '#d97706' : '#dc2626';
        const card = document.createElement('div');
        card.style.cssText = `
      border:1px solid ${model.rank === 1 ? '#fde047' : '#dfe3ea'};
      border-radius:12px; padding:16px; margin-bottom:12px;
      background:${model.rank === 1 ? '#fffdf0' : '#ffffff'};
      box-shadow: 0 1px 3px rgba(31, 41, 55, 0.04);
      position:relative;
    `;
        // ── Card header ──
        const cardHdr = document.createElement('div');
        cardHdr.style.cssText = 'display:flex; align-items:center; gap:10px; margin-bottom:12px;';
        cardHdr.innerHTML = `
      <span style="font-size:22px; line-height:1;">${model.medal}</span>
      <div style="flex:1;">
        <div style="font-size:14px; font-weight:800; display:flex; align-items:center; gap:8px; color:#1e293b;">
          ${model.name}
          ${model.rank <= 3 ? `<span style="font-size:9px; padding:2px 8px; border-radius:99px; background:${rankStyle.bg}; color:${rankStyle.text}; border:1px solid ${rankStyle.border}; font-weight:700;">RANK #${model.rank}</span>` : ''}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:5px;">
          ${((_b = model.tags) !== null && _b !== void 0 ? _b : []).map((t) => `<span style="font-size:9px; font-weight:600; padding:2px 8px; border-radius:99px; background:#eef2ff; border:1px solid #c7d2fe; color:#4338ca;">${t}</span>`).join('')}
        </div>
      </div>
      <div style="text-align:right; flex-shrink:0;">
        <div style="font-size:22px; font-weight:900; color:${scoreColor}; line-height:1;">${model.score}</div>
        <div style="font-size:9px; color:#64748b; font-weight:600;">/ 100</div>
      </div>
    `;
        card.appendChild(cardHdr);
        if (model.automl_measured) {
            const scoreBox = cardHdr.lastElementChild;
            if (scoreBox) {
                scoreBox.replaceChildren();
                const score = document.createElement('div');
                score.style.cssText =
                    'font-size:19px;font-weight:900;color:#059669;';
                const value = Number(model.measured_score);
                const isRegression = model.automl_task === 'regression';
                score.textContent = Number.isFinite(value)
                    ? isRegression
                        ? value.toFixed(4)
                        : `${(value * 100).toFixed(2)}%`
                    : 'N/A';
                const metric = document.createElement('div');
                metric.style.cssText =
                    'font-size:10px;color:#64748b;font-weight:600;';
                metric.textContent = isRegression
                    ? 'CV RMSE (lower is better)'
                    : 'CV balanced accuracy';
                scoreBox.append(score, metric);
            }
        }
        // ── Score bar ──
        const barWrap = document.createElement('div');
        barWrap.style.cssText = 'height:6px; border-radius:99px; background:#e2e8f0; margin-bottom:12px; overflow:hidden;';
        const barFill = document.createElement('div');
        barFill.style.cssText = `height:100%; width:${model.score}%; border-radius:99px; background:linear-gradient(90deg, ${scoreColor}aa, ${scoreColor});`;
        barWrap.appendChild(barFill);
        if (!model.automl_measured) {
            card.appendChild(barWrap);
        }
        // ── Why recommended ──
        const whyEl = document.createElement('div');
        whyEl.style.cssText = `
      font-size:11.5px; padding:10px 12px; border-radius:8px; margin-bottom:10px;
      background:#f0fdf4; border:1px solid #bbf7d0; color:#14532d; line-height:1.6; font-weight:500;
    `;
        whyEl.innerHTML = `<b style="color:#15803d; font-weight:700;">✅ Why this model:</b> <span style="color:#166534;">${model.why}</span>`;
        card.appendChild(whyEl);
        // ModelMind: optional ML dependency availability.
        // Keep model rank, score, code actions and existing UI unchanged.
        const dependency = model.dependency_status;
        if (dependency &&
            dependency.available === false &&
            typeof dependency.optional_dependency === 'string') {
            const warning = document.createElement('div');
            warning.style.cssText = `
        padding:10px 12px;
        margin-bottom:10px;
        border-radius:8px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        color:#9a3412;
        font-size:11px;
        line-height:1.6;
      `;
            const heading = document.createElement('div');
            heading.style.fontWeight = '700';
            heading.textContent = 'Optional ML package unavailable';
            const message = document.createElement('div');
            message.textContent =
                typeof dependency.message === 'string'
                    ? dependency.message
                    : 'This model requires an additional Python package.';
            const kernelNote = document.createElement('div');
            kernelNote.style.marginTop = '4px';
            kernelNote.textContent =
                'Availability is checked on the ModelMind server. ' +
                    'Your notebook kernel may use a different environment.';
            warning.appendChild(heading);
            warning.appendChild(message);
            warning.appendChild(kernelNote);
            if (Array.isArray(dependency.alternatives) &&
                dependency.alternatives.length > 0) {
                const alternatives = document.createElement('div');
                alternatives.style.marginTop = '6px';
                alternatives.textContent =
                    'Available-library alternatives to consider: ' +
                        dependency.alternatives
                            .filter((name) => typeof name === 'string')
                            .join(', ');
                warning.appendChild(alternatives);
            }
            card.appendChild(warning);
        }
        // ── Meta grid: speed, complexity, interpretability ──
        const metaGrid = document.createElement('div');
        metaGrid.style.cssText = 'display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:10px;';
        [
            ['Training Speed', (_c = model.training_speed) !== null && _c !== void 0 ? _c : '—'],
            ['Complexity', (_d = model.complexity) !== null && _d !== void 0 ? _d : '—'],
            ['Interpretability', (_e = model.interpretability) !== null && _e !== void 0 ? _e : '—'],
        ].forEach(([lbl, val]) => {
            const box = document.createElement('div');
            box.style.cssText = 'padding:8px 10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; font-size:10px;';
            box.innerHTML = `<div style="color:#64748b; font-size:9px; font-weight:600; text-transform:uppercase; margin-bottom:3px;">${lbl}</div><div style="font-weight:700; color:#0f172a;">${val}</div>`;
            metaGrid.appendChild(box);
        });
        card.appendChild(metaGrid);
        // ── Strengths & Weaknesses ──
        const swGrid = document.createElement('div');
        swGrid.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;';
        const strengthBox = document.createElement('div');
        strengthBox.style.cssText = 'padding:10px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0;';
        strengthBox.innerHTML = `
      <div style="font-size:10.5px; font-weight:700; color:#15803d; margin-bottom:6px;">✅ Strengths</div>
      ${((_f = model.strengths) !== null && _f !== void 0 ? _f : []).map((s) => `<div style="font-size:10px; color:#166534; margin-bottom:3px; line-height:1.4;">• ${s}</div>`).join('')}
    `;
        const weakBox = document.createElement('div');
        weakBox.style.cssText = 'padding:10px; border-radius:8px; background:#fef2f2; border:1px solid #fecaca;';
        weakBox.innerHTML = `
      <div style="font-size:10.5px; font-weight:700; color:#b91c1c; margin-bottom:6px;">⚠️ Weaknesses</div>
      ${((_g = model.weaknesses) !== null && _g !== void 0 ? _g : []).map((w) => `<div style="font-size:10px; color:#991b1b; margin-bottom:3px; line-height:1.4;">• ${w}</div>`).join('')}
    `;
        swGrid.append(strengthBox, weakBox);
        card.appendChild(swGrid);
        // ── Best for ──
        const bestFor = document.createElement('div');
        bestFor.style.cssText = 'font-size:11px; color:#475569; margin-bottom:12px; padding:7px 10px; border-radius:6px; background:#f8fafc; border:1px solid #e2e8f0; line-height:1.4;';
        bestFor.innerHTML = `<b style="color:#1e293b;">Best for:</b> ${model.best_for}`;
        card.appendChild(bestFor);
        // ── Code preview (collapsed by default) ──
        const codeSection = document.createElement('div');
        let codeVisible = false;
        const codeToggleBtn = document.createElement('button');
        codeToggleBtn.type = 'button';
        codeToggleBtn.className = 'mm-studio-btn mm-btn-sm';
        codeToggleBtn.innerHTML = '📄 Show Full Code';
        const codePre = document.createElement('pre');
        codePre.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:14px 16px; font-size:10.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:8px 0 0 0; white-space:pre; display:none;
    `;
        codePre.textContent = getModelCode() || '# No code available';
        codeToggleBtn.addEventListener('click', () => {
            codeVisible = !codeVisible;
            codePre.textContent = getModelCode() || '# No code available';
            codePre.style.display = codeVisible ? 'block' : 'none';
            codeToggleBtn.innerHTML = codeVisible ? '🔼 Hide Code' : '📄 Show Full Code';
        });
        codeSection.appendChild(codeToggleBtn);
        codeSection.appendChild(codePre);
        card.appendChild(codeSection);
        // ── Tuned Configuration Banner ──
        const tunedBanner = document.createElement('div');
        tunedBanner.style.cssText =
            'display:none; padding:10px 14px; border-radius:8px; margin-top:12px; ' +
                'background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; font-size:11.5px; line-height:1.5;';
        // ── Action buttons ──
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;';
        const previewBtn = document.createElement('button');
        previewBtn.type = 'button';
        previewBtn.className = 'mm-studio-btn mm-btn-sm';
        previewBtn.innerHTML = '🔍 Preview Code';
        previewBtn.addEventListener('click', () => {
            this._showCodePreviewModal(model.name + ' (Baseline)', getBaselineCode(), model.rank === 1 ? 'advanced' : model.rank === 2 ? 'medium' : 'basic');
        });
        const copyBtn2 = document.createElement('button');
        copyBtn2.type = 'button';
        copyBtn2.className = 'mm-studio-btn mm-btn-sm';
        copyBtn2.innerHTML = '📋 Copy Code';
        copyBtn2.addEventListener('click', async () => {
            await navigator.clipboard.writeText(getModelCode());
            copyBtn2.textContent = 'Copied!';
            setTimeout(() => { copyBtn2.innerHTML = '📋 Copy Code'; }, 1500);
        });
        const insertBtn2 = document.createElement('button');
        insertBtn2.type = 'button';
        insertBtn2.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        insertBtn2.innerHTML = '📥 Insert into Notebook';
        insertBtn2.title = 'Insert the clean baseline model code into your notebook';
        insertBtn2.addEventListener('click', () => {
            const ok = this._insertCodeBelow(getBaselineCode());
            this._showToast(ok
                ? `✓ ${model.name} baseline code inserted! (Ready for manual parameter changes)`
                : 'Open a notebook first.');
        });
        model.refreshCode = () => {
            const available = Boolean(getBaselineCode());
            codePre.textContent = getBaselineCode() || '# No code available';
            codeToggleBtn.disabled = !available;
            previewBtn.disabled = !available;
            copyBtn2.disabled = !available;
            insertBtn2.disabled = !available;
            if (model.tuned_configuration_applied) {
                card.style.borderColor = '#10b981';
                card.style.boxShadow = '0 0 0 1px #10b981, 0 3px 10px rgba(16, 185, 129, 0.12)';
                insertBtn2.innerHTML = '📥 Insert Baseline Code into Notebook';
                tunedBanner.replaceChildren();
                tunedBanner.style.display = 'block';
                const bannerHdr = document.createElement('div');
                bannerHdr.style.cssText =
                    'font-weight:700; color:#047857; margin-bottom:4px; display:flex; align-items:center; gap:6px; font-size:12px;';
                bannerHdr.innerHTML = '<span>⚡ Hyperparameter Tuning Recommendations:</span>';
                const changesList = document.createElement('div');
                changesList.style.cssText = 'font-size:11px; color:#14532d; margin-top:4px; line-height:1.6;';
                const formatVal = (v) => v === null ? 'None' : (typeof v === 'string' ? `"${v}"` : JSON.stringify(v));
                if (Array.isArray(model.tuned_changes) && model.tuned_changes.length > 0) {
                    model.tuned_changes.forEach((ch) => {
                        const itemEl = document.createElement('div');
                        itemEl.innerHTML = `• <b>${ch.parameter}</b>: change from <code>${formatVal(ch.default)}</code> → <code>${formatVal(ch.recommended)}</code>`;
                        changesList.appendChild(itemEl);
                    });
                }
                else if (model.tuned_params) {
                    Object.entries(model.tuned_params).forEach(([k, v]) => {
                        const itemEl = document.createElement('div');
                        itemEl.innerHTML = `• <b>${k}</b>: recommended value <code>${formatVal(v)}</code>`;
                        changesList.appendChild(itemEl);
                    });
                }
                const bannerNote = document.createElement('div');
                bannerNote.style.cssText = 'font-size:10.5px; color:#475569; margin-top:6px; line-height:1.4;';
                bannerNote.innerHTML =
                    '<b>Workflow:</b> <i>"Insert Baseline Code"</i> inserts the model code before tuning. ' +
                        'Run it first in your notebook, then manually change the parameter values as shown above to compare results!';
                const bannerActions = document.createElement('div');
                bannerActions.style.cssText = 'display:flex; gap:8px; margin-top:8px; align-items:center; flex-wrap:wrap;';
                const insertTunedDirectBtn = document.createElement('button');
                insertTunedDirectBtn.type = 'button';
                insertTunedDirectBtn.className = 'mm-studio-btn mm-btn-sm';
                insertTunedDirectBtn.style.cssText =
                    'background:#f0fdf4; border:1px solid #86efac; color:#15803d; font-weight:600; font-size:10.5px; cursor:pointer;';
                insertTunedDirectBtn.innerHTML = '⚡ Insert Already-Tuned Code Instead';
                insertTunedDirectBtn.addEventListener('click', () => {
                    const ok = this._insertCodeBelow(getTunedCode());
                    this._showToast(ok ? `✓ Tuned ${model.name} code inserted!` : 'Open a notebook first.');
                });
                bannerActions.append(insertTunedDirectBtn);
                tunedBanner.append(bannerHdr, changesList, bannerNote, bannerActions);
            }
            else {
                card.style.borderColor = model.rank === 1 ? '#fde047' : '#dfe3ea';
                card.style.boxShadow = '0 1px 3px rgba(31, 41, 55, 0.04)';
                insertBtn2.innerHTML = '📥 Insert into Notebook';
                tunedBanner.style.display = 'none';
                tunedBanner.replaceChildren();
            }
        };
        if (model.automl_measured && !model.code_available) {
            codeToggleBtn.disabled = true;
            previewBtn.disabled = true;
            copyBtn2.disabled = true;
            insertBtn2.disabled = true;
            const note = document.createElement('div');
            note.style.cssText =
                'font-size:11px;color:#b45309;margin-top:8px;';
            note.textContent =
                model.code_error || 'Executable code is unavailable.';
            card.appendChild(note);
        }
        btnRow.append(previewBtn, copyBtn2, insertBtn2);
        card.append(tunedBanner, btnRow);
        // Initialize display state
        model.refreshCode();
        return card;
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 5: ⚗️ MODEL VISUALIZATION LAB
    // ═════════════════════════════════════════════════════════════════
    _renderModelLabTab() {
        const frag = document.createDocumentFragment();
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-section';
        hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>⚗️</span> Model Visualization Lab</div>
      <div class="mm-studio-sec-sub">Interactive visualizers for foundational machine learning algorithms.</div>
    `;
        frag.appendChild(hdr);
        // Sub-nav for models
        const modelNav = document.createElement('div');
        modelNav.className = 'mm-studio-level-row';
        const models = [
            { id: 'gd', label: '📉 Gradient Descent' },
            { id: 'tree', label: '🌳 Decision Tree' },
            { id: 'knn', label: '🔵 KNN' },
            { id: 'kmeans', label: '🔮 K-Means' },
            { id: 'pca', label: '📐 PCA' },
        ];
        let selectedModel = 'gd';
        const modelContainer = document.createElement('div');
        modelContainer.className = 'mm-lab-model-container';
        models.forEach(m => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `mm-level-pill ${m.id === selectedModel ? 'active' : ''}`;
            b.textContent = m.label;
            b.addEventListener('click', () => {
                selectedModel = m.id;
                modelNav.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                b.classList.add('active');
                this._renderSelectedModel(modelContainer, selectedModel);
            });
            modelNav.appendChild(b);
        });
        frag.appendChild(modelNav);
        frag.appendChild(modelContainer);
        this._contentArea.appendChild(frag);
        this._renderSelectedModel(modelContainer, selectedModel);
    }
    _renderSelectedModel(container, modelId) {
        container.replaceChildren();
        if (modelId === 'gd') {
            this._renderGradientDescentLab(container);
        }
        else if (modelId === 'tree') {
            this._renderDecisionTreeLab(container);
        }
        else if (modelId === 'knn') {
            this._renderKNNLab(container);
        }
        else if (modelId === 'kmeans') {
            this._renderKMeansLab(container);
        }
        else if (modelId === 'pca') {
            this._renderPCALab(container);
        }
    }
    // 1. Gradient Descent Interactive Simulator
    _renderGradientDescentLab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        // State
        let w = 0.1;
        let b = 0.5;
        let lr = 0.05;
        let epoch = 0;
        let isRunning = false;
        let timer = null;
        // Fixed dummy data points for regression: y = 2x + 1 + noise
        const dataPoints = [
            { x: 0.1, y: 1.1 }, { x: 0.2, y: 1.5 }, { x: 0.3, y: 1.6 },
            { x: 0.4, y: 1.9 }, { x: 0.5, y: 2.1 }, { x: 0.6, y: 2.2 },
            { x: 0.7, y: 2.6 }, { x: 0.8, y: 2.7 }, { x: 0.9, y: 2.9 }
        ];
        const lossHistory = [];
        const computeLoss = (weight, bias) => {
            let sum = 0;
            dataPoints.forEach(p => {
                const pred = weight * p.x + bias;
                sum += Math.pow(pred - p.y, 2);
            });
            return sum / dataPoints.length;
        };
        const stepGD = () => {
            let gradW = 0;
            let gradB = 0;
            const n = dataPoints.length;
            dataPoints.forEach(p => {
                const diff = (w * p.x + b) - p.y;
                gradW += (2 / n) * diff * p.x;
                gradB += (2 / n) * diff;
            });
            w -= lr * gradW;
            b -= lr * gradB;
            epoch++;
            lossHistory.push(computeLoss(w, b));
            updateView();
        };
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Gradient Descent Regression Simulator</span>
        <span class="mm-studio-badge badge-num">Optimization</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Watch the regression line fit the data and loss minimize step-by-step.</div>

      <!-- Controls -->
      <div class="mm-lab-controls">
        <label class="mm-lab-ctrl-row">
          <span>Learning Rate (α): <b id="gd-lr-val">${lr}</b></span>
          <input type="range" id="gd-lr" min="0.01" max="0.2" step="0.01" value="${lr}" />
        </label>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="gd-play">▶ Play</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-step">⏭ Step</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-reset">🔄 Reset</button>
        </div>
      </div>

      <!-- Live metrics -->
      <div class="mm-studio-stats-grid" style="margin-top:10px;">
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-epoch">0</div><div class="mm-stat-lbl">Epoch</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-w">0.10</div><div class="mm-stat-lbl">Weight (w)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-b">0.50</div><div class="mm-stat-lbl">Bias (b)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-loss" style="color:#f87171;">—</div><div class="mm-stat-lbl">MSE Loss</div></div>
      </div>

      <!-- Canvas for Plot -->
      <div style="margin-top:12px; border:1px solid #dfe3ea; border-radius:8px; overflow:hidden; background:#ffffff; padding:8px;">
        <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Regression Line & Data Points</div>
        <svg id="gd-canvas" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `;
        container.appendChild(wrap);
        const svg = wrap.querySelector('#gd-canvas');
        const epochEl = wrap.querySelector('#gd-epoch');
        const wEl = wrap.querySelector('#gd-w');
        const bEl = wrap.querySelector('#gd-b');
        const lossEl = wrap.querySelector('#gd-loss');
        const lrInput = wrap.querySelector('#gd-lr');
        const lrVal = wrap.querySelector('#gd-lr-val');
        const playBtn = wrap.querySelector('#gd-play');
        const stepBtn = wrap.querySelector('#gd-step');
        const resetBtn = wrap.querySelector('#gd-reset');
        lrInput.addEventListener('input', () => {
            lr = parseFloat(lrInput.value);
            lrVal.textContent = lr.toFixed(2);
        });
        const updateView = () => {
            epochEl.textContent = String(epoch);
            wEl.textContent = w.toFixed(2);
            bEl.textContent = b.toFixed(2);
            const curLoss = computeLoss(w, b);
            lossEl.textContent = curLoss.toFixed(4);
            // Render SVG
            const wPx = 300;
            const hPx = 160;
            const pad = 24;
            const scaleX = (x) => pad + x * (wPx - pad * 2);
            const scaleY = (y) => hPx - pad - (y / 3.5) * (hPx - pad * 2);
            let svgHtml = `
        <line x1="${pad}" y1="${hPx - pad}" x2="${wPx - pad}" y2="${hPx - pad}" stroke="#334155" stroke-width="1"/>
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${hPx - pad}" stroke="#334155" stroke-width="1"/>
      `;
            // Data points
            dataPoints.forEach(p => {
                svgHtml += `<circle cx="${scaleX(p.x)}" cy="${scaleY(p.y)}" r="4" fill="#818cf8"/>`;
            });
            // Fitted Line
            const y0 = w * 0 + b;
            const y1 = w * 1.0 + b;
            svgHtml += `
        <line x1="${scaleX(0)}" y1="${scaleY(y0)}" x2="${scaleX(1.0)}" y2="${scaleY(y1)}"
          stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
      `;
            svg.innerHTML = svgHtml;
        };
        stepBtn.addEventListener('click', () => stepGD());
        playBtn.addEventListener('click', () => {
            isRunning = !isRunning;
            playBtn.textContent = isRunning ? '⏸ Pause' : '▶ Play';
            playBtn.className = isRunning ? 'mm-studio-btn mm-btn-sm mm-btn-accent' : 'mm-studio-btn mm-btn-sm mm-btn-primary';
            if (isRunning) {
                timer = setInterval(() => {
                    if (epoch >= 100) {
                        clearInterval(timer);
                        isRunning = false;
                        playBtn.textContent = '▶ Play';
                        return;
                    }
                    stepGD();
                }, 100);
            }
            else {
                clearInterval(timer);
            }
        });
        resetBtn.addEventListener('click', () => {
            clearInterval(timer);
            isRunning = false;
            playBtn.textContent = '▶ Play';
            w = 0.1;
            b = 0.5;
            epoch = 0;
            lossHistory.length = 0;
            updateView();
        });
        updateView();
    }
    // 2. Decision Tree Visualizer
    _renderDecisionTreeLab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Decision Tree Node Split Visualizer</span>
        <span class="mm-studio-badge badge-cat">Classification</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Visualize how a tree splits data on features to minimize impurity.</div>

      <div class="mm-tree-diagram">
        <div class="mm-tree-node root">
          <div class="mm-node-title">Root Node [Petal Length ≤ 2.45]</div>
          <div class="mm-node-meta">Gini = 0.667 • Samples = 150</div>
        </div>
        <div class="mm-tree-branches">
          <div class="mm-tree-branch">
            <div class="mm-branch-label">True</div>
            <div class="mm-tree-node leaf leaf-a">
              <div class="mm-node-title">Setosa (Class 0)</div>
              <div class="mm-node-meta">Gini = 0.0 • Samples = 50</div>
            </div>
          </div>
          <div class="mm-tree-branch">
            <div class="mm-branch-label">False</div>
            <div class="mm-tree-node internal">
              <div class="mm-node-title">[Petal Width ≤ 1.75]</div>
              <div class="mm-node-meta">Gini = 0.50 • Samples = 100</div>
              <div class="mm-tree-subbranches">
                <div class="mm-tree-node leaf leaf-b">Versicolor (49/5)</div>
                <div class="mm-tree-node leaf leaf-c">Virginica (1/45)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
        container.appendChild(wrap);
    }
    // 3. KNN Visualizer
    _renderKNNLab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>k-Nearest Neighbors (KNN) 2D Space</span>
        <span class="mm-studio-badge badge-cat">Instance-Based</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Click anywhere on the 2D grid to predict its class using k nearest neighbors.</div>

      <label class="mm-lab-ctrl-row">
        <span>k Neighbors: <b id="knn-k-val">3</b></span>
        <input type="range" id="knn-k" min="1" max="9" step="2" value="3" />
      </label>

      <div style="margin-top:10px; border:1px solid #dfe3ea; border-radius:8px; background:#ffffff; overflow:hidden;">
        <svg id="knn-svg" viewBox="0 0 300 180" style="width:100%; height:180px; display:block; cursor:crosshair;"></svg>
      </div>
      <div id="knn-pred-box" style="margin-top:8px; font-size:11px; font-weight:700; text-align:center; color:#0284c7;">
        Click the plot to classify a query point!
      </div>
    `;
        container.appendChild(wrap);
        const svg = wrap.querySelector('#knn-svg');
        const kInput = wrap.querySelector('#knn-k');
        const kVal = wrap.querySelector('#knn-k-val');
        const predBox = wrap.querySelector('#knn-pred-box');
        let k = 3;
        let queryPt = { x: 150, y: 90 };
        const classA = [
            { x: 50, y: 50 }, { x: 70, y: 70 }, { x: 80, y: 40 }, { x: 100, y: 60 }, { x: 90, y: 90 }, { x: 60, y: 110 }
        ];
        const classB = [
            { x: 220, y: 130 }, { x: 240, y: 150 }, { x: 210, y: 160 }, { x: 200, y: 120 }, { x: 250, y: 110 }, { x: 180, y: 140 }
        ];
        const draw = () => {
            let svgContent = '';
            classA.forEach(p => {
                svgContent += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#38bdf8" />`;
            });
            classB.forEach(p => {
                svgContent += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#f59e0b" />`;
            });
            if (queryPt) {
                // Compute distances
                const all = [
                    ...classA.map(p => ({ ...p, cls: 'Class A (Blue)' })),
                    ...classB.map(p => ({ ...p, cls: 'Class B (Amber)' }))
                ];
                all.sort((a, b) => {
                    const d1 = Math.hypot(a.x - queryPt.x, a.y - queryPt.y);
                    const d2 = Math.hypot(b.x - queryPt.x, b.y - queryPt.y);
                    return d1 - d2;
                });
                const neighbors = all.slice(0, k);
                const maxDist = Math.hypot(neighbors[neighbors.length - 1].x - queryPt.x, neighbors[neighbors.length - 1].y - queryPt.y);
                // Dashed circle
                svgContent += `<circle cx="${queryPt.x}" cy="${queryPt.y}" r="${maxDist}" fill="none" stroke="#a78bfa" stroke-dasharray="4" stroke-width="1.5"/>`;
                // Lines to neighbors
                neighbors.forEach(n => {
                    svgContent += `<line x1="${queryPt.x}" y1="${queryPt.y}" x2="${n.x}" y2="${n.y}" stroke="#a78bfa" stroke-width="1" opacity="0.6"/>`;
                });
                // Query point
                svgContent += `<circle cx="${queryPt.x}" cy="${queryPt.y}" r="6" fill="#ec4899" stroke="#fff" stroke-width="2"/>`;
                // Majority vote
                const countA = neighbors.filter(n => n.cls.includes('Class A')).length;
                const countB = k - countA;
                const winner = countA > countB ? 'Class A (Blue)' : 'Class B (Amber)';
                predBox.innerHTML = `Predicted: <span style="color:${countA > countB ? '#38bdf8' : '#f59e0b'}">${winner}</span> (${countA} vs ${countB} votes)`;
            }
            svg.innerHTML = svgContent;
        };
        kInput.addEventListener('input', () => {
            k = parseInt(kInput.value);
            kVal.textContent = String(k);
            draw();
        });
        svg.addEventListener('click', (e) => {
            const rect = svg.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 300;
            const y = ((e.clientY - rect.top) / rect.height) * 180;
            queryPt = { x, y };
            draw();
        });
        draw();
    }
    // 4. K-Means Clustering Visualizer
    _renderKMeansLab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>K-Means Clustering Simulator</span>
        <span class="mm-studio-badge badge-num">Clustering</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Iteratively update cluster centroids to minimize within-cluster variance.</div>
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="km-step">Step Centroids</button>
        <button type="button" class="mm-studio-btn mm-btn-sm" id="km-reset">Reset</button>
      </div>
      <div style="border:1px solid #dfe3ea; border-radius:8px; background:#ffffff; overflow:hidden;">
        <svg id="km-svg" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `;
        container.appendChild(wrap);
        const svg = wrap.querySelector('#km-svg');
        const stepBtn = wrap.querySelector('#km-step');
        const resetBtn = wrap.querySelector('#km-reset');
        const points = [
            { x: 40, y: 40 }, { x: 50, y: 60 }, { x: 60, y: 35 }, { x: 70, y: 65 }, { x: 80, y: 50 },
            { x: 220, y: 120 }, { x: 230, y: 140 }, { x: 240, y: 110 }, { x: 250, y: 135 }, { x: 210, y: 130 },
            { x: 140, y: 90 }, { x: 150, y: 110 }, { x: 160, y: 85 }
        ];
        let centroids = [
            { x: 50, y: 120, color: '#38bdf8' },
            { x: 200, y: 50, color: '#f59e0b' }
        ];
        const drawKM = () => {
            let svgHtml = '';
            points.forEach(p => {
                // Assign to nearest centroid
                const d0 = Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y);
                const d1 = Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y);
                const col = d0 < d1 ? centroids[0].color : centroids[1].color;
                svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${col}" opacity="0.8"/>`;
            });
            // Centroids as glowing crosses
            centroids.forEach(c => {
                svgHtml += `
          <line x1="${c.x - 6}" y1="${c.y - 6}" x2="${c.x + 6}" y2="${c.y + 6}" stroke="${c.color}" stroke-width="3"/>
          <line x1="${c.x - 6}" y1="${c.y + 6}" x2="${c.x + 6}" y2="${c.y - 6}" stroke="${c.color}" stroke-width="3"/>
        `;
            });
            svg.innerHTML = svgHtml;
        };
        stepBtn.addEventListener('click', () => {
            // Recompute means
            const cluster0 = points.filter(p => Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y) <= Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y));
            const cluster1 = points.filter(p => Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y) > Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y));
            if (cluster0.length > 0) {
                centroids[0].x = cluster0.reduce((s, p) => s + p.x, 0) / cluster0.length;
                centroids[0].y = cluster0.reduce((s, p) => s + p.y, 0) / cluster0.length;
            }
            if (cluster1.length > 0) {
                centroids[1].x = cluster1.reduce((s, p) => s + p.x, 0) / cluster1.length;
                centroids[1].y = cluster1.reduce((s, p) => s + p.y, 0) / cluster1.length;
            }
            drawKM();
        });
        resetBtn.addEventListener('click', () => {
            centroids = [
                { x: 50, y: 120, color: '#38bdf8' },
                { x: 200, y: 50, color: '#f59e0b' }
            ];
            drawKM();
        });
        drawKM();
    }
    // 5. PCA Visualizer
    _renderPCALab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Principal Component Analysis (PCA)</span>
        <span class="mm-studio-badge badge-num">Dim Reduction</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Projects high-dimensional data onto orthogonal axes of maximum variance.</div>

      <div style="font-size:11px; font-weight:600; margin-bottom:6px;">Variance Explained Ratio (Scree Plot):</div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 1 (First Component)</span><span>72.8%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:72.8%; background:#818cf8;"></div></div>
      </div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 2 (Second Component)</span><span>21.4%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:21.4%; background:#38bdf8;"></div></div>
      </div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 3 (Residual)</span><span>5.8%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:5.8%; background:#64748b;"></div></div>
      </div>
    `;
        container.appendChild(wrap);
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 6: ⚠️ ML INSPECTOR (MISTAKE DETECTOR)
    // ═════════════════════════════════════════════════════════════════
    _renderInspectorTab() {
        const frag = document.createDocumentFragment();
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-section';
        hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>⚠️</span> ML Code Inspector & Leakage Checker</div>
      <div class="mm-studio-sec-sub">Scans code for data leakage, invalid scaling order, and ML anti-patterns.</div>
    `;
        const codeArea = document.createElement('textarea');
        codeArea.className = 'mm-inspector-textarea';
        codeArea.placeholder = 'Paste or scan Python ML code here...';
        // Auto-populate from active cell if available
        const activeCell = this._notebooks.activeCell;
        if (activeCell && (0,_jupyterlab_cells__rspack_import_1.isCodeCellModel)(activeCell.model)) {
            const src = activeCell.model.toJSON().source;
            codeArea.value = Array.isArray(src) ? src.join('') : src;
        }
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex; gap:8px; margin-top:8px;';
        const scanActiveBtn = document.createElement('button');
        scanActiveBtn.type = 'button';
        scanActiveBtn.className = 'mm-studio-btn mm-btn-sm';
        scanActiveBtn.innerHTML = '⚡ Fetch Active Cell';
        scanActiveBtn.addEventListener('click', () => {
            const cell = this._notebooks.activeCell;
            if (cell && (0,_jupyterlab_cells__rspack_import_1.isCodeCellModel)(cell.model)) {
                const src = cell.model.toJSON().source;
                codeArea.value = Array.isArray(src) ? src.join('') : src;
                this._showToast('Fetched active cell code.');
            }
            else {
                this._showToast('Select an active code cell first.');
            }
        });
        const checkBtn = document.createElement('button');
        checkBtn.type = 'button';
        checkBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        checkBtn.innerHTML = '🔍 Scan for ML Mistakes';
        btnRow.append(scanActiveBtn, checkBtn);
        hdr.append(codeArea, btnRow);
        frag.appendChild(hdr);
        const resultContainer = document.createElement('div');
        resultContainer.className = 'mm-inspector-results';
        frag.appendChild(resultContainer);
        checkBtn.addEventListener('click', async () => {
            const code = codeArea.value.trim();
            if (!code) {
                resultContainer.innerHTML = '<div class="mm-studio-empty">Enter code to scan.</div>';
                return;
            }
            resultContainer.innerHTML = '<div class="mm-studio-loading">Inspecting AST for ML anti-patterns...</div>';
            try {
                const res = await (0,_request__rspack_import_2.requestAPI)('api/ai/ml-check', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, level: this._prepLevel })
                });
                resultContainer.replaceChildren();
                if (res.finding_count === 0) {
                    resultContainer.innerHTML = `
            <div class="mm-studio-alert mm-alert-info">
              ✅ <b>Clean Code:</b> No data leakage or critical ML methodology flaws detected!
            </div>
          `;
                    return;
                }
                const countHeader = document.createElement('div');
                countHeader.style.cssText = 'font-weight:700; font-size:12px; margin-bottom:8px; color:#f87171;';
                countHeader.textContent = `Found ${res.finding_count} potential ML mistake(s):`;
                resultContainer.appendChild(countHeader);
                res.findings.forEach(f => {
                    const card = document.createElement('div');
                    card.className = 'mm-studio-card mm-mistake-card';
                    const sevColor = f.severity === 'high' ? '#ef4444' : '#f59e0b';
                    const msg = f.message || f.what_happened || '';
                    const expl = f.explanation || f.why_it_matters || f.recommendation || '';
                    const fix = f.suggested_fix || f.code_example || '';
                    card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-weight:700; font-size:12px; color:${sevColor};">${f.title}</span>
              <span class="mm-studio-badge" style="background:${sevColor}22; color:${sevColor}; border:1px solid ${sevColor}44;">
                ${f.severity.toUpperCase()}
              </span>
            </div>
            ${f.line_number ? `<div style="font-size:10px; opacity:.6; margin-bottom:4px;">Line: ${f.line_number}</div>` : ''}
            <div style="font-size:11px; margin-bottom:6px;">${msg}</div>
            ${expl ? `<div style="font-size:11px; opacity:.85; background:rgba(0,0,0,0.25); padding:6px 8px; border-radius:6px; font-family:monospace; margin-bottom:8px; line-height:1.4;">${expl}</div>` : ''}
          `;
                    if (fix) {
                        const insBtn = document.createElement('button');
                        insBtn.type = 'button';
                        insBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
                        insBtn.textContent = '📥 Insert Fixed Code';
                        insBtn.addEventListener('click', () => {
                            this._insertCodeBelow(fix);
                            this._showToast('Inserted corrected code into notebook!');
                        });
                        card.appendChild(insBtn);
                    }
                    resultContainer.appendChild(card);
                });
            }
            catch (err) {
                resultContainer.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Check failed.'}</div>`;
            }
        });
        this._contentArea.appendChild(frag);
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 7: 📖 PREPROCESSING & ML GUIDE
    // ═════════════════════════════════════════════════════════════════
    _renderGuideTab() {
        const frag = document.createDocumentFragment();
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-section';
        hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>📖</span> Preprocessing & ML Handbook</div>
      <div class="mm-studio-sec-sub">Essential guides and best practices for robust data preparation.</div>
    `;
        frag.appendChild(hdr);
        const installCard = document.createElement('section');
        installCard.className = 'mm-studio-card';
        installCard.setAttribute('aria-labelledby', 'mm-guide-install-title');
        const installTitle = document.createElement('div');
        installTitle.id = 'mm-guide-install-title';
        installTitle.className = 'mm-studio-sec-title';
        installTitle.textContent = '📦 Install ML Libraries';
        const installDescription = document.createElement('div');
        installDescription.className = 'mm-studio-sec-sub';
        installDescription.style.marginTop = '0';
        installDescription.textContent =
            'Copy this single command into a notebook code cell and run it to install the libraries in the active notebook kernel. Internet access is required; installation may take a while.';
        const installCommand = '%pip install numpy pandas scipy scikit-learn xgboost lightgbm catboost imbalanced-learn statsmodels joblib matplotlib seaborn plotly shap optuna';
        const installCode = document.createElement('pre');
        installCode.style.cssText =
            'background:#f8fafc;border:1px solid #dfe3ea;border-radius:8px;' +
                'padding:10px 12px;margin:0;overflow-x:auto;white-space:pre;' +
                'font:11px/1.6 ui-monospace,SFMono-Regular,monospace;color:#1e293b;';
        installCode.textContent = installCommand;
        const copyInstallButton = document.createElement('button');
        copyInstallButton.type = 'button';
        copyInstallButton.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        copyInstallButton.textContent = '📋 Copy install command';
        copyInstallButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(installCommand);
                copyInstallButton.textContent = 'Copied!';
                this._showToast('✓ Install command copied. Paste it into a notebook cell.');
                window.setTimeout(() => {
                    copyInstallButton.textContent = '📋 Copy install command';
                }, 1800);
            }
            catch (_a) {
                this._showToast('Could not access the clipboard. Select and copy the command above.');
            }
        });
        const installActions = document.createElement('div');
        installActions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
        installActions.appendChild(copyInstallButton);
        const insertInstallButton = document.createElement('button');
        insertInstallButton.type = 'button';
        insertInstallButton.className = 'mm-studio-btn mm-btn-sm';
        insertInstallButton.textContent = '📥 Insert into notebook';
        insertInstallButton.addEventListener('click', () => {
            const inserted = this._insertCodeBelow(installCommand);
            this._showToast(inserted
                ? '✓ Install command inserted below the active cell. Run that cell to install the libraries.'
                : 'Open a notebook and select a cell before inserting the install command.');
        });
        installActions.appendChild(insertInstallButton);
        installCard.append(installTitle, installDescription, installCode, installActions);
        frag.appendChild(installCard);
        const guides = [
            {
                title: '1. Handling Missing Data (Imputation)',
                emoji: '🩹',
                content: `
          • <b>MCAR (Missing Completely at Random):</b> Safe to drop if < 5% or use Mean/Median.<br/>
          • <b>MAR (Missing at Random):</b> Impute using KNN or IterativeImputer conditioned on other features.<br/>
          • <b>MNAR (Missing Not at Random):</b> Create a missingness indicator column before imputing.<br/>
          • <b>Rule of Thumb:</b> Use Median over Mean when data is skewed or contains outliers.
        `
            },
            {
                title: '2. Categorical Encoding Guide',
                emoji: '🏷️',
                content: `
          • <b>One-Hot Encoding:</b> Best for nominal data with low cardinality (< 10 unique values). Always set <code>handle_unknown='ignore'</code> for test data!<br/>
          • <b>Ordinal Encoding:</b> Use only when natural ranking exists (e.g. Low, Medium, High).<br/>
          • <b>Target / Frequency Encoding:</b> Best for high-cardinality features. Always compute inside CV loops to avoid leakage!
        `
            },
            {
                title: '3. Feature Scaling & Normalization',
                emoji: '⚖️',
                content: `
          • <b>StandardScaler:</b> Transforms features to mean=0, std=1. Essential for Logistic Regression, SVM, KNN, Neural Networks.<br/>
          • <b>RobustScaler:</b> Uses median and IQR. Best when features have extreme outliers.<br/>
          • <b>MinMaxScaler:</b> Bounds features strictly to [0, 1]. Best for image pixels or neural activations.<br/>
          • <b>Tree Models:</b> Random Forest and XGBoost do NOT require feature scaling.
        `
            },
            {
                title: '4. Outlier Detection & Treatment',
                emoji: '🎯',
                content: `
          • <b>IQR Rule:</b> Points outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR] are potential outliers.<br/>
          • <b>Capping / Winsorization:</b> Clip values to 1st and 99th percentiles rather than deleting rows to preserve sample size.
        `
            },
            {
                title: '5. Preventing Data Leakage Checklist',
                emoji: '🛡️',
                content: `
          • Always call <code>train_test_split</code> BEFORE fitting any Scaler or Imputer!<br/>
          • Fit transformers on training data only (<code>fit_transform</code>), then only <code>transform</code> the test data.<br/>
          • Never include the target variable in feature matrices.
        `
            }
        ];
        guides.forEach(g => {
            const card = document.createElement('div');
            card.className = 'mm-studio-card mm-guide-card';
            card.innerHTML = `
        <div class="mm-guide-hdr">
          <span>${g.emoji} ${g.title}</span>
        </div>
        <div class="mm-guide-body">${g.content}</div>
      `;
            frag.appendChild(card);
        });
        this._contentArea.appendChild(frag);
    }
    // ═════════════════════════════════════════════════════════════════
    // UTILITIES: INSERT CODE & TOAST
    // ═════════════════════════════════════════════════════════════════
    _insertPreprocessingCode(code) {
        const current = this._notebooks.currentWidget;
        if (!(current === null || current === void 0 ? void 0 : current.content)) {
            this._showToast('Open a notebook first.');
            return false;
        }
        return this._insertCodeBelow(code);
    }
    _insertCodeBelow(code) {
        const current = this._notebooks.currentWidget;
        if (!current)
            return false;
        const notebook = current.content;
        if (!(notebook === null || notebook === void 0 ? void 0 : notebook.model))
            return false;
        const insertedIndex = notebook.activeCell
            ? notebook.activeCellIndex + 1
            : notebook.model.cells.length;
        notebook.model.sharedModel.insertCell(insertedIndex, {
            cell_type: 'code',
            source: code,
            metadata: { trusted: true }
        });
        notebook.activeCellIndex = insertedIndex;
        return true;
    }
    _createStatCard(lbl, val, status = 'default') {
        const box = document.createElement('div');
        box.className = 'mm-stat-box';
        const valEl = document.createElement('div');
        valEl.className = 'mm-stat-val';
        if (status === 'warn')
            valEl.style.color = '#f87171';
        if (status === 'ok')
            valEl.style.color = '#34d399';
        valEl.textContent = String(val);
        const lblEl = document.createElement('div');
        lblEl.className = 'mm-stat-lbl';
        lblEl.textContent = lbl;
        box.append(valEl, lblEl);
        return box;
    }
    _showToast(msg) {
        const t = document.createElement('div');
        t.className = 'mm-studio-toast';
        t.textContent = msg;
        this._root.appendChild(t);
        setTimeout(() => {
            t.classList.add('fade-out');
            setTimeout(() => t.remove(), 400);
        }, 2200);
    }
}
function createModelMindStudioWidget(app, notebooks) {
    return new ModelMindStudioWidget(app, notebooks);
}


},
"./lib/preprocessing-code-utils.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  buildFullPreprocessingCode: () => (buildFullPreprocessingCode)
});
function buildFullPreprocessingCode(selectedPath, rec, selectedStrategy) {
    var _a;
    const datasetPath = JSON.stringify(selectedPath);
    const extension = (_a = selectedPath.split(/[?#]/, 1)[0].split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const reader = extension === 'xlsx' || extension === 'xls'
        ? 'read_excel'
        : extension === 'json'
            ? 'read_json'
            : 'read_csv';
    const imports = new Set(['import pandas as pd']);
    let strategy = selectedStrategy;
    if (strategy === 'most_frequent_or_unknown') {
        strategy = 'most_frequent';
    }
    const featureName = JSON.stringify(rec.feature);
    const featureAccess = `df[${featureName}]`;
    let operation;
    switch (strategy) {
        case 'mean':
        case 'median':
            operation = [
                `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
                `${featureAccess} = ${featureAccess}.fillna(${featureAccess}.${strategy}())`
            ].join('\n');
            break;
        case 'most_frequent':
            operation = [
                `mode = ${featureAccess}.mode(dropna=True)`,
                `fill_value = mode.iloc[0] if not mode.empty else "Unknown"`,
                `${featureAccess} = ${featureAccess}.fillna(fill_value)`
            ].join('\n');
            break;
        case 'unknown':
            operation = `${featureAccess} = ${featureAccess}.fillna("Unknown")`;
            break;
        case 'constant':
            operation = [
                ...(rec.feature_type === 'numerical'
                    ? [`${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`]
                    : []),
                `${featureAccess} = ${featureAccess}.fillna(${rec.feature_type === 'numerical' ? '0' : '"Unknown"'})`
            ].join('\n');
            break;
        case 'drop_column':
            operation = `df = df.drop(columns=[${featureName}])`;
            break;
        case 'standard_scaler':
        case 'minmax_scaler':
        case 'robust_scaler': {
            const scaler = {
                standard_scaler: 'StandardScaler',
                minmax_scaler: 'MinMaxScaler',
                robust_scaler: 'RobustScaler'
            }[strategy];
            imports.add(`from sklearn.preprocessing import ${scaler}`);
            operation = [
                `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
                `${featureAccess} = ${featureAccess}.fillna(${featureAccess}.median())`,
                `df[[${featureName}]] = ${scaler}().fit_transform(df[[${featureName}]])`
            ].join('\n');
            break;
        }
        case 'cap_outliers_iqr':
            operation = [
                `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
                `q1 = ${featureAccess}.quantile(0.25)`,
                `q3 = ${featureAccess}.quantile(0.75)`,
                'iqr = q3 - q1',
                `${featureAccess} = ${featureAccess}.clip(lower=q1 - 1.5 * iqr, upper=q3 + 1.5 * iqr)`
            ].join('\n');
            break;
        case 'one_hot_encode':
            operation = [
                `${featureAccess} = ${featureAccess}.fillna("Unknown")`,
                `df = pd.get_dummies(df, columns=[${featureName}], prefix=[${featureName}], dtype=int)`
            ].join('\n');
            break;
        case 'ordinal_encode':
            operation = `${featureAccess} = ${featureAccess}.fillna("Unknown").astype("category").cat.codes`;
            break;
        case 'frequency_encode':
            operation = [
                `${featureAccess} = ${featureAccess}.fillna("Unknown")`,
                `frequencies = ${featureAccess}.value_counts(normalize=True)`,
                `${featureAccess} = ${featureAccess}.map(frequencies)`
            ].join('\n');
            break;
        default:
            operation = `# No transformation is needed for ${featureName}.`;
    }
    return [
        '# Complete preprocessing workflow for the analyzed dataset',
        ...Array.from(imports),
        '',
        `df = pd.${reader}(${datasetPath})`,
        'print(f"Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")',
        '',
        '# Apply preprocessing only to the selected column',
        operation,
        '',
        '# Check the result',
        'print(f"Dataset shape after preprocessing: {df.shape}")',
        `print("Missing values remaining in " + ${featureName} + ": " + str(${featureAccess}.isna().sum()) if ${featureName} in df.columns else "Selected column was dropped.")`,
        '',
        '# Preview only the selected column or its encoded output columns',
        ...(strategy === 'one_hot_encode'
            ? [`print(df.loc[:, [column for column in df.columns if column == ${featureName} or column.startswith(${JSON.stringify(`${rec.feature}_`)})]].head())`]
            : strategy === 'drop_column'
                ? ['print("Selected column was dropped as requested.")']
                : [`print(df[[${featureName}]].head())`]),
    ].join('\n');
}


},
"./lib/request.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  requestAPI: () => (requestAPI)
});
/* import */ var _jupyterlab_coreutils__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/coreutils");
/* import */ var _jupyterlab_coreutils__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_coreutils__rspack_import_0);
/* import */ var _jupyterlab_services__rspack_import_1 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/services");
/* import */ var _jupyterlab_services__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_services__rspack_import_1);


/**
 * Call the server extension
 *
 * @param endPoint API REST endpoint relative to the Jupyter Server base URL
 * @param serverSettings The server settings to use for the request
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
async function requestAPI(endPoint, serverSettings, init = {}) {
    // Make request to Jupyter API
    const requestUrl = _jupyterlab_coreutils__rspack_import_0.URLExt.join(serverSettings.baseUrl, endPoint);
    let response;
    try {
        response = await _jupyterlab_services__rspack_import_1.ServerConnection.makeRequest(requestUrl, init, serverSettings);
    }
    catch (error) {
        throw new _jupyterlab_services__rspack_import_1.ServerConnection.NetworkError(error);
    }
    let data = await response.text();
    if (data.length > 0) {
        try {
            data = JSON.parse(data);
        }
        catch (error) {
            console.log('Not a JSON response body.', response);
        }
    }
    if (!response.ok) {
        const message = typeof data === 'string'
            ? data
            : data && typeof data === 'object'
                ? data.message || data.error || response.statusText
                : response.statusText;
        throw new _jupyterlab_services__rspack_import_1.ServerConnection.ResponseError(response, typeof message === 'string' ? message : JSON.stringify(message));
    }
    return data;
}


},
"./style/modelmind-logo.png"(module, __unused_rspack_exports, __webpack_require__) {
module.exports = __webpack_require__.p + "68c5c2a70ed031f3.png";

},

}]);
//# sourceMappingURL=lib_index_js.c723e4fa7fc7d53c.js.map