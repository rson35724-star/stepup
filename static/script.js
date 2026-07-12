// ============ Neural network animated background ============
(function () {
  const canvas = document.getElementById('net-bg');
  const ctx = canvas.getContext('2d');
  let w, h, nodes;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const NODE_COUNT = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 22000));

  function makeNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      });
    }
  }
  makeNodes();

  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.14 * (1 - dist / 150)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.55)';
      ctx.fill();
    }
    if (!prefersReduced) requestAnimationFrame(step);
  }
  step();
})();

// ============ Scroll reveal ============
(function () {
  const targets = document.querySelectorAll(
    '.split-text, .split-visual, .process-step, .company-card, .why-card, .code-window, .section-title, .section-lead'
  );
  targets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  targets.forEach((el) => observer.observe(el));
})();

// ============ Chatbot ============
(function () {
  const toggle = document.getElementById('chatbot-toggle');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  const typing = document.getElementById('chatbot-typing');

  let history = [];
  let open = false;

  function setOpen(state) {
    open = state;
    panel.classList.toggle('open', open);
    if (open) setTimeout(() => input.focus(), 200);
  }

  toggle.addEventListener('click', () => setOpen(!open));
  closeBtn.addEventListener('click', () => setOpen(false));

  const askAiBtn = document.getElementById('ask-ai-btn');
  if (askAiBtn) {
    askAiBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setOpen(true);
    });
  }

  function cleanText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/`(.*?)`/g, '$1');
  }

  function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'msg-user' : role === 'error' ? 'msg-error' : 'msg-bot');
    div.textContent = role === 'bot' ? cleanText(text) : text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage(text) {
    addMessage(text, 'user');
    history.push({ role: 'user', content: text });
    input.value = '';
    typing.style.display = 'flex';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-10) }),
      });

      const data = await res.json();
      typing.style.display = 'none';

      if (!res.ok || data.error) {
        addMessage(data.error || 'Something went wrong. Please try again.', 'error');
        return;
      }

      addMessage(data.reply, 'bot');
      history.push({ role: 'model', content: data.reply });
    } catch (err) {
      typing.style.display = 'none';
      addMessage('Connection issue — please check the server and try again.', 'error');
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    sendMessage(text);
  });
})();
