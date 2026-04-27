import os
import re

# The updated HTML for the navbar without language switcher
NEW_NAV_HTML = r'''
<nav id="main-nav" class="fixed top-0 left-0 w-full z-[100] transition-all duration-500 py-6">
<div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="glass-header rounded-[2.5rem] px-6 py-3 flex justify-between items-center shadow-[0_20_50_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden group">
        <!-- Shine Effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

        <!-- Left: Branding -->
        <div class="flex items-center gap-8">
            <a href="/" class="flex items-center gap-3 group/logo relative">
                <div class="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500 rounded-full"></div>
                <img src="/images/logo.png" alt="AASW" class="h-14 w-14 object-cover rounded-full border-2 border-white/20 shadow-2xl relative z-10 transition-transform duration-500 group-hover/logo:scale-110">
            </a>
            
            <!-- Desktop Nav Links -->
            <div class="hidden lg:flex items-center space-x-8 font-label text-[11px] uppercase tracking-[0.25em] font-bold border-l border-white/10 pl-8 h-8">
                <a class="nav-link text-primary hover:text-white transition-all underline decoration-2 underline-offset-8" href="/">Home</a>
                <a class="nav-link text-on-surface-variant hover:text-primary transition-all pb-1" href="/team">Team</a>
                <a class="nav-link text-on-surface-variant hover:text-primary transition-all pb-1" href="/membership">Join</a>
                <a class="nav-link text-on-surface-variant hover:text-primary transition-all pb-1" href="/governance">Governance</a>
                <a class="nav-link text-on-surface-variant hover:text-primary transition-all pb-1" href="/#contact">Contact</a>
            </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-6">
            <!-- CTA Button -->
            <button onclick="window.location.href='/membership'" class="hidden md:block bg-gradient-to-r from-primary to-secondary text-on-primary px-8 py-2.5 rounded-full font-label text-[11px] font-black uppercase tracking-[0.15em] shadow-[0_0_30px_rgba(148,170,255,0.3)] hover:scale-105 active:scale-95 transition-all">
                Become a Member
            </button>

            <!-- Admin Shortcut (Icon Only) -->
            <a href="/admin/login" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all group/admin">
                <span class="material-symbols-outlined text-xl group-hover/admin:rotate-12 transition-transform">admin_panel_settings</span>
            </a>
            
            <!-- Mobile Menu Toggle -->
            <button class="md:hidden text-white">
                <span class="material-symbols-outlined font-black">menu</span>
            </button>
        </div>
    </div>
</div>
</nav>

<style>
@keyframes shimmer {
    100% { transform: translateX(100%); }
}
.glass-header {
    background: rgba(14, 14, 15, 0.7);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
}
.nav-link {
    position: relative;
}
.nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1.5px;
    background: linear-gradient(to right, #94aaff, #cb7bff);
    transition: width 0.3s ease;
}
.nav-link:hover::after {
    width: 100%;
}
#main-nav.scrolled {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
}
#main-nav.scrolled .glass-header {
    background: rgba(14, 14, 15, 0.9);
    border-radius: 0 0 1.5rem 1.5rem;
    border-top: none;
}
</style>

<script>
window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (nav && window.scrollY > 20) {
        nav.classList.add('scrolled');
    } else if (nav) {
        nav.classList.remove('scrolled');
    }
});
</script>
'''

def sync_static_nav():
    for root, _, files in os.walk('aasw-pro'):
        for file in files:
            if file.endswith('.html'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace the entire <nav>...</nav> block and script/style that follow if they are in the sync block
                # Since my previous sync script put everything inside <nav> tag was a bit sloppy,
                # let's just target the <nav id="main-nav" ...> block
                # However, the previous script might have mis-placed the script tags.
                
                # New regex to replace the entire old nav structure produced by previous turn
                new_content = re.sub(r'<nav id="main-nav".*?</script>', NEW_NAV_HTML, content, flags=re.DOTALL)
                
                if new_content != content:
                    print(f"Syncing Navbar (Rem lang) in {path}")
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    sync_static_nav()
