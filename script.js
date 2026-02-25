
const API_URL = 'https://chatbot-backend-opob.onrender.com';
// ─────────────────────────────────────────────────────────────────────────────

const form     = document.getElementById('chat-form');
const input    = document.getElementById('user-input');
const messages = document.getElementById('messages');  // scroll container
const chat     = document.getElementById('chat');       // append target
const sendBtn  = document.getElementById('send-btn');

let sessionId = null;

// Auto-resize textarea
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
});

// Submit on Enter, Shift+Enter for newline
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.repeat) {
    e.preventDefault();
    form.requestSubmit();
  }
});

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function applyHighlighting(el) {
  el.querySelectorAll('pre code:not(.hljs)').forEach(code => hljs.highlightElement(code));
}

function addCopyButtons(el) {
  el.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    btn.onclick = () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          btn.classList.remove('copied');
        }, 2000);
      });
    };
    pre.appendChild(btn);
  });
}

function createBubble(isUser) {
  const wrapper = document.createElement('div');

  if (isUser) {
    wrapper.className = 'flex justify-end';
    const bubble = document.createElement('div');
    bubble.className = 'text-white text-sm rounded-3xl px-5 py-3 max-w-[85%] whitespace-pre-wrap';
    bubble.style.background = '#2f2f2f';
    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);
    scrollToBottom();
    return bubble;
  } else {
    wrapper.className = 'flex items-start gap-4';
    const avatar = document.createElement('div');
    avatar.className = 'w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs shrink-0 mt-0.5';
    avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';
    const bubble = document.createElement('div');
    bubble.className = 'flex-1 text-zinc-100 text-sm leading-relaxed prose pt-0.5';
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);
    scrollToBottom();
    return bubble;
  }
}

function appendMessage(role, text) {
  const isUser = role === 'user';
  const bubble = createBubble(isUser);
  if (isUser) {
    bubble.textContent = text;
  } else {
    bubble.innerHTML = marked.parse(text);
    applyHighlighting(bubble);
    addCopyButtons(bubble);
  }
}

function appendTyping() {
  const wrapper = document.createElement('div');
  wrapper.id = 'typing-indicator';
  wrapper.className = 'flex items-start gap-4';

  const avatar = document.createElement('div');
  avatar.className = 'w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs shrink-0 mt-0.5';
  avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';

  const bubble = document.createElement('div');
  bubble.className = 'text-zinc-400 text-sm italic pt-1.5';
  bubble.textContent = 'Thinking...';

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  scrollToBottom();
}

function removeTyping() {
  document.getElementById('typing-indicator')?.remove();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message || sendBtn.disabled) return;

  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;

  appendMessage('user', message);
  appendTyping();

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let rawText = '';
    let bubble = null;
    let renderScheduled = false;
    let isFirstToken = true;
    let isComplete = false;

    function scheduleRender() {
      if (renderScheduled) return;
      renderScheduled = true;
      requestAnimationFrame(() => {
        if (bubble) {
          const cursor = isComplete ? '' : '<span class="cursor"></span>';
          bubble.innerHTML = marked.parse(rawText) + cursor;
          applyHighlighting(bubble);
          addCopyButtons(bubble);
          scrollToBottom();
        }
        renderScheduled = false;
      });
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'start') {
            sessionId = data.session_id;

          } else if (data.type === 'token') {
            if (isFirstToken) {
              isFirstToken = false;
              removeTyping();
              bubble = createBubble(false);
            }
            rawText += data.token;
            scheduleRender();

          } else if (data.type === 'done') {
            isComplete = true;
            bubble.innerHTML = marked.parse(rawText);
            applyHighlighting(bubble);
            addCopyButtons(bubble);
            scrollToBottom();
          }
        } catch { /* skip malformed SSE lines */ }
      }
    }
  } catch (err) {
    removeTyping();
    appendMessage('assistant', 'Something went wrong. Please try again.');
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});
