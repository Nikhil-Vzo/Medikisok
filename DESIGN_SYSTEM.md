// MediKiosk Design System Tokens
// Apply these across every page/component to keep visual consistency.
//
// COLOR PALETTE
// - Background:     #FAFAF7 (warm off-white) or white
// - Text primary:  slate-900
// - Text body:     slate-600
// - Text meta:     slate-500
// - Borders:       slate-200/200-300
// - Primary CTA:   bg-slate-900 text-white
// - Secondary CTA: bg-white border border-slate-200
// - Danger:        red-50/200/600
// - Accents:       minimal — only red for emergency
//
// TYPOGRAPHY
// - Headlines:     text-2xl to text-7xl, font-semibold, tracking-[-0.02em]
// - Body:          text-sm to text-base, font-normal
// - Meta/labels:   text-xs to text-[13px], font-medium, text-slate-500
// - All caps:      uppercase tracking-wider (for section labels only)
//
// SPACING
// - Section padding: py-24 lg:py-32
// - Container:     max-w-6xl mx-auto px-6 lg:px-8
// - Card padding:  p-6 to p-10
//
// SHAPES
// - Buttons:       rounded-md (6px) — never more
// - Cards:         rounded-xl (12px)
// - Sections:      rounded-2xl max for emphasis panels
// - Pills/badges:  rounded-md or rounded-full only for status dots
//
// RULES — STRIP THESE AI SLOP PATTERNS:
// 1. NO dark gradients (emerald-950, slate-950, ayush-900 to slate-950)
// 2. NO blur-[120px] glow blobs
// 3. NO text-transparent bg-clip-text rainbows
// 4. NO backdrop-blur-xl glassmorphism
// 5. NO "Sparkles" ✨ decorative icons
// 6. NO emojis as visual interest
// 7. NO "Connected" / "Live" green status pills with shadows
// 8. NO 3xl rounded corners on every card
// 9. NO color gradients on CTA buttons
// 10. NO pulsing animated borders as decoration
// 11. NO "rounded-2xl" on every interactive surface
// 12. NO ayush-*/vedic-* color palette as primary brand — use slate-900
//
// REPLACEMENT PATTERNS:
// - bg-ayush-800     → bg-slate-900
// - bg-ayush-50      → bg-slate-50
// - text-ayush-900   → text-slate-900
// - text-ayush-700   → text-slate-700
// - border-ayush-200 → border-slate-200
// - hover:bg-ayush-50 → hover:bg-slate-50
// - rounded-2xl on small elements → rounded-md
// - rounded-3xl on cards → rounded-xl
// - shadow-lg / shadow-xl → shadow-sm (or no shadow)
// - ring-4 focus rings → ring-2 or focus-visible:ring-2
// - bg-vedic-600     → bg-amber-600 (use only for AYUSH/vedic-specific alerts)
// - bg-gradient-to-* → solid bg-slate-* colors
// - backdrop-blur-*  → remove (or use bg-white/80 backdrop-blur-sm max)
// - animate-pulse   → remove (use only for live status dots, not buttons)
// - animate-bounce   → remove
// - animate-ping     → remove
// - shadow-alert-glow → remove
// - shadow-ayush-*  → remove
// - shadow-kiosk     → remove
// - bg-ayush-50/90  → bg-slate-50
// - bg-ayush-100    → bg-slate-100
//
// HEADLINE STRUCTURE:
// Section eyebrow: text-[12px] font-semibold tracking-wider text-slate-500 uppercase
// Section title:   text-[28px] lg:text-[32px] font-semibold tracking-[-0.02em] text-slate-900
// Section body:    text-[15px] text-slate-600 leading-relaxed
//
// CARD STRUCTURE:
// Wrapper:   rounded-xl border border-slate-200 bg-white p-6
// Header:    flex justify-between items-center pb-4 border-b border-slate-100
// Title:     text-[15px] font-semibold text-slate-900
// Body:      text-[13px] text-slate-600
//
// BUTTONS:
// Primary:   inline-flex items-center gap-2 h-11 px-5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800
// Secondary: inline-flex items-center gap-2 h-11 px-5 rounded-md bg-white text-slate-900 text-sm font-medium border border-slate-200 hover:border-slate-300
// Danger:    inline-flex items-center gap-2 h-11 px-5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700
// Kiosk touch: h-16 px-8 text-lg font-medium rounded-md (no hover scaling, no glow)
