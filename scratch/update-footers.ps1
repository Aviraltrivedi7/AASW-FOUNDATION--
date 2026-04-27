$basePath = "c:\Users\trive\Downloads\AASW-Foundation-Website\aasw-pro"
$files = Get-ChildItem -Path "$basePath\*.html" | Where-Object { $_.Name -ne 'dashboard.html' }
$adminFiles = Get-ChildItem -Path "$basePath\admin\*.html" -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $changed = $false

    # 1. Replace footer social icons with LinkedIn, Facebook, Instagram (with real SVGs)
    $oldSocial = '<a class="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:text-secondary transition-colors" href="#">
<span class="material-symbols-outlined text-xl">social_leaderboard</span>
</a>
<a class="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:text-secondary transition-colors" href="#">
<span class="material-symbols-outlined text-xl">share</span>
</a>
<a class="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:text-secondary transition-colors" href="#">
<span class="material-symbols-outlined text-xl">public</span>
</a>'

    $newSocial = '<a class="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:text-secondary transition-colors" href="https://www.linkedin.com/company/108100135/admin/page-posts/published/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
</a>
<a class="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:text-secondary transition-colors" href="https://www.facebook.com/share/19TMKDwzfi/" target="_blank" rel="noopener noreferrer" title="Facebook">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg>
</a>
<a class="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:text-secondary transition-colors" href="https://www.instagram.com/aaswfoundation?igsh=MTBvb2sxN2pqeWkxbA==" target="_blank" rel="noopener noreferrer" title="Instagram">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3z"/></svg>
</a>'

    if ($content.Contains($oldSocial)) {
        $content = $content.Replace($oldSocial, $newSocial)
        $changed = $true
    }

    # 2. Replace footer contact section
    $oldContact = '<h4 class="font-label text-xs uppercase tracking-[0.3em] font-bold text-white">Contact</h4>
<div class="space-y-4 font-label text-xs tracking-widest text-on-surface-variant uppercase">
<p>New Delhi Office</p>
<p>+91 11 4050 6070</p>
<p>contact@aaswfoundation.org</p>
</div>'

    $newContact = '<h4 class="font-label text-xs uppercase tracking-[0.3em] font-bold text-white">Contact</h4>
<div class="space-y-4 font-label text-xs tracking-widest text-on-surface-variant uppercase">
<p>Kanpur Dehat, UP</p>
<p>+91 9984156418</p>
<p>aaswfoundation06@gmail.com</p>
</div>'

    if ($content.Contains($oldContact)) {
        $content = $content.Replace($oldContact, $newContact)
        $changed = $true
    }

    # 3. Replace "Spread the Word" card social links
    $oldSpread = '<a href="#" class="text-on-surface-variant hover:text-white transition-colors"><span class="material-symbols-outlined">share</span></a>
                <a href="#" class="text-on-surface-variant hover:text-white transition-colors"><span class="material-symbols-outlined">public</span></a>'

    $newSpread = '<a href="https://www.facebook.com/share/19TMKDwzfi/" target="_blank" rel="noopener noreferrer" class="text-on-surface-variant hover:text-white transition-colors" title="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg></a>
                <a href="https://www.instagram.com/aaswfoundation?igsh=MTBvb2sxN2pqeWkxbA==" target="_blank" rel="noopener noreferrer" class="text-on-surface-variant hover:text-white transition-colors" title="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3z"/></svg></a>'

    if ($content.Contains($oldSpread)) {
        $content = $content.Replace($oldSpread, $newSpread)
        $changed = $true
    }

    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated: $($file.Name)"
    } else {
        Write-Host "No changes: $($file.Name)"
    }
}

Write-Host "`nDone! All footer updates complete."
