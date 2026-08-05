import re
import os

def build_pages():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Split header and footer
    parts = re.split(r'<!-- ══ HERO IMAGE SLIDER ══ -->', html)
    header = parts[0]
    
    parts_footer = re.split(r'<!-- ══ FOOTER ══ -->', html)
    footer = '<!-- ══ FOOTER ══ -->' + parts_footer[1]

    # Adjust paths in header if necessary (not needed since they are in the same dir)
    # Give Active state
    
    def create_page(filename, title, content_html):
        page_html = header.replace('<title>AASW Foundation | Empowering Lives, Building Futures</title>', f'<title>{title} | AASW Foundation</title>')
        
        # Build a beautiful premium internal header
        internal_header = f"""
  <section class="slider-section" style="height: 40vh; min-height: 350px;">
    <div class="slider-track" style="height: 100%;">
      <div class="slide slide-bg-1" style="height: 100%; opacity: 1; position: absolute;">
        <div class="slide-overlay" style="background: linear-gradient(to top, rgba(10,31,20,0.9), rgba(10,31,20,0.5));"></div>
        <div class="slide-content" style="text-align: center; max-width: 800px; padding-top: 100px;">
          <h1 class="slide-title" style="font-size: 3.5rem;">{title}</h1>
        </div>
      </div>
    </div>
  </section>
  <main style="padding: 100px 20px; background: #faf8f4; min-height: 50vh;">
    <div class="container" style="max-width: 1000px; margin: 0 auto; background: #fff; padding: 60px; border-radius: 24px; box-shadow: 0 24px 80px rgba(15,76,42,0.06); border: 1px solid rgba(15,76,42,0.08);">
      {content_html}
    </div>
  </main>
"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(page_html + internal_header + footer)

    # 1. Team
    team_content = """
    <div style="text-align: center; margin-bottom: 50px;">
        <span class="section-tag" style="padding: 8px 16px; border-radius: 50px; background: rgba(39,174,96,0.1); color: var(--g1); font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;">Leadership</span>
        <h2 style="font-size: 2.5rem; color: var(--g1); margin-top: 20px;">Meet Our Dedicated Team</h2>
        <p style="color: #4a5c50; font-size: 1.1rem; max-width: 600px; margin: 20px auto;">The passionate individuals working tirelessly to uplift communities and drive positive change across India.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px;">
        <div style="text-align: center;">
            <div style="width: 180px; height: 180px; border-radius: 50%; background: #e8f5ec; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(15,76,42,0.1);">
                <i data-lucide="user" style="width: 60px; height: 60px; color: var(--g2);"></i>
            </div>
            <h3 style="font-size: 1.3rem; color: var(--g1); margin-bottom: 5px;">Dr. Anjali Sharma</h3>
            <p style="color: var(--gold-dark); font-weight: 600; font-size: 0.9rem;">Founder & President</p>
        </div>
        <div style="text-align: center;">
            <div style="width: 180px; height: 180px; border-radius: 50%; background: #e8f5ec; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(15,76,42,0.1);">
                <i data-lucide="user" style="width: 60px; height: 60px; color: var(--g2);"></i>
            </div>
            <h3 style="font-size: 1.3rem; color: var(--g1); margin-bottom: 5px;">Vikram Singh</h3>
            <p style="color: var(--gold-dark); font-weight: 600; font-size: 0.9rem;">Operations Director</p>
        </div>
        <div style="text-align: center;">
            <div style="width: 180px; height: 180px; border-radius: 50%; background: #e8f5ec; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(15,76,42,0.1);">
                <i data-lucide="user" style="width: 60px; height: 60px; color: var(--g2);"></i>
            </div>
            <h3 style="font-size: 1.3rem; color: var(--g1); margin-bottom: 5px;">Priya Desai</h3>
            <p style="color: var(--gold-dark); font-weight: 600; font-size: 0.9rem;">Head of Programs</p>
        </div>
    </div>
    """
    create_page('team.html', 'Our Team', team_content)

    # 2. Privacy Policy
    privacy_content = """
    <div style="color: #2a3c30; line-height: 1.8;">
        <h2 style="font-size: 2rem; color: var(--g1); margin-bottom: 20px;">1. Introduction</h2>
        <p style="margin-bottom: 30px;">AASW Foundation respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you interact with our website, donate, or volunteer with us.</p>
        
        <h2 style="font-size: 2rem; color: var(--g1); margin-bottom: 20px;">2. Information We Collect</h2>
        <p style="margin-bottom: 30px;">We may collect personal identification information including your name, email address, phone number, and mailing address when you make a donation or subscribe to our newsletter. Payment details are processed securely by our trusted gateway partners (Razorpay/PayU) and are not stored on our servers.</p>
        
        <h2 style="font-size: 2rem; color: var(--g1); margin-bottom: 20px;">3. How We Use Your Information</h2>
        <ul style="margin-bottom: 30px; padding-left: 20px;">
            <li style="margin-bottom: 10px;">To process donations and issue 80G tax limit receipts.</li>
            <li style="margin-bottom: 10px;">To send periodic updates, newsletters, and impact reports.</li>
            <li style="margin-bottom: 10px;">To improve our website functionality and user experience.</li>
        </ul>
        
        <h2 style="font-size: 2rem; color: var(--g1); margin-bottom: 20px;">4. Data Security</h2>
        <p>We implement a variety of security measures to maintain the safety of your personal information. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent.</p>
    </div>
    """
    create_page('privacy.html', 'Privacy Policy', privacy_content)

    # 3. Governance
    gov_content = """
    <div style="text-align: center; margin-bottom: 50px;">
        <span class="section-tag" style="padding: 8px 16px; border-radius: 50px; background: rgba(39,174,96,0.1); color: var(--g1); font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;">Transparency</span>
        <h2 style="font-size: 2.5rem; color: var(--g1); margin-top: 20px;">Governance & Accountability</h2>
        <p style="color: #4a5c50; font-size: 1.1rem; max-width: 600px; margin: 20px auto;">AASW Foundation operates with the highest standards of integrity, transparency, and accountability to our donors and the communities we serve.</p>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px;">
        <div style="padding: 30px; background: #faf8f4; border-radius: 16px; border: 1px solid rgba(15,76,42,0.05);">
            <div style="width: 60px; height: 60px; border-radius: 12px; background: var(--gradient-cta); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <i data-lucide="shield-check" style="color: white; width: 30px; height: 30px;"></i>
            </div>
            <h3 style="font-size: 1.4rem; color: var(--g1); margin-bottom: 15px;">Board of Trustees</h3>
            <p style="color: #4a5c50; line-height: 1.7;">Our Board oversees the foundation's strategic direction, financial health, and adherence to our core values, meeting quarterly to review program impacts and audits.</p>
        </div>
        <div style="padding: 30px; background: #faf8f4; border-radius: 16px; border: 1px solid rgba(15,76,42,0.05);">
            <div style="width: 60px; height: 60px; border-radius: 12px; background: var(--gradient-cta); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <i data-lucide="file-text" style="color: white; width: 30px; height: 30px;"></i>
            </div>
            <h3 style="font-size: 1.4rem; color: var(--g1); margin-bottom: 15px;">Financial Audits</h3>
            <p style="color: #4a5c50; line-height: 1.7;">We undergo rigorous annual statutory audits by independent chartered accountants. We are 12A and 80G certified, complying fully with all governmental requirements.</p>
        </div>
    </div>
    """
    create_page('governance.html', 'Governance', gov_content)

    # 5. Donate 
    donate_content = """
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center;">
        <div>
            <span class="section-tag" style="padding: 8px 16px; border-radius: 50px; background: rgba(245, 166, 35, 0.15); color: var(--gold-dark); font-weight: 800; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;">Support Us</span>
            <h2 style="font-size: 3rem; color: var(--g1); margin: 20px 0; line-height: 1.1;">Your Contribution Changes Lives.</h2>
            <p style="color: #4a5c50; font-size: 1.15rem; line-height: 1.7; margin-bottom: 30px;">Every rupee you donate goes directly towards our education, health, and livelihood programs. Help us build a stronger, more equitable India.</p>
            <ul style="list-style: none; padding: 0; margin-bottom: 40px;">
                <li style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 1.1rem; color: var(--g1); font-weight: 600;"><i data-lucide="check-circle" style="color: var(--g2);"></i> 100% Secure Donations</li>
                <li style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 1.1rem; color: var(--g1); font-weight: 600;"><i data-lucide="check-circle" style="color: var(--g2);"></i> Tax Exemption under 80G</li>
                <li style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 1.1rem; color: var(--g1); font-weight: 600;"><i data-lucide="check-circle" style="color: var(--g2);"></i> Regular Impact Updates</li>
            </ul>
        </div>
        <div style="background: #faf8f4; padding: 40px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
            <h3 style="font-size: 1.6rem; color: var(--g1); margin-bottom: 25px;">Choose Donation Amount</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <button style="padding: 15px; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1.1rem; font-weight: 700; color: var(--g1); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--gold-vivid)'" onmouseout="this.style.borderColor='#e2e8f0'">₹1,000</button>
                <button style="padding: 15px; background: rgba(245,166,35,0.1); border: 2px solid var(--gold-vivid); border-radius: 12px; font-size: 1.1rem; font-weight: 700; color: var(--gold-dark); cursor: pointer;">₹2,500</button>
                <button style="padding: 15px; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1.1rem; font-weight: 700; color: var(--g1); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--gold-vivid)'" onmouseout="this.style.borderColor='#e2e8f0'">₹5,000</button>
            </div>
            <input type="number" placeholder="Custom Amount (₹)" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1.1rem; margin-bottom: 25px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--g2)'" onblur="this.style.borderColor='#e2e8f0'" />
            <a href="https://razorpay.com/" class="btn-hero-primary" style="display: block; text-align: center; width: 100%; border-radius: 12px; text-decoration: none;">Proceed to Payment <span style="margin-left:8px;">→</span></a>
            <p style="text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--muted);"><i data-lucide="lock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 5px;"></i> SSL Secured Processing via Razorpay</p>
        </div>
    </div>
    """
    create_page('donate.html', 'Donate Now', donate_content)

if __name__ == '__main__':
    build_pages()
    print("Files successfully generated.")
