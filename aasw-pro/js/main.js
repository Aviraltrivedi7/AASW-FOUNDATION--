/* ================================================================
   AASW FOUNDATION — SODES.IN STYLE JAVASCRIPT
   Features: Slider · Navbar · Scroll Reveal · Counters ·
             Language Toggle · Newsletter · Back to Top
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initNavbar();
  initMobileNav();
  initDropdownTouch();
  initScrollReveal();
  initCounters();
  initLanguage();
  initBackToTop();
  initContactForm();
  initSmoothAnchors();
  initScrollProgress();
  initDynamicYear();
});

/* ═══ HERO SLIDER ═══ */
function initSlider() {
  const track = document.getElementById('sliderTrack');
  const slides = track?.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (!track || !slides?.length) return;

  let current = 0;
  const total = slides.length;
  let autoSlideTimer;

  function goToSlide(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideTimer);
  }

  prevBtn?.addEventListener('click', () => { prevSlide(); startAutoSlide(); });
  nextBtn?.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goToSlide(i); startAutoSlide(); });
  });

  // Touch/swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAutoSlide(); }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
    startAutoSlide();
  }, { passive: true });

  startAutoSlide();
}

/* ═══ NAVBAR SCROLL BEHAVIOR ═══ */
function initNavbar() {
  const nav = document.getElementById('mainNav');
  const brandBar = document.querySelector('.top-brand-bar');
  if (!nav) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // Add scrolled class for visual shrink/shadow
        nav.classList.toggle('scrolled', scrollY > 60);
        // Optionally hide brand bar on scroll down, show on scroll up
        if (brandBar) {
          brandBar.style.boxShadow = scrollY > 10 ? '0 2px 12px rgba(0,0,0,0.08)' : 'none';
        }
        lastScroll = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ═══ MOBILE NAV ═══ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  if (!hamburger || !overlay) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  });

  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMobileNav());
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMobileNav();
  });
}

window.closeMobileNav = function () {
  document.getElementById('mobileOverlay')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  document.body.style.overflow = '';
};

/* ═══ SCROLL REVEAL ═══ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ═══ COUNTER ANIMATION ═══ */
function initCounters() {
  const nums = document.querySelectorAll('.counter-num');
  if (!nums.length) return;
  let animated = false;

  function animateCounters() {
    if (animated) return;
    const first = nums[0].getBoundingClientRect();
    if (first.top > window.innerHeight) return;
    animated = true;

    nums.forEach(el => {
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * ease).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();
}

/* ═══ BILINGUAL LANGUAGE TOGGLE ═══ */
const translations = {
  'nav-home': { en: 'Home', hi: 'होम' },
  'nav-who': { en: 'Who We Are', hi: 'हम कौन हैं' },
  'dd-about': { en: 'About Us', hi: 'हमारे बारे में' },
  'dd-vision': { en: 'Vision & Mission', hi: 'दृष्टि और मिशन' },
  'dd-gov': { en: 'Governance', hi: 'शासन' },
  'dd-team': { en: 'Our Team', hi: 'हमारी टीम' },
  'dd-edu': { en: 'Shiksha Setu — Education', hi: 'शिक्षा सेतु — शिक्षा' },
  'dd-health': { en: 'Arogya Gram — Health', hi: 'आरोग्य ग्राम — स्वास्थ्य' },
  'dd-women': { en: 'Shakti — Women\'s Welfare', hi: 'शक्ति — महिला कल्याण' },
  'dd-udyam': { en: 'Udyam — Livelihoods', hi: 'उद्यम — आजीविका' },
  'nav-programs': { en: 'Programs', hi: 'कार्यक्रम' },
  'nav-impact': { en: 'Impact Stories', hi: 'प्रभाव कहानियां' },
  'nav-contact': { en: 'Contact Us', hi: 'संपर्क करें' },
  'nav-dashboard': { en: 'ADMIN LOGIN', hi: 'एडमिन लॉगिन' },

  'hero-h1-1': { en: 'Transforming Lives Through', hi: 'जीवन को बदलना' },
  'hero-h1-2': { en: 'Education, Health & Hope', hi: 'शिक्षा, स्वास्थ्य और आशा के जरिए' },
  'hero-btn1': { en: 'About Us', hi: 'हमारे बारे में' },
  'hero-btn2': { en: 'Contact Us', hi: 'संपर्क करें' },
  's1-h': { en: 'Enabling Education & Opportunity for Every Child in India', hi: 'भारत के हर बच्चे के लिए शिक्षा और अवसर सक्षम करना' },
  's1-b1': { en: 'Our Programs', hi: 'हमारे कार्यक्रम' },
  's1-b2': { en: 'Contact Us', hi: 'संपर्क करें' },
  's3-h': { en: 'Empowering Women to Lead, Earn & Thrive with Dignity', hi: 'महिलाओं को नेतृत्व, कमाई और सम्मान के साथ जीने में सक्षम बनाना' },
  's3-b1': { en: 'Shakti Program', hi: 'शक्ति कार्यक्रम' },
  's3-b2': { en: 'Contact Us', hi: 'संपर्क करें' },
  'hero-s1': { en: 'Lives Impacted', hi: 'जीवन प्रभावित' },
  'hero-s2': { en: 'Villages Reached', hi: 'गांव पहुंचे' },
  'hero-s3': { en: 'Women Empowered', hi: 'महिलाएं सशक्त' },
  'c1': { en: 'Lives Impacted', hi: 'जीवन प्रभावित' },
  'c2': { en: 'Villages Reached', hi: 'गांव पहुंचे' },
  'c3': { en: 'Women Empowered', hi: 'महिलाएं सशक्त' },
  'c4': { en: 'Children in School', hi: 'बच्चे स्कूल में' },
  'w-tag': { en: 'Who We Are', hi: 'हम कौन हैं' },
  'w-p1': { en: 'AASW Foundation catalyses exchange of knowledge and best practices, facilitates meaningful partnerships, and promotes grassroots leadership to build a more equitable India.', hi: 'AASW फाउंडेशन ज्ञान और सर्वोत्तम प्रथाओं के आदान-प्रदान को उत्प्रेरित करता है।' },
  'w-b1': { en: 'Nurturing Education & Child Development', hi: 'शिक्षा और बाल विकास' },
  'w-b2': { en: 'Women\'s Empowerment & Welfare', hi: 'महिला सशक्तिकरण और कल्याण' },
  'w-b3': { en: 'Catalysing Rural Health & Well-being', hi: 'ग्रामीण स्वास्थ्य और कल्याण' },
  'w-b4': { en: 'Building Sustainable Livelihoods', hi: 'सतत आजीविका का निर्माण' },
  'prog-tag': { en: 'What We Do', hi: 'हम क्या करते हैं' },
  'prog-h2': { en: 'Our Programs & Initiatives', hi: 'हमारे कार्यक्रम और पहल' },
  'prog-sub': { en: 'Six integrated pillars creating lasting transformation in India\'s most underserved communities.', hi: 'छह एकीकृत स्तंभ भारत के सबसे वंचित समुदायों में स्थायी परिवर्तन ला रहे हैं।' },
  'p1-tag': { en: 'Education', hi: 'शिक्षा' },
  'p1-h': { en: 'Shiksha Setu', hi: 'शिक्षा सेतु' },
  'p1-p': { en: 'Bridging learning gaps for children in remote areas through community schools, digital classrooms, and scholarship support.', hi: 'सामुदायिक स्कूलों, डिजिटल कक्षाओं और छात्रवृत्ति सहायता से दूरदराज के बच्चों की शिक्षा में सेतु बनाना।' },
  'p2-tag': { en: 'Health', hi: 'स्वास्थ्य' },
  'p2-h': { en: 'Arogya Gram', hi: 'आरोग्य ग्राम' },
  'p2-p': { en: 'Bringing preventive healthcare, mobile medical camps, and maternal wellness directly to underserved villages.', hi: 'वंचित गांवों में निवारक स्वास्थ्य सेवा, मोबाइल मेडिकल कैंप और मातृ कल्याण पहुंचाना।' },
  'p3-tag': { en: 'Women', hi: 'महिला' },
  'p3-h': { en: 'Shakti', hi: 'शक्ति' },
  'p3-p': { en: 'Empowering women with vocational skills, self-help groups, legal awareness, and entrepreneurship support.', hi: 'व्यावसायिक कौशल, स्वयं सहायता समूह, कानूनी जागरूकता और उद्यमिता सहायता से महिलाओं को सशक्त बनाना।' },
  'p4-tag': { en: 'Livelihoods', hi: 'आजीविका' },
  'p4-h': { en: 'Udyam', hi: 'उद्यम' },
  'p4-p': { en: 'Supporting farmers and rural youth with skill development, agri-tech, and market linkages to build sustainable incomes.', hi: 'कौशल विकास, कृषि-तकनीक और बाजार संपर्क से किसानों और ग्रामीण युवाओं का समर्थन।' },
  'p5-tag': { en: 'Skills', hi: 'कौशल' },
  'p5-h': { en: 'Kaushal', hi: 'कौशल' },
  'p5-p': { en: 'Market-aligned vocational training for rural youth — from digital literacy to trade skills — creating self-sufficient livelihoods.', hi: 'ग्रामीण युवाओं के लिए बाजार-उन्मुख व्यावसायिक प्रशिक्षण — डिजिटल साक्षरता से व्यापार कौशल तक।' },
  'p6-tag': { en: 'Finance', hi: 'वित्त' },
  'p6-h': { en: 'Vittiya', hi: 'वित्तीय' },
  'p6-p': { en: 'Linking unbanked rural households to formal financial services — savings, credit, insurance, and government schemes.', hi: 'बैंकिंग सुविधा से वंचित ग्रामीण परिवारों को औपचारिक वित्तीय सेवाओं से जोड़ना।' },
  'e-tag': { en: 'Our Impact', hi: 'हमारा प्रभाव' },
  'e-h2-1': { en: 'Driven by People,', hi: 'लोगों से प्रेरित,' },
  'e-h2-2': { en: 'Guided by Purpose', hi: 'उद्देश्य से निर्देशित' },
  'e-p1': { en: 'AASW Foundation is a unique nonprofit society owned, managed, and dedicated entirely to the benefit of India\'s most underserved communities — united by a common goal to innovate, catalyse meaningful partnerships, share knowledge, and achieve collective impact.', hi: 'AASW फाउंडेशन एक अद्वितीय गैर-लाभकारी संस्था है जो पूर्ण रूप से भारत के सबसे वंचित समुदायों के लाभ के लिए समर्पित है।' },
  'e-p2': { en: 'We are a bridge — connecting vulnerable communities with the resources, opportunities, and support systems they need to chart their own paths to dignity and lasting prosperity.', hi: 'हम एक सेतु हैं — कमजोर समुदायों को संसाधनों, अवसरों और सहायता प्रणालियों से जोड़ते हैं।' },
  'ov-eyebrow': { en: 'AASW Foundation Overview', hi: 'AASW फाउंडेशन अवलोकन' },
  'ov-h2': { en: 'Building an Equitable India, One Community at a Time', hi: 'एक समतामूलक भारत का निर्माण, एक समुदाय साथ' },
  'ov-p1': { en: 'AASW Foundation unites communities, changemakers, and institutions around a cohesive vision of inclusive development. Our focused, evidence-based approach allows for meaningful progress across four Indian states.', hi: 'AASW फाउंडेशन समावेशी विकास की एकजुट दृष्टि के चारों ओर समुदायों, परिवर्तनकर्ताओं और संस्थानों को एकजुट करता है।' },
  'ov-p2': { en: 'We promote an inclusive approach — increasing diversity, accessibility, and sustainability in everything we do. We bring together professionals from government, civil society, and corporate India.', hi: 'हम एक समावेशी दृष्टिकोण को बढ़ावा देते हैं — विविधता, पहुंच और स्थिरता बढ़ाते हैं।' },
  'ov-btn1': { en: 'Our Programs', hi: 'हमारे कार्यक्रम' },
  'ov-btn2': { en: 'Contact Us', hi: 'संपर्क करें' },
  'ov-card-title': { en: 'All-round Advancement for Social Welfare', hi: 'सामाजिक कल्याण के लिए सर्वांगीण उन्नति' },
  'ov-card-text': { en: 'We are a unique nonprofit solely dedicated to the advancement of underserved communities — owned, managed, and operated for the exclusive benefit of the people we serve.', hi: 'हम एक अद्वितीय गैर-लाभकारी संस्था हैं जो पूर्ण रूप से वंचित समुदायों की उन्नति के लिए समर्पित है।' },
  'testi-tag': { en: 'Voices of Change', hi: 'बदलाव की आवाजें' },
  'testi-h2': { en: 'What People Are Saying', hi: 'लोग क्या कह रहे हैं' },
  'testi-sub': { en: 'Real stories from communities, beneficiaries, and partners who have experienced the AASW Foundation difference.', hi: 'समुदायों, लाभार्थियों और साझेदारों की वास्तविक कहानियां।' },
  't1-text': { en: '"The Shakti program changed everything for me. I now run my own tailoring business and send my children to school. AASW Foundation gave me the confidence to believe in myself."', hi: '"शक्ति कार्यक्रम ने मेरे लिए सब कुछ बदल दिया। अब मैं अपना सिलाई व्यवसाय चलाती हूं।"' },
  't1-name': { en: 'Priya Devi', hi: 'प्रिया देवी' },
  't1-role': { en: 'Shakti Program Beneficiary, Alwar, Rajasthan', hi: 'शक्ति कार्यक्रम लाभार्थी, अलवर, राजस्थान' },
  't2-text': { en: '"AASW Foundation is a model of transparency and community engagement. Partnering with them for our CSR initiatives has been one of our best decisions."', hi: '"AASW फाउंडेशन पारदर्शिता और सामुदायिक जुड़ाव का एक आदर्श है।"' },
  't2-name': { en: 'Ramesh Gupta', hi: 'रमेश गुप्ता' },
  't2-role': { en: 'Head of CSR, Sunrise Industries Ltd.', hi: 'CSR प्रमुख, सनराइज इंडस्ट्रीज' },
  't3-text': { en: '"Before the mobile health camp, we had to travel 40 km for medical help. Today we have regular check-ups and our mothers are healthier."', hi: '"मोबाइल स्वास्थ्य शिविर से पहले हमें 40 किमी यात्रा करनी पड़ती थी।"' },
  't3-name': { en: 'Sundar Lal', hi: 'सुंदर लाल' },
  't3-role': { en: 'Village Head, Arogya Gram Program, MP', hi: 'ग्राम प्रधान, आरोग्य ग्राम कार्यक्रम, म.प्र.' },
  'nl-h2': { en: 'Subscribe to Our Newsletter', hi: 'हमारे न्यूज़लेटर की सदस्यता लें' },
  'nl-sub': { en: 'Get our latest updates, impact stories, and program news delivered straight to your inbox.', hi: 'हमारे नवीनतम अपडेट, प्रभाव कहानियां और कार्यक्रम समाचार सीधे अपने इनबॉक्स में प्राप्त करें।' },
  'nl-btn': { en: 'SUBSCRIBE', hi: 'सदस्यता लें' },
  'f-logo-sub': { en: 'Empowering Lives · Building Futures', hi: 'जीवन सशक्त · भविष्य निर्माण' },
  'f-about': { en: 'We believe that community, compassion, and consistent action can make a significant positive impact on India\'s social and economic well-being.', hi: 'हम मानते हैं कि समुदाय, करुणा और निरंतर कार्रवाई सकारात्मक प्रभाव डाल सकती है।' },
  'f-h1': { en: 'Quick Links', hi: 'त्वरित लिंक' },
  'f-l1': { en: 'Home', hi: 'होम' },
  'f-l2': { en: 'About Us', hi: 'हमारे बारे में' },
  'f-l3': { en: 'Our Programs', hi: 'हमारे कार्यक्रम' },
  'f-l4': { en: 'Impact Stories', hi: 'प्रभाव कहानियां' },
  'f-l5': { en: 'Our Team', hi: 'हमारी टीम' },
  'f-l6': { en: 'Contact Us', hi: 'संपर्क करें' },
  'f-h2': { en: 'Useful Links', hi: 'उपयोगी लिंक' },
  'f-u1': { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
  'f-u5': { en: 'Media & Press', hi: 'मीडिया और प्रेस' },
  'f-u6': { en: 'Volunteer With Us', hi: 'हमारे साथ स्वयंसेवा करें' },
  'f-h3': { en: 'Connect With Us', hi: 'हमसे जुड़ें' },
  'f-addr': { en: 'Ward No 2 Ambedkar Nagar Rura Kanpur Dehat Uttar Pradesh', hi: 'वार्ड नं 2 अंबेडकर नगर रुरा कानपुर देहात उत्तर प्रदेश' },
  'f-hours': { en: 'Mon – Sat: 9:30 AM – 6:00 PM', hi: 'सोम – शनि: 9:30 AM – 6:00 PM' },
  'f-copy': { en: '© 2025 AASW Foundation. All rights reserved. | Registered Non-Profit · 80G & 12A Certified', hi: '© 2026 AASW फाउंडेशन। सर्वाधिकार सुरक्षित। | पंजीकृत गैर-लाभकारी · 80G और 12A प्रमाणित' },
  // Refund Policy page
  'ref-banner-h': { en: 'Refund & Cancellation Policy', hi: 'रिफंड और कैंसलेशन पॉलिसी' },
  'ref-banner-p': { en: 'Our policy on refund and cancellation of Membership fees.', hi: 'सदस्यता शुल्क के रिफंड और रद्दीकरण पर हमारी नीति।' },
  'ref-tag': { en: 'Policies', hi: 'नीतियां' },
  'ref-h2': { en: 'Refund & Cancellation Policy', hi: 'रिफंड और कैंसलेशन पॉलिसी' },
  'ref-sub': { en: 'Our policy on refund and cancellation of Membership fees received for AASW Foundation on secure online payment gateway is as under:', hi: 'AASW FOUNDATION के सुरक्षित ऑनलाइन पेमेंट गेटवे के ज़रिए मिली मेंबरशिप फीस के रिफंड और कैंसलेशन के बारे में हमारी पॉलिसी इस प्रकार है:' },
  'ref-1-p': { en: 'Any request for cancellations and refund of online Membership fees once duly placed on the website, shall not be entertained under any circumstances. No cash or refund of money will be allowed after completing the online Membership fees as it is an extremely cumbersome process. We therefore request you to be sure before you make payment for Membership fees.', hi: 'एक बार वेबसाइट पर विधिवत जमा किए गए ऑनलाइन सदस्यता शुल्क के रद्दीकरण और वापसी के किसी भी अनुरोध पर किसी भी परिस्थिति में विचार नहीं किया जाएगा। ऑनलाइन सदस्यता शुल्क पूरा करने के बाद नकद या पैसे की वापसी की अनुमति नहीं दी जाएगी क्योंकि यह एक अत्यंत बोझिल प्रक्रिया है। इसलिए हम आपसे अनुरोध करते हैं कि सदस्यता शुल्क के लिए भुगतान करने से पहले सुनिश्चित हो लें।' },
  'f-u3': { en: 'Refund Policy', hi: 'रिफंड नीति' },
  // Governance page
  'gov-banner-h': { en: 'Governance & Accountability', hi: 'शासन और जवाबदेही' },
  'gov-banner-p': { en: 'Transparency and integrity in everything we do', hi: 'हम जो भी करते हैं उसमें पारदर्शिता और ईमानदारी' },
  'gov-tag': { en: 'Transparency', hi: 'पारदर्शिता' },
  'gov-h2': { en: 'Governance & Accountability', hi: 'शासन और जवाबदेही' },
  'gov-sub': { en: 'AASW Foundation operates with the highest standards of integrity, transparency, and accountability to our donors and the communities we serve.', hi: 'AASW फाउंडेशन अपने दानदाताओं और समुदायों के प्रति सर्वोच्च ईमानदारी, पारदर्शिता और जवाबदेही के साथ कार्य करता है।' },
  'gov-c1-h': { en: 'Board of Trustees', hi: 'न्यासी मंडल' },
  'gov-c1-p': { en: 'Our Board oversees the foundation\'s strategic direction, financial health, and adherence to our core values, meeting quarterly to review program impacts and audits.', hi: 'हमारा बोर्ड फाउंडेशन की रणनीतिक दिशा, वित्तीय स्वास्थ्य और मूल मूल्यों की निगरानी करता है, तिमाही बैठकों में कार्यक्रम प्रभावों और ऑडिट की समीक्षा करता है।' },
  'gov-c2-h': { en: 'Financial Audits', hi: 'वित्तीय ऑडिट' },
  'gov-c2-p': { en: 'We undergo rigorous annual statutory audits by independent chartered accountants. We are 12A and 80G certified, complying fully with all governmental requirements.', hi: 'हम स्वतंत्र चार्टर्ड एकाउंटेंट्स द्वारा कठोर वार्षिक सांविधिक ऑडिट से गुजरते हैं। हम 12A और 80G प्रमाणित हैं।' },
  'gov-c3-h': { en: 'Compliance & Ethics', hi: 'अनुपालन और नैतिकता' },
  'gov-c3-p': { en: 'We follow strict ethical guidelines and comply with all applicable laws, including the Indian Societies Registration Act, FCRA regulations, and Income Tax provisions.', hi: 'हम सख्त नैतिक दिशानिर्देशों का पालन करते हैं और भारतीय सोसायटी पंजीकरण अधिनियम, FCRA विनियमों और आयकर प्रावधानों सहित सभी लागू कानूनों का अनुपालन करते हैं।' },
  'gov-c4-h': { en: 'Transparency Policy', hi: 'पारदर्शिता नीति' },
  'gov-c4-p': { en: 'We publish annual reports, audited financial statements, and impact assessments. Our stakeholders have full visibility into how funds are utilized.', hi: 'हम वार्षिक रिपोर्ट, ऑडिटेड वित्तीय विवरण और प्रभाव मूल्यांकन प्रकाशित करते हैं। हमारे हितधारकों को धन उपयोग की पूरी जानकारी होती है।' },
  // Team page
  'team-banner-h': { en: 'Our Team', hi: 'हमारी टीम' },
  'team-banner-p': { en: 'The passionate people driving change across India', hi: 'भारत भर में बदलाव लाने वाले जुनूनी लोग' },
  'team-tag': { en: 'Leadership', hi: 'नेतृत्व' },
  'team-h2': { en: 'Meet Our Dedicated Team', hi: 'हमारी समर्पित टीम से मिलें' },
  'team-sub': { en: 'The passionate individuals working tirelessly to uplift communities and drive positive change across India.', hi: 'भारत भर में समुदायों को ऊपर उठाने और सकारात्मक बदलाव लाने के लिए अथक काम करने वाले जुनूनी लोग।' },
  'tm1-name': { en: 'Anupam Trivedi', hi: 'अनुपम त्रिवेदी' },
  'tm1-role': { en: 'Founder & President', hi: 'संस्थापक और अध्यक्ष' },
  'tm1-desc': { en: 'Visionary leader with 20+ years in community development and social welfare across rural India.', hi: '20+ वर्षों के अनुभव के साथ ग्रामीण भारत में सामुदायिक विकास और सामाजिक कल्याण में दूरदर्शी नेता।' },
  // Contact form
  'contact-tag': { en: 'Get In Touch', hi: 'संपर्क करें' },
  'contact-h2': { en: 'Contact Us', hi: 'हमसे संपर्क करें' },
  'contact-sub': { en: 'Have a question or want to collaborate? We\'d love to hear from you.', hi: 'कोई प्रश्न है या सहयोग करना चाहते हैं? हमें आपसे सुनना अच्छा लगेगा।' },
  'contact-name-label': { en: 'Your Name', hi: 'आपका नाम' },
  'contact-email-label': { en: 'Email Address', hi: 'ईमेल पता' },
  'contact-subject-label': { en: 'Subject', hi: 'विषय' },
  'contact-message-label': { en: 'Message', hi: 'संदेश' },
  'contact-send': { en: 'Send Message', hi: 'संदेश भेजें' },
  'contact-info-email-h': { en: 'Email Us', hi: 'ईमेल करें' },
  'contact-info-phone-h': { en: 'Call Us', hi: 'फ़ोन करें' },
  'contact-info-addr-h': { en: 'Visit Us', hi: 'हमसे मिलें' },
  'contact-info-addr': { en: 'Ward No 2 Ambedkar Nagar Rura Kanpur Dehat Uttar Pradesh', hi: 'वार्ड नं 2 अंबेडकर नगर रुरा कानपुर देहात उत्तर प्रदेश' },
  'contact-info-hours-h': { en: 'Office Hours', hi: 'कार्यालय समय' },
  'contact-info-hours': { en: 'Mon – Sat: 9:30 AM – 6:00 PM', hi: 'सोम – शनि: 9:30 AM – 6:00 PM' },
  // Nav auth items
  'nav-login': { en: 'LOGIN', hi: 'लॉगिन' },
  'nav-signup': { en: 'SIGNUP', hi: 'साइनअप' },
  'nav-member': { en: 'Become a Member', hi: 'सदस्य बनें' },
  // Privacy Policy page
  'priv-banner-h': { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
  'priv-banner-p': { en: 'How we collect, use, and protect your personal data', hi: 'हम आपके व्यक्तिगत डेटा को कैसे एकत्र, उपयोग और सुरक्षित करते हैं' },
  'priv-tag': { en: 'Data Protection', hi: 'डेटा सुरक्षा' },
  'priv-h2': { en: 'Your Privacy Matters', hi: 'आपकी गोपनीयता महत्वपूर्ण है' },
  'priv-sub': { en: 'AASW Foundation respects your privacy and is committed to protecting your personal data when you interact with our website, donate, or volunteer with us.', hi: 'AASW फाउंडेशन आपकी गोपनीयता का सम्मान करता है और हमारी वेबसाइट से जुड़ने, दान करने या स्वयंसेवा करने पर आपके व्यक्तिगत डेटा की सुरक्षा के लिए प्रतिबद्ध है।' },
  'priv-1-h': { en: '1. Information We Collect', hi: '1. हम कौन सी जानकारी एकत्र करते हैं' },
  'priv-1-p': { en: 'We may collect personal identification information including your name, email address, phone number, and mailing address when you make a donation or subscribe to our newsletter. Payment details are processed securely by our trusted gateway partners (Razorpay/PayU) and are not stored on our servers.', hi: 'जब आप दान करते हैं या हमारे न्यूज़लेटर की सदस्यता लेते हैं तो हम आपका नाम, ईमेल पता, फ़ोन नंबर और डाक पता जैसी व्यक्तिगत पहचान जानकारी एकत्र कर सकते हैं। भुगतान विवरण हमारे विश्वसनीय गेटवे पार्टनर (Razorpay/PayU) द्वारा सुरक्षित रूप से संसाधित किए जाते हैं और हमारे सर्वर पर संग्रहीत नहीं होते।' },
  'priv-2-h': { en: '2. How We Use Your Information', hi: '2. हम आपकी जानकारी का उपयोग कैसे करते हैं' },
  'priv-2-l1': { en: 'To process donations and issue 80G tax limit receipts.', hi: 'दान को संसाधित करने और 80G कर छूट रसीदें जारी करने के लिए।' },
  'priv-2-l2': { en: 'To send periodic updates, newsletters, and impact reports.', hi: 'समय-समय पर अपडेट, न्यूज़लेटर और प्रभाव रिपोर्ट भेजने के लिए।' },
  'priv-2-l3': { en: 'To improve our website functionality and user experience.', hi: 'हमारी वेबसाइट की कार्यक्षमता और उपयोगकर्ता अनुभव को बेहतर बनाने के लिए।' },
  'priv-3-h': { en: '3. Data Security', hi: '3. डेटा सुरक्षा' },
  'priv-3-p': { en: 'We implement a variety of security measures to maintain the safety of your personal information. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your explicit consent.', hi: 'हम आपकी व्यक्तिगत जानकारी की सुरक्षा बनाए रखने के लिए विभिन्न सुरक्षा उपाय लागू करते हैं। हम आपकी स्पष्ट सहमति के बिना आपकी व्यक्तिगत पहचान योग्य जानकारी को बाहरी पक्षों को बेचते, व्यापार या अन्यथा हस्तांतरित नहीं करते।' },
  'priv-4-h': { en: '4. Contacting Us', hi: '4. हमसे संपर्क करें' },
  'priv-4-p': { en: 'If there are any questions regarding this privacy policy, you may contact us via our email at aaswfoundation06@gmail.com or by calling us at +91 9984156418.', hi: 'यदि इस गोपनीयता नीति के बारे में कोई प्रश्न हैं, तो आप हमें aaswfoundation06@gmail.com पर ईमेल करके या +91 9984156418 पर कॉल करके संपर्क कर सकते हैं।' },
};

function initLanguage() {
  const saved = localStorage.getItem('aasw-lang') || 'en';
  setLang(saved);
}

function setLang(lang) {
  localStorage.setItem('aasw-lang', lang);
  document.body.classList.toggle('lang-hi', lang === 'hi');

  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    if (translations[key] && translations[key][lang]) {
      if (el.tagName === 'INPUT') {
        el.placeholder = translations[key][lang];
      } else {
        el.textContent = translations[key][lang];
      }
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if (typeof initDynamicYear === 'function') initDynamicYear();
}

window.setLang = setLang;


/* ═══ BACK TO TOP ═══ */
function initBackToTop() {
  const btn = document.getElementById('btt');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══ SMOOTH ANCHORS ═══ */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 130; // brand bar + nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ═══ SCROLL PROGRESS ═══ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight * 100) : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ═══ DYNAMIC YEAR ═══ */
function initDynamicYear() {
  const year = new Date().getFullYear();
  const fCopy = document.querySelector('[data-t="f-copy"]');
  if (fCopy) {
    const isHi = document.body.classList.contains('lang-hi');
    fCopy.textContent = isHi
      ? `© ${year} AASW फाउंडेशन। सर्वाधिकार सुरक्षित। | पंजीकृत गैर-लाभकारी · 80G और 12A प्रमाणित`
      : `© ${year} AASW Foundation. All rights reserved. | Registered Non-Profit · 80G & 12A Certified`;
  }
  // Also update any static copyright elements
  document.querySelectorAll('.footer-year, [data-year]').forEach(el => {
    el.textContent = year;
  });
}

/* ═══ CONTACT FORM ═══ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('contactSubmitBtn');
  const feedback = document.getElementById('contactFeedback');
  if (!form || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const lang = document.body.classList.contains('lang-hi') ? 'hi' : 'en';

    const name = document.getElementById('contactName')?.value?.trim();
    const email = document.getElementById('contactEmail')?.value?.trim();
    const subject = document.getElementById('contactSubject')?.value?.trim();
    const message = document.getElementById('contactMessage')?.value?.trim();

    // Client-side validation
    if (!name || name.length < 2) {
      showFeedback(feedback, lang === 'hi' ? 'कृपया अपना नाम दर्ज करें (कम से कम 2 अक्षर)' : 'Please enter your name (at least 2 characters)', 'error');
      return;
    }
    if (!email || !email.includes('@')) {
      showFeedback(feedback, lang === 'hi' ? 'कृपया एक मान्य ईमेल दर्ज करें' : 'Please enter a valid email address', 'error');
      return;
    }
    if (!subject || subject.length < 3) {
      showFeedback(feedback, lang === 'hi' ? 'कृपया विषय दर्ज करें (कम से कम 3 अक्षर)' : 'Please enter a subject (at least 3 characters)', 'error');
      return;
    }
    if (!message || message.length < 10) {
      showFeedback(feedback, lang === 'hi' ? 'कृपया संदेश दर्ज करें (कम से कम 10 अक्षर)' : 'Please enter a message (at least 10 characters)', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = lang === 'hi' ? '<i class="fas fa-spinner fa-spin"></i> भेज रहे हैं...' : '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website: document.getElementById('contactWebsite')?.value || ''
        })
      });

      const data = await res.json();

      if (res.status === 201) {
        form.reset();
        showFeedback(feedback, lang === 'hi' ? '✓ आपका संदेश सफलतापूर्वक भेजा गया!' : '✓ Your message has been sent successfully!', 'success');
      } else {
        const errMsg = data.message || (lang === 'hi' ? 'कुछ गलत हो गया' : 'Something went wrong');
        showFeedback(feedback, '✗ ' + errMsg, 'error');
      }
    } catch (err) {
      console.error('Contact form submission failed:', err);
      showFeedback(feedback, lang === 'hi' ? '✗ नेटवर्क त्रुटि, कृपया पुनः प्रयास करें' : '✗ Network error, please try again', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = lang === 'hi' ? '<i class="fas fa-paper-plane"></i> संदेश भेजें' : '<i class="fas fa-paper-plane"></i> Send Message';
  });
}

function showFeedback(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'contact-feedback ' + type;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

/* ═══ DROPDOWN TOUCH SUPPORT ═══ */
function initDropdownTouch() {
  // On touch devices, toggle dropdown open/close on tap
  const dropdowns = document.querySelectorAll('.has-dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach(dd => {
    const link = dd.querySelector('.nav-link');
    if (!link) return;

    link.addEventListener('click', (e) => {
      // Only intercept on touch devices / narrow screens
      if (window.innerWidth > 768) return;
      e.preventDefault();
      e.stopPropagation();

      // Close other open dropdowns
      dropdowns.forEach(other => {
        if (other !== dd) other.classList.remove('open');
      });

      dd.classList.toggle('open');
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      dropdowns.forEach(dd => dd.classList.remove('open'));
    }
  });
}
