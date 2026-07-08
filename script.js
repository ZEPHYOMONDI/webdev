/* ============================================================
   JOSEPH BLOG – script.js
   Handles: scroll animations, breaking ticker, profile upload,
   comment form, newsletter, lightbox, back-to-top, search.
============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. SCROLL FADE-IN OBSERVER
────────────────────────────────────────────────────────── */
(function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ──────────────────────────────────────────────────────────
   2. BACK TO TOP BUTTON
────────────────────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ──────────────────────────────────────────────────────────
   3. BREAKING NEWS TICKER – clone for seamless loop
────────────────────────────────────────────────────────── */
(function initTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;

  // Duplicate content so the ticker loops seamlessly
  track.innerHTML += track.innerHTML;
})();

/* ──────────────────────────────────────────────────────────
   4. PROFILE IMAGE UPLOAD PREVIEW
────────────────────────────────────────────────────────── */
(function initProfileUpload() {
  const input = document.getElementById('imgUpload');
  const img   = document.getElementById('profileImg');
  if (!input || !img) return;

  input.addEventListener('change', function () {
    const file = this.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      img.style.animation = 'none';
      // Trigger reflow then re-enable
      void img.offsetWidth;
      img.style.animation = 'profilePop .4s ease';
    };
    reader.readAsDataURL(file);
  });
})();

/* ──────────────────────────────────────────────────────────
   5. COMMENT FORM
────────────────────────────────────────────────────────── */
(function initCommentForm() {
  const form      = document.getElementById('commentForm');
  const container = document.getElementById('commentsContainer');
  if (!form || !container) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name  = document.getElementById('commentName').value.trim();
    const email = document.getElementById('commentEmail').value.trim();
    const text  = document.getElementById('commentText').value.trim();

    if (!name || !email || !text) {
      showToast('Please fill in all fields before posting.', 'warning');
      return;
    }

    // Build initials avatar colour from name
    const colors   = ['#1d3557','#e63946','#2a9d8f','#457b9d','#f4a261','#3a0ca3'];
    const color    = colors[Math.floor(Math.random() * colors.length)];
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const now      = new Date();
    const dateStr  = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr  = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const card = document.createElement('div');
    card.className = 'comment-card new-comment';
    card.innerHTML = `
      <img src="https://placehold.co/48x48/${color.replace('#','')}/${encodeURIComponent('ffffff')}?text=${initials}"
           alt="${initials}" class="comment-avatar" />
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-name">${escapeHtml(name)}</span>
          <span class="comment-date"><i class="far fa-clock me-1"></i>${dateStr} · ${timeStr}</span>
        </div>
        <p class="comment-text">${escapeHtml(text)}</p>
        <div class="comment-actions">
          <button class="btn-like" onclick="likeComment(this)">
            <i class="fas fa-thumbs-up me-1"></i><span>0</span>
          </button>
          <button class="btn-reply"><i class="fas fa-reply me-1"></i>Reply</button>
        </div>
      </div>`;

    // Prepend new comment with a fade-in
    card.style.opacity = '0';
    card.style.transform = 'translateY(-12px)';
    container.prepend(card);

    requestAnimationFrame(() => {
      card.style.transition = 'opacity .4s ease, transform .4s ease';
      card.style.opacity    = '1';
      card.style.transform  = 'translateY(0)';
    });

    form.reset();
    showToast('Your comment has been posted!', 'success');
  });
})();

/* ──────────────────────────────────────────────────────────
   6. LIKE BUTTON
────────────────────────────────────────────────────────── */
function likeComment(btn) {
  const countEl = btn.querySelector('span');
  const liked   = btn.classList.toggle('liked');
  countEl.textContent = parseInt(countEl.textContent, 10) + (liked ? 1 : -1);
}

/* ──────────────────────────────────────────────────────────
   7. NEWSLETTER FORM
────────────────────────────────────────────────────────── */
(function initNewsletter() {
  const forms = document.querySelectorAll('#newsletterForm, .footer-newsletter');
  forms.forEach(form => {
    if (!form.tagName || form.tagName !== 'FORM') return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = this.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) return;
      showToast('You\'re subscribed! Welcome to Joseph Blog.', 'success');
      input.value = '';
    });
  });

  // Also handle the newsletter section form by id
  const mainForm = document.getElementById('newsletterForm');
  if (mainForm) {
    mainForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = this.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) return;
      showToast('You\'re subscribed! Welcome to Joseph Blog.', 'success');
      input.value = '';
    });
  }
})();

/* ──────────────────────────────────────────────────────────
   8. GALLERY LIGHTBOX
────────────────────────────────────────────────────────── */
(function initLightbox() {
  const overlay   = document.getElementById('lightboxOverlay');
  const lightImg  = document.getElementById('lightboxImg');
  const closeBtn  = document.getElementById('lightboxClose');
  if (!overlay || !lightImg) return;

  // Open on "View Photo" button click
  document.addEventListener('click', function (e) {
    const viewBtn = e.target.closest('.btn-view-photo');
    if (!viewBtn) return;

    const galleryItem = viewBtn.closest('.gallery-item');
    if (!galleryItem) return;

    const img = galleryItem.querySelector('img');
    if (!img) return;

    lightImg.src = img.src;
    lightImg.alt = img.alt;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Close handlers
  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lightImg.src = ''; }, 300);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();

/* ──────────────────────────────────────────────────────────
   9. SEARCH BAR – simple highlight / filter
────────────────────────────────────────────────────────── */
(function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  input.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const query = this.value.trim().toLowerCase();
    if (!query) return;

    // Highlight matching news titles
    const titles = document.querySelectorAll(
      '.news-card-title, .latest-card-body h6, .video-card-body h6'
    );
    let found = 0;
    titles.forEach(el => {
      const text = el.textContent.toLowerCase();
      if (text.includes(query)) {
        el.closest('article, .video-card, .latest-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.background = '#fff3cd';
        el.style.borderRadius = '4px';
        el.style.padding = '2px 4px';
        found++;
        setTimeout(() => {
          el.style.background = '';
          el.style.padding = '';
        }, 3000);
      }
    });

    if (found === 0) {
      showToast(`No results found for "${query}"`, 'warning');
    } else {
      showToast(`Found ${found} result${found > 1 ? 's' : ''} for "${query}"`, 'success');
    }

    this.value = '';
  });
})();

/* ──────────────────────────────────────────────────────────
   10. VIDEO PLAY BUTTON – basic alert placeholder
────────────────────────────────────────────────────────── */
(function initVideoCards() {
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const title = this.closest('.video-card')?.querySelector('h6')?.textContent || 'Video';
      showToast(`Playing: "${title}"`, 'info');
    });
  });
})();

/* ──────────────────────────────────────────────────────────
   11. ACTIVE NAV LINK on scroll
────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id], footer[id]');
  const navLinks  = document.querySelectorAll('.navbar-nav .nav-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(sec => observer.observe(sec));
})();

/* ──────────────────────────────────────────────────────────
   12. TOAST NOTIFICATION
────────────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const existing = document.getElementById('jb-toast');
  if (existing) existing.remove();

  const colors = {
    success: '#2a9d8f',
    warning: '#f4a261',
    info:    '#457b9d',
    error:   '#e63946',
  };
  const icons = {
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    info:    'fa-circle-info',
    error:   'fa-circle-xmark',
  };

  const toast = document.createElement('div');
  toast.id = 'jb-toast';
  toast.setAttribute('role', 'alert');
  toast.style.cssText = `
    position: fixed;
    bottom: 5rem;
    right: 1.5rem;
    background: ${colors[type] || colors.info};
    color: #fff;
    padding: .75rem 1.2rem;
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: .82rem;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,.25);
    display: flex;
    align-items: center;
    gap: .6rem;
    z-index: 9999;
    max-width: 320px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity .3s ease, transform .3s ease;
  `;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i>${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* ──────────────────────────────────────────────────────────
   13. HTML ESCAPE UTILITY
────────────────────────────────────────────────────────── */
function escapeHtml(str) {
  const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}

/* ──────────────────────────────────────────────────────────
   14. CATEGORY CARD CLICK FILTER
────────────────────────────────────────────────────────── */
(function initCategoryFilter() {
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', function () {
      const cat = this.querySelector('span')?.textContent.trim().toLowerCase() || '';
      const trending = document.getElementById('trending');
      if (trending) {
        trending.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast(`Showing "${cat}" stories`, 'info');
      }
    });
  });
})();
