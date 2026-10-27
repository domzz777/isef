(() => {
  const $ = (id) => document.getElementById(id);
  const widget = $("sanadWidget");
  if (!widget) return;

  const sources = {
    emergency: ["NHS · الإسعافات الأولية", "https://111.wales.nhs.uk/encyclopaedia/d/article/damweiniauachymorthcyntaf/"],
    diabetes: ["NHS · هبوط السكر الشديد", "https://www.nhs.uk/conditions/low-blood-sugar-hypoglycaemia/"],
    alzheimer: ["المعهد الوطني للشيخوخة · التواصل مع مريض ألزهايمر", "https://www.nia.nih.gov/health/alzheimers-changes-behavior-and-communication/communicating-someone-who-has-alzheimers"],
    autism: ["NHS Autism Central · احتياجات التواصل والحواس", "https://www.autismcentral.nhs.uk/sites/default/files/2026-03/wellbeing_communication_and_sensory_passport_b.pdf"],
    deaf: ["NIDCD · التواصل مع من لديه ضعف سمع", "https://www.nidcd.nih.gov/health/age-related-hearing-loss"],
    adhd: ["NHS · دعم الأطفال ذوي ADHD في المنزل", "https://connect.humber.nhs.uk/service/childrens-adhd-intervention-team/strategies-at-home/"],
    pressure: ["CDC · معلومات عن ضغط الدم", "https://www.cdc.gov/high-blood-pressure/about/index.html"]
  };

  const knowledge = {
    general: {
      title: "ماذا أفعل في الطوارئ؟",
      text: "لو الشخص لا يستجيب، أو لا يتنفس بشكل طبيعي، أو عنده صعوبة شديدة في التنفس أو تشنج: اتصل فورًا بخدمات الطوارئ المحلية. استخدم زر الاتصال الأحمر للتواصل مع الأسرة، وابقَ معه واتبع تعليمات موظف الطوارئ. لا تعطِ طعامًا أو شرابًا لشخص فاقد الوعي.",
      source: sources.emergency
    },
    diabetes: {
      title: "معلومات عن السكري وهبوط السكر",
      text: "هبوط السكر قد يسبب ارتباكًا ويصعّب على الشخص أن يساعد نفسه. إذا كان واعيًا وقادرًا على البلع، اتبع خطته الشخصية المكتوبة. إذا كان فاقد الوعي أو غير قادر على البلع، لا تضع شيئًا في فمه واتصل بالطوارئ فورًا. لا تغيّر جرعات الأدوية ولا تعطِ إنسولين بناءً على هذا الدليل.",
      source: sources.diabetes
    },
    alzheimer: {
      title: "التواصل مع شخص لديه ألزهايمر أو خرف",
      text: "اقترب بهدوء، عرّف نفسك ونادِه باسمه، واستخدم جملًا قصيرة وسؤالًا واحدًا أو اختيارين واضحين. امنحه وقتًا للرد، وخفّف ضوضاء المكان. تجنب الجدال أو تصحيح كل كلمة؛ اسأل الأسرة عمّا يساعده عادةً.",
      source: sources.alzheimer
    },
    autism: {
      title: "التواصل مع شخص لديه توحد",
      text: "كل شخص مختلف. اسأل المرافق عن طريقة التواصل وما قد يسبب إزعاجًا حسيًا. استخدم كلامًا واضحًا وقصيرًا، امنح الشخص وقتًا للمعالجة والرد، وقلّل الضوضاء والزحام إن أمكن. لا تفترض أن عدم الرد يعني عدم الفهم، ولا تلمسه فجأة.",
      source: sources.autism
    },
    deaf: {
      title: "التواصل مع شخص أصم أو ضعيف السمع",
      text: "لفت انتباهه بلطف وواجهه حتى يرى وجهك. اسأله عن الطريقة الأنسب للتواصل؛ قد يفضّل الكتابة أو الهاتف أو لغة الإشارة. تحدث بوضوح من دون صراخ، وخفف الضوضاء. لا تعتمد على الكلام وحده إذا لم يكن مفهومًا.",
      source: sources.deaf
    },
    adhd: {
      title: "التواصل مع شخص لديه ADHD",
      text: "اسأل المرافق عن الطريقة التي تساعد هذا الشخص. في الحديث، اجعل التعليمات قصيرة ومحددة، فكرة واحدة في كل مرة، وخفف المشتتات إن أمكن. اترك وقتًا للاستجابة وتأكد أن الرسالة وصلت بدل تكرار أوامر كثيرة معًا.",
      source: sources.adhd
    },
    pressure: {
      title: "معلومات عن ضغط الدم المرتفع",
      text: "ارتفاع ضغط الدم غالبًا لا يسبب أعراضًا واضحة؛ القياس والمتابعة الطبية هما الأساس. لا تعطِ جرعة إضافية ولا توقف الدواء من نفسك. إذا ظهرت قراءة أعلى من 180/120 مع ألم صدر أو صعوبة تنفس أو ضعف أو تغير بالرؤية أو صعوبة كلام، اتصل بخدمات الطوارئ المحلية فورًا.",
      source: sources.pressure
    },
    child: {
      title: "مساعدة طفل أو شخص معرض للتوهان",
      text: "اقترب بهدوء وعرّف بنفسك، واسأل عن الشخص المسؤول عنه. ابقَ في مكان آمن واطلب مساعدة شخص بالغ موثوق أو الجهات المحلية عند الحاجة. استخدم زر الاتصال الأحمر للتواصل مع جهة الاتصال المسجلة، واتبع أي تعليمات خاصة مكتوبة في الملف.",
      source: sources.emergency
    },
    paramedic: {
      title: "معلومات تفيد المسعف",
      text: "اتصل بالطوارئ أولًا واذكر مكان الحالة بوضوح. أخبرهم بما حدث ومتى بدأ، وهل الشخص مستجيب ويتنفس، ثم شارك الحالات والحساسيات والتعليمات الظاهرة في البطاقة وأي دواء تعرفه على وجه اليقين. لا تخمّن معلومات غير مؤكدة.",
      source: sources.emergency
    },
    fallback: {
      title: "خلّيني أوجهك لمعلومة آمنة",
      text: "أقدر أشرح معلومات عامة عن التواصل مع الحالة المسجلة، أو ما الذي ينبغي إبلاغه للمُسعفين. لا أستطيع تشخيص الأعراض أو اقتراح دواء أو جرعة. لو الشخص فاقد الوعي أو يتنفس بصعوبة، اتصل بالطوارئ المحلية الآن.",
      source: sources.emergency
    }
  };

  const overviews = {
    diabetes: {text:"السكري حالة مزمنة تتعلق بارتفاع سكر الدم، وتختلف خطتها حسب الشخص ونوع السكري. البطاقة لا توضح وحدها جرعة أو علاجًا مناسبًا؛ اتبعوا الخطة التي كتبها الطبيب. اسأل المرافق عن العلامات المعتادة وخطة التعامل الخاصة بالشخص.", source:sources.diabetes},
    alzheimer: {text:"ألزهايمر يؤثر في الذاكرة والتفكير والتواصل، وقد يواجه الشخص صعوبة في تذكر الكلمات أو متابعة حديث طويل. التجربة تختلف من شخص لآخر؛ لا تفترض أن كل تصرف سببه المرض، واسأل المرافق عن أفضل طريقة للتواصل.", source:sources.alzheimer},
    autism: {text:"التوحد طيف، واحتياجات التواصل والحواس تختلف كثيرًا بين الأشخاص. قد تساعد وسائل التواصل المكتوبة أو الصور أو وقت إضافي للرد؛ اسأل الشخص أو المرافق عما يناسبه بدل افتراض طريقة واحدة للجميع.", source:sources.autism},
    deaf: {text:"طرق التواصل المفضلة تختلف من شخص لآخر؛ بعض الأشخاص يستخدمون لغة الإشارة، وآخرون يفضلون الكتابة أو قراءة الشفاه أو الهاتف. اسأل الشخص عن الطريقة المناسبة له، ولا تفترض أنه يستطيع سماع الكلام أو قراءة الشفاه.", source:sources.deaf},
    adhd: {text:"ADHD يؤثر في الانتباه أو الحركة والاندفاع بدرجات تختلف من شخص لآخر. عند التواصل، قد تساعد التعليمات القصيرة المحددة وتقسيمها إلى خطوة واحدة كل مرة، مع وقت كافٍ للرد.", source:sources.adhd},
    pressure: {text:"ارتفاع ضغط الدم غالبًا لا يسبب علامات واضحة، والقياس والمتابعة مع مختص هما الطريقة لمعرفة الحالة. لا توقف العلاج ولا تغيّر جرعته من نفسك؛ احتفظ بقراءات الضغط والأدوية لتشاركها مع الفريق الطبي.", source:sources.pressure},
    child: {text:"كل طفل له احتياجات وطريقة تواصل مختلفة. اسأل ولي الأمر أو المرافق عن الاسم الذي يستجيب له الطفل، وما يطمئنه، وأي تعليمات أمان خاصة. استخدم بيانات جهة الاتصال الموجودة في البطاقة عند الحاجة.", source:sources.emergency}
  };

  const normalize = (value) => String(value || "").toLowerCase()
    .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْـ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  const contains = (value, terms) => terms.some(term => value.includes(normalize(term)));

  function categoryFrom(value) {
    const text = normalize(value);
    if (contains(text, ["سكري", "سكر", "انسولين", "جلوكوز"])) return "diabetes";
    if (contains(text, ["الزهايمر", "زهايمر", "خرف", "نسيان شديد"])) return "alzheimer";
    if (contains(text, ["توحد", "autism", "طيف التوحد"])) return "autism";
    if (contains(text, ["اصم", "صمم", "ضعف السمع", "سمع", "لغة الاشاره"])) return "deaf";
    if (contains(text, ["adhd", "فرط الحركه", "تشتت الانتباه", "فرط الحركة"])) return "adhd";
    if (contains(text, ["ضغط", "ضغط الدم", "ضغط مرتفع", "hypertension"])) return "pressure";
    if (contains(text, ["طفل", "التوهان", "كبير سن"])) return "child";
    return "";
  }

  function addMessage(text, role, source) {
    const message = document.createElement("article");
    message.className = `sanad-message ${role === "user" ? "from-user" : "from-sanad"}`;
    const body = document.createElement("p");
    body.textContent = text;
    message.append(body);
    if (source) {
      const link = document.createElement("a");
      link.href = source[1]; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.textContent = `المصدر: ${source[0]} ↗`;
      message.append(link);
    }
    $("sanadMessages").append(message);
    $("sanadMessages").scrollTop = $("sanadMessages").scrollHeight;
  }

  function getContext() {
    const profile = window.medicalQrProfileContext || {};
    return categoryFrom(`${profile.caseType || ""} ${profile.conditions || ""}`);
  }

  function answerFor(question) {
    const q = normalize(question);
    if (contains(q, ["للمسعف", "اقول للمسعف", "المعلومات المهمه", "اقول للطوارئ", "ماذا ابلغ"])) return knowledge.paramedic;
    if (contains(q, ["فاقد الوعي", "فقد الوعي", "اغمي عليه", "اغماء", "غيبوبه", "مش بيتنفس", "لا يتنفس", "صعوبه في التنفس", "تشنج", "اسعاف", "طارئ", "طوارئ", "اختناق"])) return knowledge.general;

    const category = categoryFrom(q) || getContext();
    if (contains(q, ["دواء", "علاج", "جرعه", "انسولين", "اخد ايه", "اعطيه ايه", "اعطيها ايه"])) return knowledge.fallback;
    if (contains(q, ["معلومات", "يعني ايه", "ما هو", "ماهي", "اشرح", "ايه المرض", "نبذه", "اعراض", "علامات", "ما معنى"])) return overviews[category] ? {title:"معلومات عامة", ...overviews[category]} : knowledge.fallback;
    if (contains(q, ["اتواصل", "اتعامل", "اساعد", "اكلمه", "اكلمها", "افهمه", "افهمها", "اهديه", "مشتت", "يخاف", "خايف"])) return knowledge[category] || knowledge.fallback;
    if (category) return knowledge[category];
    if (contains(q, ["ماذا اقول", "المسعف", "اسعاف", "المعلومات المهمه", "اتصل بمين"])) return knowledge.general;
    return knowledge.fallback;
  }

  function renderSuggestions() {
    const category = getContext();
    const label = category === "diabetes" ? "معلومات عن السكري" : category === "alzheimer" ? "التواصل مع مريض ألزهايمر" : category === "autism" ? "التواصل مع شخص لديه توحد" : category === "deaf" ? "التواصل مع شخص أصم" : category === "adhd" ? "التعامل مع ADHD" : category === "pressure" ? "معلومات عن ضغط الدم" : "كيف أساعد في الحالة؟";
    const questions = [label, "لو فقد الوعي أعمل إيه؟", "إيه المعلومات المهمة للمُسعف؟"];
    const tray = $("sanadSuggestions");
    questions.forEach(question => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "sanad-chip"; button.textContent = question;
      button.addEventListener("click", () => sendQuestion(question));
      tray.append(button);
    });
  }

  function sendQuestion(question) {
    const clean = String(question || "").trim();
    if (!clean) return;
    addMessage(clean, "user");
    const answer = answerFor(clean);
    window.setTimeout(() => addMessage(answer.text, "sanad", answer.source), 180);
  }

  $("sanadMessages").innerHTML = "";
  function renderWelcome() {
    $("sanadMessages").innerHTML = "";
    $("sanadSuggestions").innerHTML = "";
    const currentCategory = getContext();
    const message = currentCategory ? `أهلًا، أنا سَنَد. أقدر أساعد بمعلومات عامة عن ${knowledge[currentCategory].title.replace(/^معلومات عن /, "")}، والتواصل وقت الحاجة.` : "أهلًا، أنا سَنَد. اسألني عن معلومات عامة أو طريقة التواصل والمساعدة.";
    addMessage(message, "sanad");
    renderSuggestions();
  }
  renderWelcome();
  document.addEventListener("medicalQrProfileReady", renderWelcome, {once:true});

  const launcher = $("sanadLauncher");
  const panel = $("sanadPanel");
  const close = () => { panel.classList.add("hidden"); launcher.setAttribute("aria-expanded", "false"); };
  launcher.addEventListener("click", () => {
    const opening = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !opening);
    launcher.setAttribute("aria-expanded", String(opening));
    if (opening) $("sanadInput").focus();
  });
  $("sanadClose").addEventListener("click", close);
  $("sanadForm").addEventListener("submit", event => {
    event.preventDefault();
    sendQuestion($("sanadInput").value);
    $("sanadInput").value = "";
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
})();
