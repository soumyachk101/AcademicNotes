/* Group A/B/C paging.
   Arrow keys move between groups. The links carry rel="prev"/"next" so the
   markup stays the source of truth and this file needs no per-page config. */
(function () {
    'use strict';

    var prev = document.querySelector('a[rel="prev"]');
    var next = document.querySelector('a[rel="next"]');
    if (!prev && !next) return;

    function typing(el) {
        if (!el) return false;
        if (el.isContentEditable) return true;
        return /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    }

    document.addEventListener('keydown', function (e) {
        // Let the browser keep its own shortcuts (back/forward, word-jump…)
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
        if (typing(document.activeElement)) return;

        var go = e.key === 'ArrowLeft' ? prev : e.key === 'ArrowRight' ? next : null;
        if (!go) return;

        e.preventDefault();
        go.classList.add('is-firing');
        window.location.href = go.href;
    });

    // Reveal the hint only for people who actually have a keyboard to press.
    var hint = document.querySelector('.pager-hint');
    if (hint && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        hint.hidden = false;
    }
})();
