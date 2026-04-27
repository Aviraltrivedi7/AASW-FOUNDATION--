/**
 * AASW Foundation — Complete i18n (Internationalization) System
 * Supports: English (en) & Hindi (hi)
 * Persists language choice in localStorage
 */

const TRANSLATIONS = {

  // ═══════════════════════════════════════════
  //  SHARED — Navigation & Footer
  // ═══════════════════════════════════════════
  "nav-home": { en: "Home", hi: "होम" },
  "nav-team": { en: "Our Team", hi: "हमारी टीम" },
  "nav-governance": { en: "Governance", hi: "शासन प्रणाली" },
  "nav-membership": { en: "Membership", hi: "सदस्यता" },
  "nav-contact": { en: "Contact Us", hi: "संपर्क करें" },
  "nav-admin": { en: "Admin Login", hi: "एडमिन लॉगिन" },
  "nav-become-member": { en: "Become a Member", hi: "सदस्य बनें" },
  "nav-apply": { en: "Apply Now", hi: "अभी आवेदन करें" },

  // Footer
  "footer-brand": { en: "AASW Foundation", hi: "AASW फाउंडेशन" },
  "footer-desc": { en: "Empowering communities through holistic intervention.", hi: "समग्र हस्तक्षेप के माध्यम से समुदायों को सशक्त बनाना।" },
  "footer-pages": { en: "Pages", hi: "पृष्ठ" },
  "footer-legal": { en: "Legal", hi: "कानूनी" },
  "footer-contact": { en: "Contact", hi: "संपर्क" },
  "footer-privacy": { en: "Privacy Policy", hi: "गोपनीयता नीति" },
  "footer-refund": { en: "Refund Policy", hi: "रिफंड नीति" },
  "footer-copyright": { en: "© 2026 AASW Foundation. All Rights Reserved.", hi: "© 2026 AASW फाउंडेशन। सर्वाधिकार सुरक्षित।" },

  // ═══════════════════════════════════════════
  //  HOMEPAGE — index.html
  // ═══════════════════════════════════════════
  "brand-tagline": { en: "Empowering Lives · Building Futures", hi: "जीवन को सशक्त बनाना · भविष्य का निर्माण" },
  "hero-tag": { en: "Initiating Change", hi: "परिवर्तन की शुरुआत" },
  "hero-title-1": { en: "Transforming Lives Through ", hi: "शिक्षा, स्वास्थ्य और आशा " },
  "hero-title-2": { en: "Education, Health & Hope", hi: "के माध्यम से जीवन बदलना" },
  "hero-subtitle": { en: "AASW Foundation bridges the gap between potential and opportunity across the most underserved regions of India.", hi: "AASW फाउंडेशन भारत के सबसे वंचित क्षेत्रों में संभावना और अवसर के बीच की खाई को पाटता है।" },
  "hero-btn-about": { en: "About Us", hi: "हमारे बारे में" },
  "hero-btn-contact": { en: "Contact Us", hi: "संपर्क करें" },

  // About
  "about-tag": { en: "Who We Are", hi: "हम कौन हैं" },
  "about-title": { en: "Our mission is to accelerate inclusive development across India", hi: "हमारा मिशन भारत में समावेशी विकास को गति देना है" },
  "about-edu": { en: "Education", hi: "शिक्षा" },
  "about-women": { en: "Women Empowerment", hi: "महिला सशक्तिकरण" },
  "about-health": { en: "Health", hi: "स्वास्थ्य" },
  "about-livelihood": { en: "Livelihoods", hi: "आजीविका" },
  "about-desc": { en: "Rooted in the belief that every individual deserves a dignified life, AASW Foundation works on the ground to implement sustainable solutions that empower communities.", hi: "इस विश्वास में निहित कि हर व्यक्ति एक सम्मानजनक जीवन का हकदार है, AASW फाउंडेशन समुदायों को सशक्त बनाने वाले स्थायी समाधानों को लागू करने के लिए जमीनी स्तर पर काम करता है।" },

  // Programs
  "programs-tag": { en: "Our Initiatives", hi: "हमारी पहल" },
  "programs-title": { en: "Programs Shaping the Future", hi: "भविष्य को आकार देने वाले कार्यक्रम" },
  "prog-1-title": { en: "Shiksha Setu", hi: "शिक्षा सेतु" },
  "prog-1-desc": { en: "Bridging the educational divide through digital literacy and remedial learning centers.", hi: "डिजिटल साक्षरता और उपचारात्मक शिक्षा केंद्रों के माध्यम से शैक्षिक विभाजन को पाटना।" },
  "prog-2-title": { en: "Arogya Gram", hi: "आरोग्य ग्राम" },
  "prog-2-desc": { en: "Mobile healthcare units bringing quality diagnostics and treatment to remote villages.", hi: "दूरदराज के गांवों में गुणवत्तापूर्ण निदान और उपचार लाने वाली मोबाइल स्वास्थ्य इकाइयाँ।" },
  "prog-3-title": { en: "Shakti", hi: "शक्ति" },
  "prog-3-desc": { en: "Empowering women through micro-finance, skill training, and leadership workshops.", hi: "माइक्रो-फाइनेंस, कौशल प्रशिक्षण और नेतृत्व कार्यशालाओं के माध्यम से महिलाओं को सशक्त बनाना।" },
  "prog-4-title": { en: "Udyam", hi: "उद्यम" },
  "prog-4-desc": { en: "Promoting sustainable agricultural practices and farmer-producer organizations.", hi: "टिकाऊ कृषि प्रथाओं और किसान-उत्पादक संगठनों को बढ़ावा देना।" },
  "prog-5-title": { en: "Kaushal", hi: "कौशल" },
  "prog-5-desc": { en: "Vocational training programs tailored for urban youth to bridge unemployment.", hi: "बेरोजगारी को दूर करने के लिए शहरी युवाओं के लिए व्यावसायिक प्रशिक्षण कार्यक्रम।" },
  "prog-6-title": { en: "Vittiya", hi: "वित्तीय" },
  "prog-6-desc": { en: "Financial literacy and inclusion programs ensuring last-mile banking access.", hi: "वित्तीय साक्षरता और समावेश कार्यक्रम जो अंतिम छोर तक बैंकिंग पहुँच सुनिश्चित करते हैं।" },
  "prog-explore": { en: "Explore Impact", hi: "प्रभाव देखें" },

  // Impact Stats
  "stat-lives": { en: "Lives Impacted", hi: "प्रभावित जीवन" },
  "stat-villages": { en: "Villages Reached", hi: "गाँव पहुँचे" },
  "stat-women": { en: "Women Empowered", hi: "सशक्त महिलाएँ" },
  "stat-children": { en: "Children in School", hi: "स्कूल में बच्चे" },

  // Testimonials
  "testi-tag": { en: "Testimonials", hi: "प्रशंसापत्र" },
  "testi-title": { en: "Impact Stories from the Ground", hi: "ज़मीनी स्तर से प्रभाव की कहानियाँ" },
  "testi-1": { en: "\"The Shakti program gave me more than just a loan; it gave me the confidence to run my own tailoring shop and send my daughter to college.\"", hi: "\"शक्ति कार्यक्रम ने मुझे सिर्फ़ एक ऋण से कहीं ज़्यादा दिया; इसने मुझे अपनी सिलाई की दुकान चलाने और अपनी बेटी को कॉलेज भेजने का आत्मविश्वास दिया।\"" },
  "testi-2": { en: "\"Through Arogya Gram, my father received heart treatment without traveling 200km. This service is a lifesaver for our village.\"", hi: "\"आरोग्य ग्राम के माध्यम से, मेरे पिता ने 200 किमी यात्रा किए बिना हृदय उपचार प्राप्त किया। यह सेवा हमारे गाँव के लिए जीवन रक्षक है।\"" },
  "testi-3": { en: "\"Udyam helped me shift to organic farming. My yield has improved, and the market link provided by AASW has doubled my income.\"", hi: "\"उद्यम ने मुझे जैविक खेती में बदलने में मदद की। मेरी उपज में सुधार हुआ है, और AASW द्वारा प्रदान किए गए बाज़ार लिंक ने मेरी आय दोगुनी कर दी है।\"" },

  // Newsletter
  "news-tag": { en: "Stay Updated", hi: "अपडेट रहें" },
  "news-title": { en: "Subscribe to Our Newsletter", hi: "हमारे न्यूज़लेटर की सदस्यता लें" },
  "news-desc": { en: "Get monthly updates on our impact, events, and ways you can help.", hi: "हमारे प्रभाव, कार्यक्रमों और आप कैसे मदद कर सकते हैं, इस पर मासिक अपडेट प्राप्त करें।" },
  "news-btn": { en: "Subscribe", hi: "सदस्यता लें" },

  // Contact
  "contact-title": { en: "Get in Touch", hi: "संपर्क करें" },
  "contact-desc": { en: "Have questions or want to partner with us? Reach out through the form below.", hi: "कोई प्रश्न है या हमारे साथ साझेदारी करना चाहते हैं? नीचे दिए गए फ़ॉर्म से संपर्क करें।" },
  "contact-name": { en: "Full Name", hi: "पूरा नाम" },
  "contact-email": { en: "Email Address", hi: "ईमेल पता" },
  "contact-subject": { en: "Subject", hi: "विषय" },
  "contact-message": { en: "Message", hi: "संदेश" },
  "contact-send": { en: "Send Message", hi: "संदेश भेजें" },
  "contact-hq": { en: "Our Headquarters", hi: "हमारा मुख्यालय" },
  "contact-hq-addr": { en: "Kanpur Dehat, Uttar Pradesh, India", hi: "कानपुर देहात, उत्तर प्रदेश, भारत" },
  "contact-email-title": { en: "Email Us", hi: "ईमेल करें" },
  "contact-call": { en: "Call Support", hi: "कॉल सहायता" },

  // ═══════════════════════════════════════════
  //  TEAM PAGE — team.html
  // ═══════════════════════════════════════════
  "team-tag": { en: "The People Behind AASW", hi: "AASW के पीछे के लोग" },
  "team-hero-title-1": { en: "Our ", hi: "हमारी " },
  "team-hero-title-2": { en: "Team", hi: "टीम" },
  "team-hero-desc": { en: "Meet the dedicated visionaries and changemakers driving AASW Foundation's mission.", hi: "AASW फाउंडेशन के मिशन को चलाने वाले समर्पित दूरदर्शी और परिवर्तनकर्ताओं से मिलें।" },
  "team-board-tag": { en: "Leadership", hi: "नेतृत्व" },
  "team-board-title": { en: "Board of Directors", hi: "निदेशक मंडल" },
  "team-ak-name": { en: "Arvind Kumar", hi: "अरविंद कुमार" },
  "team-ak-role": { en: "Founder & Chairman", hi: "संस्थापक और अध्यक्ष" },
  "team-ak-desc": { en: "Visionary leader with 15+ years in rural development and social innovation across Rajasthan.", hi: "राजस्थान में ग्रामीण विकास और सामाजिक नवाचार में 15+ वर्षों के अनुभव वाले दूरदर्शी नेता।" },
  "team-sm-name": { en: "Sunita Mehra", hi: "सुनीता मेहरा" },
  "team-sm-role": { en: "Vice Chairperson", hi: "उपाध्यक्ष" },
  "team-sm-desc": { en: "Women's rights advocate and former IAS officer dedicated to gender equality initiatives.", hi: "महिला अधिकार अधिवक्ता और पूर्व IAS अधिकारी जो लैंगिक समानता पहलों के लिए समर्पित हैं।" },
  "team-rj-name": { en: "Dr. Rajesh Joshi", hi: "डॉ. राजेश जोशी" },
  "team-rj-role": { en: "Secretary General", hi: "महासचिव" },
  "team-rj-desc": { en: "Public health expert specializing in mobile healthcare solutions for underserved communities.", hi: "वंचित समुदायों के लिए मोबाइल स्वास्थ्य समाधानों में विशेषज्ञता रखने वाले सार्वजनिक स्वास्थ्य विशेषज्ञ।" },
  "team-core-tag": { en: "Operations", hi: "संचालन" },
  "team-core-title": { en: "Core Team", hi: "मुख्य टीम" },
  "team-collective": { en: "The Collective", hi: "सामूहिक" },
  "team-our-people": { en: "Our People", hi: "हमारे लोग" },
  "team-select-desc": { en: "Select a category to explore our dedicated leaders.", hi: "हमारे समर्पित नेताओं को देखने के लिए एक श्रेणी चुनें।" },
  "team-central-title": { en: "Central Advisory", hi: "केंद्रीय सलाहकार" },
  "team-state-title": { en: "State Council", hi: "राज्य परिषद" },
  "founder-name": { en: "Anupam Trivedi", hi: "अनुपम त्रिवेदी" },
  "co-founder-name": { en: "Aparna Mishra", hi: "अपर्णा मिश्रा" },
  "team-cta-tag": { en: "Make a Difference", hi: "बदलाव लाएँ" },
  "team-cta-title": { en: "Join Our Team", hi: "हमारी टीम से जुड़ें" },
  "team-cta-desc": { en: "Whether you're a professional, student, or passionate citizen — there's a place for you at AASW Foundation.", hi: "चाहे आप पेशेवर हों, छात्र हों, या उत्साही नागरिक हों — AASW फाउंडेशन में आपके लिए जगह है।" },
  "team-cta-btn": { en: "Apply to Volunteer", hi: "स्वयंसेवक बनें" },

  // ═══════════════════════════════════════════
  //  GOVERNANCE PAGE — governance.html
  // ═══════════════════════════════════════════
  "gov-tag": { en: "Accountability & Trust", hi: "जवाबदेही और विश्वास" },
  "gov-hero-title-1": { en: "Governance & ", hi: "शासन और " },
  "gov-hero-title-2": { en: "Transparency", hi: "पारदर्शिता" },
  "gov-hero-desc": { en: "Our commitment to ethical governance and complete transparency in every initiative we undertake.", hi: "हमारे द्वारा की जाने वाली हर पहल में नैतिक शासन और पूर्ण पारदर्शिता के प्रति हमारी प्रतिबद्धता।" },
  "gov-reg-tag": { en: "Legal Identity", hi: "कानूनी पहचान" },
  "gov-reg-title": { en: "Registration Details", hi: "पंजीकरण विवरण" },
  "gov-org-name": { en: "Organization Name", hi: "संगठन का नाम" },
  "gov-reg-num": { en: "Registration Number", hi: "पंजीकरण संख्या" },
  "gov-12a": { en: "12A Certificate", hi: "12A प्रमाणपत्र" },
  "gov-80g": { en: "80G Certificate", hi: "80G प्रमाणपत्र" },
  "gov-pan": { en: "PAN Number", hi: "पैन नंबर" },
  "gov-addr": { en: "Registered Address", hi: "पंजीकृत पता" },
  "gov-addr-val": { en: "Ward No 2, Ambedkar Nagar, Rura, Kanpur Dehat, UP 209303", hi: "वार्ड नं 2, अंबेडकर नगर, रुरा, कानपुर देहात, UP 209303" },
  "gov-frame-tag": { en: "Structure", hi: "संरचना" },
  "gov-frame-title": { en: "Governance Framework", hi: "शासन ढांचा" },
  "gov-gb": { en: "General Body", hi: "आम सभा" },
  "gov-gb-desc": { en: "Supreme decision-making authority", hi: "सर्वोच्च निर्णय लेने वाला प्राधिकरण" },
  "gov-bod": { en: "Board of Directors", hi: "निदेशक मंडल" },
  "gov-bod-desc": { en: "Strategic oversight & policy governance", hi: "रणनीतिक निगरानी और नीति शासन" },
  "gov-ec": { en: "Executive Committee", hi: "कार्यकारी समिति" },
  "gov-ec-desc": { en: "Day-to-day operations & implementation", hi: "दैनिक संचालन और कार्यान्वयन" },
  "gov-pft": { en: "Programs & Field Teams", hi: "कार्यक्रम और क्षेत्रीय टीमें" },
  "gov-pft-desc": { en: "On-ground execution & community outreach", hi: "जमीनी स्तर पर क्रियान्वयन और सामुदायिक पहुँच" },
  "gov-pol-tag": { en: "Compliance", hi: "अनुपालन" },
  "gov-pol-title": { en: "Key Policies", hi: "प्रमुख नीतियाँ" },
  "gov-p1-title": { en: "Transparency Policy", hi: "पारदर्शिता नीति" },
  "gov-p1-desc": { en: "All financial records and program reports are publicly accessible and audited annually.", hi: "सभी वित्तीय रिकॉर्ड और कार्यक्रम रिपोर्ट सार्वजनिक रूप से उपलब्ध हैं और प्रतिवर्ष ऑडिट किए जाते हैं।" },
  "gov-p2-title": { en: "Financial Auditing", hi: "वित्तीय लेखा परीक्षा" },
  "gov-p2-desc": { en: "Independent third-party audits conducted every fiscal year with public disclosure.", hi: "प्रत्येक वित्तीय वर्ष में सार्वजनिक प्रकटीकरण के साथ स्वतंत्र तृतीय-पक्ष ऑडिट।" },
  "gov-p3-title": { en: "Anti-Corruption", hi: "भ्रष्टाचार विरोधी" },
  "gov-p3-desc": { en: "Zero-tolerance policy for corruption with strict internal controls and reporting mechanisms.", hi: "सख्त आंतरिक नियंत्रण और रिपोर्टिंग तंत्र के साथ भ्रष्टाचार के लिए शून्य-सहनशीलता नीति।" },
  "gov-p4-title": { en: "Conflict of Interest", hi: "हित का टकराव" },
  "gov-p4-desc": { en: "Board members must declare and recuse from decisions where personal interests exist.", hi: "बोर्ड सदस्यों को व्यक्तिगत हित वाले निर्णयों की घोषणा करनी चाहिए और खुद को अलग करना चाहिए।" },
  "gov-p5-title": { en: "Whistleblower Protection", hi: "व्हिसलब्लोअर सुरक्षा" },
  "gov-p5-desc": { en: "Safe, anonymous channels for reporting misconduct with full legal protection.", hi: "पूर्ण कानूनी सुरक्षा के साथ कदाचार की रिपोर्ट करने के लिए सुरक्षित, गुमनाम चैनल।" },
  "gov-p6-title": { en: "Data Privacy", hi: "डेटा गोपनीयता" },
  "gov-p6-desc": { en: "Full compliance with data protection standards for all stakeholder information.", hi: "सभी हितधारक जानकारी के लिए डेटा सुरक्षा मानकों का पूर्ण अनुपालन।" },
  "gov-fund-tag": { en: "Accountability", hi: "जवाबदेही" },
  "gov-fund-title": { en: "Fund Allocation", hi: "निधि आवंटन" },
  "gov-f-prog": { en: "Programs & Direct Impact", hi: "कार्यक्रम और प्रत्यक्ष प्रभाव" },
  "gov-f-admin": { en: "Administration", hi: "प्रशासन" },
  "gov-f-fund": { en: "Fundraising", hi: "धन संग्रह" },
  "gov-f-reserve": { en: "Reserve Fund", hi: "आरक्षित निधि" },
  "gov-f-programs-label": { en: "Programs", hi: "कार्यक्रम" },

  // ═══════════════════════════════════════════
  //  MEMBERSHIP PAGE — membership.html
  // ═══════════════════════════════════════════
  "mem-tag": { en: "Our Community", hi: "हमारा समुदाय" },
  "mem-hero-title-1": { en: "Become a ", hi: "बनें " },
  "mem-hero-title-2": { en: "Member", hi: "सदस्य" },
  "mem-hero-desc": { en: "Join a collective of visionaries dedicated to transformative social change. Your membership fuels sustainable initiatives across India.", hi: "परिवर्तनकारी सामाजिक बदलाव के लिए समर्पित दूरदर्शी लोगों के समूह से जुड़ें। आपकी सदस्यता पूरे भारत में स्थायी पहलों को बढ़ावा देती है।" },
  "mem-basic-tag": { en: "Annual Entry", hi: "वार्षिक प्रवेश" },
  "mem-basic": { en: "Basic", hi: "बेसिक" },
  "mem-year": { en: "/ year", hi: "/ वर्ष" },
  "mem-pro-tag": { en: "Advanced Impact", hi: "उन्नत प्रभाव" },
  "mem-pro": { en: "Pro", hi: "प्रो" },
  "mem-popular": { en: "Most Popular", hi: "सबसे लोकप्रिय" },
  "mem-patron-tag": { en: "Strategic Leader", hi: "रणनीतिक नेता" },
  "mem-patron": { en: "Patron", hi: "पेट्रन" },
  "mem-join": { en: "Join Now", hi: "अभी जुड़ें" },
  "mem-cert": { en: "Digital Certificate", hi: "डिजिटल प्रमाणपत्र" },
  "mem-newsletter": { en: "Monthly Newsletter", hi: "मासिक न्यूज़लेटर" },
  "mem-community": { en: "Online Community", hi: "ऑनलाइन समुदाय" },
  "mem-all-basic": { en: "All Basic Benefits", hi: "सभी बेसिक लाभ" },
  "mem-priority": { en: "Priority Support", hi: "प्राथमिकता सहायता" },
  "mem-events": { en: "Exclusive Events", hi: "विशेष कार्यक्रम" },
  "mem-voting": { en: "Voting Rights", hi: "मतदान अधिकार" },
  "mem-all-pro": { en: "All Pro Benefits", hi: "सभी प्रो लाभ" },
  "mem-advisory": { en: "Advisory Board", hi: "सलाहकार बोर्ड" },
  "mem-recognition": { en: "Public Recognition", hi: "सार्वजनिक मान्यता" },
  "mem-benefits-tag": { en: "The Member Edge", hi: "सदस्य लाभ" },
  "mem-benefits-title": { en: "Exclusive Advantages", hi: "विशेष फायदे" },
  "mem-b1-title": { en: "Global Network", hi: "वैश्विक नेटवर्क" },
  "mem-b1-desc": { en: "Connect with changemakers across 20+ states.", hi: "20+ राज्यों के परिवर्तनकर्ताओं से जुड़ें।" },
  "mem-b2-title": { en: "Skill Development", hi: "कौशल विकास" },
  "mem-b2-desc": { en: "Quarterly workshops on non-profit management.", hi: "गैर-लाभकारी प्रबंधन पर तिमाही कार्यशालाएँ।" },
  "mem-b3-title": { en: "Impact Reports", hi: "प्रभाव रिपोर्ट" },
  "mem-b3-desc": { en: "Quarterly audits of how your funds transform lives.", hi: "आपकी निधि जीवन कैसे बदलती है, इसका तिमाही ऑडिट।" },
  "mem-b4-title": { en: "Event Invitations", hi: "कार्यक्रम आमंत्रण" },
  "mem-b4-desc": { en: "Early-bird access to summits and galas.", hi: "सम्मेलनों और समारोहों में अग्रिम प्रवेश।" },
  "mem-b5-title": { en: "Tax Benefits (80G)", hi: "कर लाभ (80G)" },
  "mem-b5-desc": { en: "Contributions are tax-exempt under Section 80G.", hi: "योगदान धारा 80G के तहत कर-मुक्त हैं।" },
  "mem-b6-title": { en: "Leadership", hi: "नेतृत्व" },
  "mem-b6-desc": { en: "Lead regional chapters and represent AASW.", hi: "क्षेत्रीय अध्यायों का नेतृत्व करें और AASW का प्रतिनिधित्व करें।" },
  "mem-form-title": { en: "Membership Application", hi: "सदस्यता आवेदन" },
  "mem-form-desc": { en: "Complete the form below to begin your journey with AASW Foundation.", hi: "AASW फाउंडेशन के साथ अपनी यात्रा शुरू करने के लिए नीचे दिया गया फ़ॉर्म भरें।" },
  "mem-f-name": { en: "Full Name *", hi: "पूरा नाम *" },
  "mem-f-email": { en: "Email *", hi: "ईमेल *" },
  "mem-f-phone": { en: "Phone *", hi: "फ़ोन *" },

  "mem-f-address": { en: "Address *", hi: "पता *" },
  "mem-f-tier": { en: "Membership Tier *", hi: "सदस्यता स्तर *" },
  "mem-f-txn": { en: "Transaction ID (UPI/Bank)", hi: "लेनदेन आईडी (UPI/बैंक)" },
  "mem-f-submit": { en: "Submit Membership Application", hi: "सदस्यता आवेदन जमा करें" },
  "mem-faq-tag": { en: "Inquiries", hi: "पूछताछ" },
  "mem-faq-title": { en: "Frequently Asked Questions", hi: "अक्सर पूछे जाने वाले प्रश्न" },
  "mem-faq-1-q": { en: "How is my membership fee utilized?", hi: "मेरी सदस्यता शुल्क का उपयोग कैसे किया जाता है?" },
  "mem-faq-1-a": { en: "Membership fees are directed toward our Core Foundation Fund, which supports operational overhead, rapid-response disaster relief, and pilot projects for rural education.", hi: "सदस्यता शुल्क हमारे मुख्य फाउंडेशन फंड की ओर निर्देशित किया जाता है, जो परिचालन, आपदा राहत और ग्रामीण शिक्षा के लिए पायलट परियोजनाओं का समर्थन करता है।" },
  "mem-faq-2-q": { en: "Can I upgrade my tier later?", hi: "क्या मैं बाद में अपना स्तर अपग्रेड कर सकता हूँ?" },
  "mem-faq-2-a": { en: "Yes, you can upgrade your membership tier at any time by paying the difference amount through our member portal or contacting support.", hi: "हाँ, आप हमारे सदस्य पोर्टल या सहायता से संपर्क करके अंतर राशि का भुगतान करके किसी भी समय अपनी सदस्यता स्तर अपग्रेड कर सकते हैं।" },
  "mem-faq-3-q": { en: "What is the duration of membership?", hi: "सदस्यता की अवधि क्या है?" },
  "mem-faq-3-a": { en: "All memberships are valid for 12 months from the date of enrollment and can be renewed annually.", hi: "सभी सदस्यताएँ नामांकन की तिथि से 12 महीने के लिए मान्य हैं और प्रतिवर्ष नवीनीकृत की जा सकती हैं।" },
  "mem-faq-4-q": { en: "Are international members allowed?", hi: "क्या अंतर्राष्ट्रीय सदस्यों की अनुमति है?" },
  "mem-faq-4-a": { en: "Yes! AASW Foundation welcomes international members. Payments can be made via international bank transfer or UPI.", hi: "हाँ! AASW फाउंडेशन अंतर्राष्ट्रीय सदस्यों का स्वागत करता है। भुगतान अंतर्राष्ट्रीय बैंक ट्रांसफर या UPI के माध्यम से किया जा सकता है।" },

  // ═══════════════════════════════════════════
  //  PRIVACY PAGE — privacy.html
  // ═══════════════════════════════════════════
  "priv-tag": { en: "Data Protection", hi: "डेटा सुरक्षा" },
  "priv-hero-title-1": { en: "Privacy ", hi: "गोपनीयता " },
  "priv-hero-title-2": { en: "Policy", hi: "नीति" },
  "priv-hero-desc": { en: "How we collect, use, and protect your personal data when you interact with AASW Foundation.", hi: "जब आप AASW फाउंडेशन के साथ बातचीत करते हैं तो हम आपके व्यक्तिगत डेटा को कैसे एकत्र, उपयोग और सुरक्षित करते हैं।" },
  "priv-sub-tag": { en: "Your Privacy Matters", hi: "आपकी गोपनीयता महत्वपूर्ण है" },
  "priv-sub-title": { en: "Privacy & Data Protection", hi: "गोपनीयता और डेटा सुरक्षा" },
  "priv-sub-desc": { en: "AASW Foundation respects your privacy and is committed to protecting your personal data when you interact with our website, donate, or volunteer with us.", hi: "AASW फाउंडेशन आपकी गोपनीयता का सम्मान करता है और जब आप हमारी वेबसाइट पर जाते हैं, दान करते हैं, या हमारे साथ स्वयंसेवा करते हैं तो आपके व्यक्तिगत डेटा की सुरक्षा के लिए प्रतिबद्ध है।" },
  "priv-1-title": { en: "1. Information We Collect", hi: "1. हम कौन सी जानकारी एकत्र करते हैं" },
  "priv-1-desc": { en: "We may collect personal identification information including your name, email address, phone number, and mailing address when you make a donation or subscribe to our newsletter. Payment details are processed securely by our trusted gateway partners (Razorpay/PayU) and are not stored on our servers.", hi: "जब आप दान करते हैं या हमारे न्यूज़लेटर की सदस्यता लेते हैं तो हम व्यक्तिगत पहचान जानकारी एकत्र कर सकते हैं जिसमें आपका नाम, ईमेल पता, फ़ोन नंबर और डाक पता शामिल है। भुगतान विवरण हमारे विश्वसनीय गेटवे भागीदारों (Razorpay/PayU) द्वारा सुरक्षित रूप से संसाधित किए जाते हैं और हमारे सर्वर पर संग्रहीत नहीं किए जाते हैं।" },
  "priv-2-title": { en: "2. How We Use Your Information", hi: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं" },
  "priv-2-l1": { en: "To process donations and issue 80G tax limit receipts.", hi: "दान को संसाधित करने और 80G कर सीमा रसीदें जारी करने के लिए।" },
  "priv-2-l2": { en: "To send periodic updates, newsletters, and impact reports.", hi: "समय-समय पर अपडेट, न्यूज़लेटर और प्रभाव रिपोर्ट भेजने के लिए।" },
  "priv-2-l3": { en: "To improve our website functionality and user experience.", hi: "हमारी वेबसाइट की कार्यक्षमता और उपयोगकर्ता अनुभव को बेहतर बनाने के लिए।" },
  "priv-3-title": { en: "3. Data Security", hi: "3. डेटा सुरक्षा" },
  "priv-3-desc": { en: "We implement a variety of security measures to maintain the safety of your personal information. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your explicit consent.", hi: "हम आपकी व्यक्तिगत जानकारी की सुरक्षा बनाए रखने के लिए विभिन्न सुरक्षा उपाय लागू करते हैं। हम आपकी स्पष्ट सहमति के बिना आपकी व्यक्तिगत पहचान योग्य जानकारी बाहरी पक्षों को बेचते, व्यापार या अन्यथा स्थानांतरित नहीं करते हैं।" },
  "priv-4-title": { en: "4. Contacting Us", hi: "4. हमसे संपर्क करें" },
  "priv-4-desc": { en: "If there are any questions regarding this privacy policy, you may contact us via:", hi: "यदि इस गोपनीयता नीति के बारे में कोई प्रश्न हैं, तो आप इसके माध्यम से हमसे संपर्क कर सकते हैं:" },

  // ═══════════════════════════════════════════
  //  REFUND PAGE — refund.html
  // ═══════════════════════════════════════════
  "ref-tag": { en: "Policies", hi: "नीतियाँ" },
  "ref-hero-title-1": { en: "Refund & ", hi: "रिफंड और " },
  "ref-hero-title-2": { en: "Cancellation", hi: "रद्दीकरण" },
  "ref-hero-desc": { en: "Our policy on refund and cancellation of membership fees.", hi: "सदस्यता शुल्क की वापसी और रद्दीकरण पर हमारी नीति।" },
  "ref-sub-tag": { en: "policies", hi: "नीतियाँ" },
  "ref-sub-title": { en: "Refund & Cancellation Policy", hi: "रिफंड और रद्दीकरण नीति" },
  "ref-sub-desc": { en: "Our policy on refund and cancellation of Membership fees received for AASW Foundation on secure online payment gateway is as under:", hi: "सुरक्षित ऑनलाइन भुगतान गेटवे पर AASW फाउंडेशन के लिए प्राप्त सदस्यता शुल्क की वापसी और रद्दीकरण पर हमारी नीति निम्नानुसार है:" },
  "ref-notice-title": { en: "No Refund Policy", hi: "कोई रिफंड नहीं नीति" },
  "ref-notice-desc": { en: "Any request for cancellations and refund of online Membership fees once duly placed on the website, shall not be entertained under any circumstances. No cash or refund of money will be allowed after completing the online Membership fees as it is an extremely cumbersome process.", hi: "वेबसाइट पर विधिवत रूप से ऑनलाइन सदस्यता शुल्क की रद्दीकरण और वापसी के किसी भी अनुरोध को किसी भी परिस्थिति में स्वीकार नहीं किया जाएगा। ऑनलाइन सदस्यता शुल्क पूरा करने के बाद किसी भी नकद या धन की वापसी की अनुमति नहीं दी जाएगी क्योंकि यह एक अत्यंत कठिन प्रक्रिया है।" },
  "ref-notice-tip": { en: "We therefore request you to be ", hi: "इसलिए हम आपसे अनुरोध करते हैं कि " },
  "ref-notice-sure": { en: "sure before you make payment", hi: "भुगतान करने से पहले सुनिश्चित करें" },
  "ref-notice-tip2": { en: " for Membership fees. Please review the membership tier details, benefits, and pricing carefully before proceeding with the payment.", hi: " सदस्यता शुल्क के लिए। कृपया भुगतान के साथ आगे बढ़ने से पहले सदस्यता स्तर विवरण, लाभ और मूल्य निर्धारण की सावधानीपूर्वक समीक्षा करें।" },
  "ref-help-title": { en: "Need Help?", hi: "मदद चाहिए?" },
  "ref-help-desc": { en: "If you have any questions about our refund policy, reach out to our support team.", hi: "यदि आपके पास हमारी रिफंड नीति के बारे में कोई प्रश्न हैं, तो हमारी सहायता टीम से संपर्क करें।" },
  "ref-secure-title": { en: "Secure Payments", hi: "सुरक्षित भुगतान" },
  "ref-secure-desc": { en: "All transactions are processed through secure payment gateways. Your financial data is never stored on our servers.", hi: "सभी लेनदेन सुरक्षित भुगतान गेटवे के माध्यम से संसाधित किए जाते हैं। आपका वित्तीय डेटा कभी भी हमारे सर्वर पर संग्रहीत नहीं किया जाता है।" },
  "ref-cta": { en: "Interested in our membership program?", hi: "हमारे सदस्यता कार्यक्रम में रुचि है?" },
  "ref-cta-btn": { en: "View Membership Plans", hi: "सदस्यता योजनाएँ देखें" },

  // ═══════════════════════════════════════════
  //  404 PAGE
  // ═══════════════════════════════════════════
  "404-title": { en: "Page Not Found", hi: "पृष्ठ नहीं मिला" },
  "404-desc": { en: "The page you're looking for doesn't exist or has been moved.", hi: "जो पृष्ठ आप ढूंढ रहे हैं वह मौजूद नहीं है या स्थानांतरित कर दिया गया है।" },
  "404-home": { en: "Back to Home", hi: "होम पर वापस जाएँ" },
};

// ═══════════════════════════════════════════
//  i18n ENGINE
// ═══════════════════════════════════════════

function getCurrentLang() {
  return localStorage.getItem('aasw-lang') || 'en';
}

function setLang(lang) {
  localStorage.setItem('aasw-lang', lang);
  applyTranslations(lang);
  updateLangButtons(lang);
  // Update HTML lang attribute
  document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
}

function applyTranslations(lang) {
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    const t = TRANSLATIONS[key];
    if (!t) return;

    const text = t[lang] || t['en'];

    // Handle input placeholders
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    }
    // Handle elements with only text content (no child elements with data-t)
    else if (el.getAttribute('data-t-html') === 'true') {
      el.innerHTML = text;
    }
    else {
      // Only replace text if the element has no child elements with data-t
      const childTranslatables = el.querySelectorAll('[data-t]');
      if (childTranslatables.length === 0) {
        el.textContent = text;
      } else {
        // Replace only the direct text nodes
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.textContent = text;
            break;
          }
        }
      }
    }
  });
}

function updateLangButtons(lang) {
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    const btnLang = btn.getAttribute('data-lang-btn');
    if (btnLang === lang) {
      btn.classList.add('text-primary', 'font-bold');
      btn.classList.remove('text-on-surface-variant');
    } else {
      btn.classList.remove('text-primary', 'font-bold');
      btn.classList.add('text-on-surface-variant');
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const lang = getCurrentLang();
  if (lang !== 'en') {
    applyTranslations(lang);
  }
  updateLangButtons(lang);
});
