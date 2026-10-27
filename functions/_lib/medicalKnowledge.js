// General, source-linked learning material for the prototype assistant.
// Never add an identifiable person's medical record or case-specific instructions here.
export const medicalKnowledge = {
  reviewedOn: "2026-10-27",
  disclaimer: "This is general educational information, not an individual assessment, diagnosis, or treatment plan. Follow emergency dispatch instructions and the person's clinician-approved care plan.",
  emergency: {
    title: "Immediate emergency signs",
    aliases: ["طوارئ", "اسعاف", "فاقد الوعي", "اغمي عليه", "لا يتنفس", "مش بيتنفس", "صعوبة تنفس", "تشنج", "جلطة", "ألم صدر", "مفقود", "تايه", "اختفى"],
    guidance: "If someone is unresponsive, not breathing normally, having severe difficulty breathing, having a seizure, showing possible stroke signs, or in immediate danger, contact local emergency services now. Stay with them if safe, follow the dispatcher’s instructions, and do not give food, drink, or medicine to someone who is unconscious or cannot swallow safely.",
    sources: [{ name: "NHS · الإسعافات الأولية", url: "https://111.wales.nhs.uk/encyclopaedia/d/article/damweiniauachymorthcyntaf/" }, { name: "NHS · التعامل مع التشنج", url: "https://www.nhs.uk/symptoms/what-to-do-if-someone-has-a-seizure-fit/" }]
  },
  topics: [
    {
      id: "diabetes", title: "السكري", aliases: ["سكري", "السكري", "سكر", "هبوط السكر", "ارتفاع السكر", "انسولين", "جلوكوز", "diabetes", "hypoglycemia"],
      about: "السكري مجموعة حالات تؤثر في تنظيم سكر الدم. تختلف الأعراض والخطة بين الأشخاص، ولا يكفي اسم الحالة وحده لمعرفة العلاج المناسب.",
      signs: "قد تشمل علامات هبوط السكر الرجفة أو التعرق أو الضعف أو الارتباك أو صعوبة المشي والكلام؛ والحالات الشديدة قد تسبب فقدان الوعي أو التشنج. العطش الشديد وكثرة التبول والقيء أو التنفس السريع قد تستدعي تقييمًا طبيًا عاجلًا.",
      help: "إذا كان الشخص واعيًا ويستطيع البلع، اسأله أو اسأل مرافقه عن خطة التعامل الشخصية واتبعها. إذا فقد الوعي أو لم يستطع البلع، لا تضع شيئًا في فمه واتصل بالطوارئ المحلية فورًا. شارك معلومات البطاقة مع المسعفين.",
      avoid: "لا تخمّن مستوى السكر، ولا تعطِ إنسولين أو جرعة دواء، ولا تغيّر خطة العلاج. لا تعطِ طعامًا أو شرابًا لمن لا يستطيع البلع بأمان.",
      sources: [{ name: "CDC · هبوط السكر", url: "https://www.cdc.gov/diabetes/about/low-blood-sugar-hypoglycemia.html" }, { name: "CDC · علاج هبوط السكر", url: "https://www.cdc.gov/diabetes/treatment/treatment-low-blood-sugar-hypoglycemia.html" }, { name: "CDC · الحماض الكيتوني", url: "https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html" }]
    },
    {
      id: "hypertension", title: "ارتفاع ضغط الدم", aliases: ["ضغط", "ضغط الدم", "ضغط مرتفع", "ارتفاع الضغط", "hypertension", "blood pressure"],
      about: "ارتفاع ضغط الدم غالبًا لا يسبب أعراضًا واضحة؛ معرفة القراءة ومراجعة مختص أهم من الاعتماد على الإحساس وحده.",
      signs: "قراءة أعلى من 180/120 ملم زئبق تُعد شديدة. إذا صاحبتها أعراض مثل ألم الصدر أو ضيق النفس أو ضعف أو خدر أو تغير الرؤية أو صعوبة الكلام، فهذه حالة طارئة.",
      help: "مع قراءة تتجاوز 180/120 وأعراض خطيرة، اتصل بالطوارئ المحلية فورًا واذكر القراءة والأعراض. من دون أعراض خطيرة، تواصل عاجلًا مع مختص صحي لتوجيهك.",
      avoid: "لا تعطِ دواء ضغط إضافيًا ولا توقف العلاج ولا تحاول خفض الضغط بسرعة من نفسك.",
      sources: [{ name: "CDC · ارتفاع ضغط الدم", url: "https://www.cdc.gov/high-blood-pressure/about/index.html" }]
    },
    {
      id: "alzheimer", title: "ألزهايمر والخرف", aliases: ["الزهايمر", "ألزهايمر", "زهايمر", "خرف", "نسيان", "alzheimer", "dementia"],
      about: "قد يؤثر ألزهايمر وأنواع الخرف في الذاكرة والعثور على الكلمات وفهم الحديث والانتباه. تختلف التجربة وقدرات التواصل من شخص لآخر.",
      signs: "قد ينسى الشخص أسماء أو كلمات، أو يجد صعوبة في متابعة حديث طويل أو وسط ضوضاء. الارتباك المفاجئ الجديد لا ينبغي افتراض أنه بسبب الخرف فقط؛ يحتاج إلى تقييم طبي سريع.",
      help: "عرّف بنفسك ونادِ الشخص باسمه، تحدث بهدوء وبجمل قصيرة، سؤالًا واحدًا أو اختيارين في كل مرة، وانتظر رده. قلل الضوضاء ولا تجادله أو تحرجه، وتحدث معه مباشرة لا عنه.",
      avoid: "لا تستخدم نبرة طفولية ولا تفترض أن كل تصرف سببه ألزهايمر. عند تغير مفاجئ أو خطر مباشر، اطلب مساعدة طبية عاجلة.",
      sources: [{ name: "NIA · التواصل مع شخص لديه ألزهايمر", url: "https://www.nia.nih.gov/health/alzheimers-changes-behavior-and-communication/communicating-someone-who-has-alzheimers" }, { name: "NIA · ضعف الإدراك والسلامة", url: "https://www.nia.nih.gov/health/health-care-professionals-information/caring-older-patients-cognitive-impairment" }]
    },
    {
      id: "autism", title: "التوحد", aliases: ["التوحد", "توحد", "طيف التوحد", "autism", "autistic"],
      about: "التوحد طيف؛ تختلف طرق التواصل والتعلم والحساسية الحسية والاحتياجات بين الأشخاص. لا يمكن استنتاج قدرات شخص أو تفضيلاته من التشخيص وحده.",
      signs: "قد تختلف طريقة التواصل والتفاعل أو الاستجابة للأصوات والضوء والزحام. بعض الأشخاص يتواصلون بالكلام، وآخرون بطرق أخرى.",
      help: "اسأل الشخص أو مرافقه عن طريقة التواصل التي يفضلها. استخدم كلامًا واضحًا ومباشرًا، امنحه وقتًا للمعالجة والرد، وخفّف الضوضاء أو الزحام إن أمكن. لا تلمسه فجأة.",
      avoid: "لا تفترض أن عدم الرد يعني عدم الفهم، ولا تجبره على التواصل البصري أو اللمس. إذا ابتعد عن مكان آمن أو ضاع، اتصل بالطوارئ المحلية فورًا واتبع تعليماتهم.",
      sources: [{ name: "CDC · معلومات عن التوحد", url: "https://www.cdc.gov/autism/about/index.html" }, { name: "CDC · التجول وفقدان الأمان", url: "https://www.cdc.gov/child-development/disability-safety/wandering.html" }]
    },
    {
      id: "deaf", title: "الصمم وضعف السمع", aliases: ["أصم", "اصم", "صمم", "ضعف السمع", "ضعيف السمع", "سمع", "لغة الإشارة", "deaf", "hearing loss"],
      about: "طرق التواصل تختلف؛ قد يفضل الشخص لغة الإشارة أو الكتابة أو قراءة الشفاه أو الهاتف. اسأله مباشرة عن الأنسب له.",
      signs: "قد لا يسمع الشخص النداء أو بعض الكلام، خصوصًا مع الضوضاء. لا تستنتج أنه لا يفهم أو أنه يستخدم لغة إشارة بعينها.",
      help: "لفت انتباهه بلطف، واجهه بإضاءة مناسبة، قلل ضوضاء الخلفية، وتحدث بوضوح من دون صراخ. استخدم الكتابة أو الهاتف إذا كان يفضل ذلك، وتأكد أن الرسالة وصلت.",
      avoid: "لا تصرخ ولا تتحدث وأنت تدير وجهك، ولا تعتمد على قراءة الشفاه وحدها. في الطوارئ، استخدم كتابة قصيرة أو إشارة واضحة واطلب وسيلة التواصل المناسبة.",
      sources: [{ name: "NIDCD · التواصل مع ضعف السمع", url: "https://www.nidcd.nih.gov/health/age-related-hearing-loss" }, { name: "NIDCD · تحسين التواصل", url: "https://www.nidcd.nih.gov/about/nidcd-director-message/cloth-face-coverings-and-distancing-pose-communication-challenges-many/improving-communication-when-wearing-face-covering-text-version" }]
    },
    {
      id: "adhd", title: "اضطراب فرط الحركة وتشتت الانتباه (ADHD)", aliases: ["adhd", "فرط الحركة", "تشتت الانتباه", "نقص الانتباه", "ضعف الانتباه"],
      about: "قد يؤثر ADHD في الانتباه أو تنظيم المهام أو الحركة والاندفاع. تختلف الاحتياجات من شخص لآخر، والتشخيص والخطة يحددهما مختص.",
      signs: "قد تظهر صعوبة في متابعة التعليمات الطويلة أو تنظيم الخطوات أو انتظار الدور، وقد يختلف ذلك حسب العمر والموقف. لا تكفي علامة واحدة لتشخيص ADHD.",
      help: "اجعل التعليمات قصيرة ومحددة، خطوة واحدة في كل مرة، قلل المشتتات إن أمكن، وامنح وقتًا للاستجابة واستراحات مناسبة. لاحظ ما يساعد هذا الشخص واسأل الأسرة أو المرافق.",
      avoid: "لا تصف الشخص بالكسل أو سوء السلوك بسبب ADHD، ولا تقترح دواءً أو تغير علاجه. الخطة المناسبة يضعها مختص بالتعاون مع الشخص وأسرته.",
      sources: [{ name: "CDC · دعم الطلاب ذوي ADHD", url: "https://www.cdc.gov/adhd/treatment/classroom.html" }]
    },
    {
      id: "child_or_lost", title: "طفل أو شخص تائه", aliases: ["طفل", "طفلة", "تايه", "تائه", "مفقود", "ضاع", "ضايع", "طفل تائه", "lost", "wandering"],
      about: "قد يحتاج الطفل أو الشخص المرتبك إلى المساعدة في العثور على مرافقه أو البقاء في مكان آمن؛ الاحتياج وطريقة التواصل يختلفان بين الناس.",
      signs: "قد يبدو الشخص غير قادر على تحديد المرافق أو المكان، أو يحاول عبور طريق أو الوصول إلى منطقة خطرة.",
      help: "حافظ على سلامة المكان، ابقَ قريبًا دون تخويف، تحدث بهدوء واسأل من يريد الاتصال به. استخدم جهة الاتصال الظاهرة في البطاقة إذا كان ذلك مناسبًا، واطلب مساعدة أمن المكان أو الطوارئ المحلية إذا كان في خطر أو لم يظهر المرافق سريعًا.",
      avoid: "لا تترك طفلًا أو شخصًا ضعيفًا وحده في مكان غير آمن، ولا تصطحبه إلى مكان خاص. لا تشارك بياناته علنًا؛ نسق مع المرافق أو الجهات المحلية.",
      sources: [{ name: "CDC · سلامة الأطفال المعرضين للتوهان", url: "https://www.cdc.gov/child-development/disability-safety/wandering.html" }]
    },
    {
      id: "other", title: "حالة أخرى أو غير محددة", aliases: ["أخرى", "اخرى", "حالة أخرى", "مرض مزمن", "غير معروف", "مش عارف", "other"],
      about: "إذا لم تكن الحالة واضحة، لا تحاول تخمين تشخيص. احتياجات الناس وخططهم تختلف.",
      signs: "لا يمكن تحديد الحالة أو سبب الأعراض من بطاقة QR أو المحادثة وحدها.",
      help: "اسأل الشخص أو مرافقه كيف يمكنك المساعدة، اقرأ التعليمات المعروضة، واتصل بالطوارئ المحلية عند فقدان الوعي أو صعوبة التنفس أو التشنج أو خطر مباشر.",
      avoid: "لا تشخّص ولا تعطِ دواءً أو جرعة ولا تملأ المعلومات الناقصة بالتخمين.",
      sources: [{ name: "NHS · الإسعافات الأولية", url: "https://111.wales.nhs.uk/encyclopaedia/d/article/damweiniauachymorthcyntaf/" }]
    }
  ]
};
