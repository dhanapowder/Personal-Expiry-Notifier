// Optional: Add interactivity if needed

document.querySelector('.download').addEventListener('click', () => {
  alert('Redirecting to app download...');
});

document.querySelector('.learn-more').addEventListener('click', () => {
  alert('Showing more information...');
});

//Connect JavaScript to Python//

async function getAIMessage(docName, daysLeft) {
    const response = await fetch("http://127.0.0.1:5000/generate-reminder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            doc_name: docName,
            days_left: daysLeft
        })
    });

    const data = await response.json();
    return data.message;
}

    // LIGHT / DARK MODE: toggling with localstorage
    const toggleBtn = document.getElementById('darkmodeToggle');
    const themeTextSpan = document.getElementById('themeText');
    
    function setTheme(theme) {
      if (theme === 'dark') {
        document.body.classList.add('dark');
        localStorage.setItem('expiryTheme', 'dark');
        if (themeTextSpan) themeTextSpan.innerText = 'Dark';
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('expiryTheme', 'light');
        if (themeTextSpan) themeTextSpan.innerText = 'Light';
      }
    }
    
    function initTheme() {
      const savedTheme = localStorage.getItem('expiryTheme');
      if (savedTheme === 'dark') {
        setTheme('dark');
      } else if (savedTheme === 'light') {
        setTheme('light');
      } else {
        // check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) setTheme('dark');
        else setTheme('light');
      }
    }
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark');
        if (isDark) {
          setTheme('light');
        } else {
          setTheme('dark');
        }
      });
    }
    
    initTheme();
   
  // ---------- MULTI-LANGUAGE SUPPORT (dynamic) ----------
  const translations = {
    en: { hero_title: "Personal Document Expiry Notifier", hero_desc: "Keep track of your documents & receive automatic notifications before expiration.", voice_assistant: "Voice Assistant", mic_description: "Tap the mic and speak: 'Show reminders', 'Go to pricing', 'Tell me about Premium', or 'Switch to dark mode'.", mic_ready: "✅ Ready — click microphone and speak", command_placeholder: "Your voice command will appear here...", premium_feat1: "Unlimited document tracking", premium_feat2: "Email + SMS alerts" },
    es: { hero_title: "Notificador de Vencimiento de Documentos", hero_desc: "Realiza un seguimiento de tus documentos y recibe notificaciones automáticas antes de su vencimiento.", voice_assistant: "Asistente de Voz", mic_description: "Toca el micrófono y di: 'Mostrar recordatorios', 'Ir a precios', 'Dime sobre Premium' o 'Cambiar a modo oscuro'.", mic_ready: "✅ Listo — haz clic en el micrófono y habla", command_placeholder: "Tu comando de voz aparecerá aquí...", premium_feat1: "Seguimiento ilimitado de documentos", premium_feat2: "Alertas por Email + SMS" },
    hi: { hero_title: "व्यक्तिगत दस्तावेज़ समाप्ति सूचक", hero_desc: "अपने दस्तावेज़ों पर नज़र रखें और समाप्ति से पहले स्वचालित सूचनाएं प्राप्त करें।", voice_assistant: "वॉइस असिस्टेंट", mic_description: "माइक टैप करें और बोलें: 'रिमाइंडर दिखाएं', 'प्राइसिंग पर जाएं', 'प्रीमियम के बारे में बताएं' या 'डार्क मोड में बदलें'।", mic_ready: "✅ तैयार — माइक्रोफोन क्लिक करें और बोलें", command_placeholder: "आपका वॉइस कमांड यहाँ दिखेगा...", premium_feat1: "असीमित दस्तावेज़ ट्रैकिंग", premium_feat2: "ईमेल + एसएमएस अलर्ट" },
    fr: { hero_title: "Notification d'expiration de documents personnels", hero_desc: "Suivez vos documents et recevez des notifications automatiques avant expiration.", voice_assistant: "Assistant Vocal", mic_description: "Appuyez sur le micro et parlez : 'Afficher les rappels', 'Aller aux tarifs', 'Parlez-moi de Premium' ou 'Passer en mode sombre'.", mic_ready: "✅ Prêt — cliquez sur le microphone et parlez", command_placeholder: "Votre commande vocale apparaîtra ici...", premium_feat1: "Suivi illimité des documents", premium_feat2: "Alertes Email + SMS" }
  };
  function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        if (el.innerText) el.innerText = translations[lang][key];
        else if (el.placeholder) el.placeholder = translations[lang][key];
      } else if (translations['en'][key]) {
        if (el.innerText) el.innerText = translations['en'][key];
      }
    });
    localStorage.setItem('appLanguage', lang);
  }
  const langSelect = document.getElementById('languageSwitcher');
  if (langSelect) {
    langSelect.value = localStorage.getItem('appLanguage') || 'en';
    langSelect.addEventListener('change', (e) => updateLanguage(e.target.value));
    updateLanguage(langSelect.value);
  }

  // ---------- MICROPHONE FEATURE + COMMANDS ----------
  const micBtn = document.getElementById('microphoneBtn');
  const micStatus = document.getElementById('micStatusMsg');
  const outputDiv = document.getElementById('voiceCommandOutput');
  let recognition = null;
  let isListening = false;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add('listening');
      micStatus.innerText = "🎤 Listening... speak your command";
      if(micStatus.getAttribute('data-i18n')) micStatus.innerText = "🎤 Listening...";
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      outputDiv.innerHTML = `🎙️ "${transcript}"`;
      handleVoiceCommand(transcript);
      micStatus.innerText = "✅ Command received!";
      setTimeout(() => { if(!isListening) micStatus.innerText = "✅ Ready — click microphone and speak"; }, 1500);
    };
    recognition.onerror = (err) => {
      micStatus.innerText = `❌ Error: ${err.error}`;
      micBtn.classList.remove('listening');
      isListening = false;
    };
    recognition.onend = () => {
      micBtn.classList.remove('listening');
      isListening = false;
      if(micStatus.innerText.includes("Listening")) micStatus.innerText = "✅ Ready — click microphone";
    };
  } else {
    micBtn.disabled = true;
    micStatus.innerText = "⚠️ Speech recognition not supported in your browser.";
  }
  function handleVoiceCommand(cmd) {
    if (cmd.includes("reminder") || cmd.includes("show reminders") || cmd.includes("recordatorios") || cmd.includes("रिमाइंडर")) {
      alert("🔔 Your reminders: Passport (45 days), Insurance (12 days), PAN Card (90 days).");
    } else if (cmd.includes("pricing") || cmd.includes("precios") || cmd.includes("कीमत")) {
      document.querySelector('.pricing-row')?.scrollIntoView({ behavior: 'smooth' });
      alert("💎 Check our Premium & Pro plans for unlimited tracking!");
    } else if (cmd.includes("premium") || cmd.includes("premium plan")) {
      alert("✨ Premium plan gives unlimited document tracking, SMS alerts, cloud backup & no ads for $4.99/month.");
    } else if (cmd.includes("dark mode") || cmd.includes("modo oscuro") || cmd.includes("डार्क मोड")) {
      const isDark = document.body.classList.contains('dark');
      setTheme(isDark ? 'light' : 'dark');
      alert(`🌓 Switched to ${!isDark ? 'dark' : 'light'} mode.`);
    } else if (cmd.includes("hello") || cmd.includes("hi")) {
      alert("👋 Hello! Need help with document expiry reminders? Use the mic or explore the app.");
    } else {
      alert(`🤖 Command: "${cmd}". Try saying "Show reminders", "Go to pricing", or "Switch to dark mode".`);
    }
  }
  micBtn?.addEventListener('click', () => {
    if (recognition && !isListening) {
      try { recognition.start(); } catch(e) { console.log(e); }
    } else if (recognition && isListening) {
      recognition.stop();
    } else if (!recognition) alert("Speech recognition not supported. Upgrade browser.");
  });
  document.getElementById('chatBtn')?.addEventListener('click', () => alert("💬 ExpiryNotifier Assistant: Voice & language features active! Try speaking 'Show reminders'."));
  document.querySelectorAll('.btn-primary, .btn-sm, .btn-outline').forEach(btn => {
    btn.addEventListener('click', (e) => { if(!btn.closest('.mic-assistant')) e.preventDefault(); alert("🚀 Demo: Full version integrates voice commands & real-time notifications."); });
  });    

