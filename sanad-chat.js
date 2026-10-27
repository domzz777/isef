(() => {
  const $ = (id) => document.getElementById(id);
  const widget = $("sanadWidget");
  if (!widget) return;

  const history = [];
  const messages = $("sanadMessages");
  const suggestions = $("sanadSuggestions");
  const form = $("sanadForm");
  const input = $("sanadInput");
  const send = form.querySelector('button[type="submit"]');

  function addMessage(text, role) {
    const article = document.createElement("article");
    article.className = `sanad-message ${role === "user" ? "from-user" : "from-sanad"}`;
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    article.append(paragraph);
    messages.append(article);
    messages.scrollTop = messages.scrollHeight;
  }

  function category() {
    const profile = window.medicalQrProfileContext || {};
    const text = `${profile.caseType || ""} ${profile.conditions || ""}`.toLowerCase();
    if (/سكر|سكري|diabet/.test(text)) return "السكري";
    if (/زهايمر|ألزهايمر|خرف|alzheimer/.test(text)) return "ألزهايمر أو الخرف";
    if (/توحد|autis/.test(text)) return "التوحد";
    if (/أصم|اصم|صمم|سمع|deaf/.test(text)) return "الصمم أو ضعف السمع";
    if (/adhd|فرط الحركة|تشتت الانتباه/.test(text)) return "اضطراب فرط الحركة وتشتت الانتباه";
    if (/ضغط|hypertension/.test(text)) return "ضغط الدم";
    if (/طفل|child/.test(text)) return "طفل يحتاج مساعدة أو قد يتوه";
    return "غير محددة";
  }

  async function ask(text) {
    const question = String(text || "").trim();
    if (!question || send.disabled) return;
    addMessage(question, "user");
    history.push({ role: "user", content: question });
    send.disabled = true;
    input.disabled = true;
    send.textContent = "...";
    const typing = document.createElement("article");
    typing.className = "sanad-message from-sanad sanad-typing";
    typing.textContent = "سَنَد بيكتب...";
    messages.append(typing);
    messages.scrollTop = messages.scrollHeight;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-8), category: category() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "مش قادر أرد دلوقتي. جرّب كمان شوية.");
      const reply = String(data.reply || "ممكن تعيد صياغة سؤالك؟").slice(0, 2000);
      typing.remove();
      history.push({ role: "assistant", content: reply });
      addMessage(reply, "assistant");
      if (history.length > 12) history.splice(0, history.length - 12);
    } catch (error) {
      typing.remove();
      history.pop();
      addMessage(error.message || "حصلت مشكلة في الاتصال. جرّب تاني.", "assistant");
    } finally {
      send.disabled = false;
      input.disabled = false;
      send.textContent = "إرسال";
      input.focus();
    }
  }

  function welcome() {
    if (messages.children.length) return;
    addMessage("أهلًا، أنا سَنَد. اكتبلي سؤالك زي ما تحب، ونكمل كلامنا هنا. أقدر أساعد بمعلومات عامة وطريقة التواصل مع الحالة.", "assistant");
    suggestions.innerHTML = "";
    ["إزاي أساعده لو اتوتر؟", "أقول إيه للمسعف؟"].forEach((text) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sanad-chip";
      button.textContent = text;
      button.addEventListener("click", () => ask(text));
      suggestions.append(button);
    });
  }

  welcome();
  document.addEventListener("medicalQrProfileReady", welcome);
  const launcher = $("sanadLauncher");
  const panel = $("sanadPanel");
  launcher.addEventListener("click", () => {
    const opening = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !opening);
    launcher.setAttribute("aria-expanded", String(opening));
    if (opening) input.focus();
  });
  $("sanadClose").addEventListener("click", () => {
    panel.classList.add("hidden");
    launcher.setAttribute("aria-expanded", "false");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    ask(value);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      panel.classList.add("hidden");
      launcher.setAttribute("aria-expanded", "false");
    }
  });
})();
