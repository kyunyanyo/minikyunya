/**
 * Simple & Clean Wedding Invitation
 * Korean Mobile 청첩장 - Script
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const h12 = hours % 12 || 12;
    const minuteStr = minutes > 0 ? ` ${minutes}분` : '';
    return `${year}년 ${month}월 ${date}일 ${day}요일 ${period} ${h12}시${minuteStr}`;
  }

  function getWeddingDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
  }

  /* ═══════════════════════════════════════════
     Image Auto-Detection
     ═══════════════════════════════════════════ */

  function loadImagesFromFolder(folder, maxAttempts = 50, options = {}) {
    // 기존 방식은 폴더 끝까지 탐색한 뒤에야 화면에 출력되어
    // 첫 방문/캐시 없음 상태에서 images/story 마지막 번호 이후 404 확인 시간까지
    // 사용자가 그대로 기다리는 문제가 있었습니다.
    if (typeof maxAttempts === 'object') {
      options = maxAttempts;
      maxAttempts = options.maxAttempts || 50;
    }

    const stopAfterFails = options.stopAfterFails ?? 3;
    const priorityCount = options.priorityCount || 0;
    const onFound = typeof options.onFound === 'function' ? options.onFound : null;
    const onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;

    return new Promise(resolve => {
      const images = [];
      let current = 1;
      let consecutiveFails = 0;

      function finish() {
        if (onComplete) onComplete(images);
        resolve(images);
      }

      function tryNext() {
        if (current > maxAttempts || consecutiveFails >= stopAfterFails) {
          finish();
          return;
        }

        const img = new Image();
        const path = `images/${folder}/${current}.jpg`;

        img.decoding = 'async';
        if (current <= priorityCount) {
          img.loading = 'eager';
          img.fetchPriority = 'high';
        } else {
          img.loading = 'lazy';
          img.fetchPriority = 'auto';
        }

        img.onload = function() {
          images.push(path);
          consecutiveFails = 0;
          if (onFound) onFound(path, images.length - 1, images);
          current++;
          tryNext();
        };

        img.onerror = function() {
          consecutiveFails++;
          current++;
          tryNext();
        };

        img.src = path;
      }

      tryNext();
    });
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain (Simple Overlay)
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');

    if (CONFIG.useCurtain === false) {
      curtain.style.display = 'none';
      return;
    }

    namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;
    document.body.classList.add('no-scroll');

    btn.addEventListener('click', () => {
      curtain.classList.add('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(() => {
        curtain.classList.add('is-hidden');
      }, 500);
    });
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    $('#heroPhoto').src = 'images/hero/1.jpg';
    $('#heroNames').textContent = `${CONFIG.groom.name}  ·  ${CONFIG.bride.name}`;
    $('#heroDate').textContent = formatDate(CONFIG.wedding.date, CONFIG.wedding.time);
    $('#heroVenue').textContent = CONFIG.wedding.venue;
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;
      const labelEl = $('#countdownLabel');

      if (diff <= 0) {
        $('#countDays').textContent = '0';
        $('#countHours').textContent = '00';
        $('#countMinutes').textContent = '00';
        $('#countSeconds').textContent = '00';
        labelEl.textContent = '결혼식이 시작되었습니다';
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      labelEl.textContent = `결혼식까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      $('#countDays').textContent = days;
      $('#countHours').textContent = String(hours).padStart(2, '0');
      $('#countMinutes').textContent = String(minutes).padStart(2, '0');
      $('#countSeconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    $('#greetingTitle').textContent = CONFIG.greeting.title;
    $('#greetingContent').textContent = CONFIG.greeting.content;

    const g = CONFIG.groom;
    const b = CONFIG.bride;

    function parentName(name, isDeceased) {
      if (!name) return '';
      const deceasedClass = isDeceased ? ' deceased' : '';
      return `<span class="${deceasedClass}">${name}</span>`;
    }

    function parentNames(father, mother, fatherDeceased, motherDeceased) {
      return [
        parentName(father, fatherDeceased),
        parentName(mother, motherDeceased)
      ]
        .filter(Boolean)
        .join('<span class="parent-dot"> · </span>');
    }

    function parentRow(person, relation) {
      const parents = parentNames(
        person.father,
        person.mother,
        person.fatherDeceased,
        person.motherDeceased
      );

      return `
        <div class="parent-row">
          ${parents}<span class="parent-relation">의 ${relation}</span> <span class="child-name">${person.name}</span>
        </div>
      `;
    }

    const parentsHTML = `
      ${parentRow(g, '장남')}
      ${parentRow(b, '장녀')}
    `;

    $('#greetingParents').innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const weddingDay = dt.getDate();

    const grid = $('#calendarGrid');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    grid.innerHTML = `<div class="calendar__header">${monthNames[month]} ${year}</div>`;

    // Weekdays
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const wdRow = document.createElement('div');
    wdRow.className = 'calendar__weekdays';
    weekdays.forEach(wd => {
      const el = document.createElement('span');
      el.className = 'calendar__weekday';
      el.textContent = wd;
      wdRow.appendChild(el);
    });
    grid.appendChild(wdRow);

    // Days
    const daysContainer = document.createElement('div');
    daysContainer.className = 'calendar__days';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'calendar__day is-empty';
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar__day';
      if (d === weddingDay) dayEl.classList.add('is-today');
      dayEl.textContent = d;
      daysContainer.appendChild(dayEl);
    }

    grid.appendChild(daysContainer);

    // Google Calendar link
    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    $('#googleCalBtn').href = gcalUrl;

    // ICS download (Apple Calendar)
    $('#icsDownloadBtn').addEventListener('click', () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding//Invitation//KO',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
        `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
        'DESCRIPTION:결혼식에 초대합니다.',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wedding.ics';
      a.click();
      URL.revokeObjectURL(url);
      showToast('캘린더 파일이 다운로드됩니다');
    });
  }

  /* ═══════════════════════════════════════════
     Story Section
     ═══════════════════════════════════════════ */

  function removeLoadingPlaceholder(container) {
    if (!container) return;
    const placeholder = container.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();
  }

  function appendStoryImage(src, index, storyImages) {
    const container = $('#storyPhotos');
    if (!container) return;

    removeLoadingPlaceholder(container);

    const div = document.createElement('div');
    div.className = 'story__photo-item animate-item';
    div.setAttribute('data-animate', 'fade-up');

    const img = document.createElement('img');
    img.src = src;
    img.alt = `스토리 사진 ${index + 1}`;
    img.decoding = 'async';

    // Love Story 첫 화면에 보일 가능성이 큰 앞쪽 이미지는 lazy를 쓰지 않아
    // 스크롤 직후 하얗게 비는 시간을 줄입니다.
    if (index < 4) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    } else {
      img.loading = 'lazy';
      img.fetchPriority = 'auto';
    }

    div.appendChild(img);
    div.addEventListener('click', () => openPhotoModal(storyImages, index));
    container.appendChild(div);
  }

  function initStory(storyImages) {
    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    const container = $('#storyPhotos');
    removeLoadingPlaceholder(container);

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => appendStoryImage(src, i, storyImages));
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  function appendGalleryImage(src, index, galleryImages) {
    const grid = $('#galleryGrid');
    if (!grid) return;

    removeLoadingPlaceholder(grid);

    const div = document.createElement('div');
    div.className = 'gallery__item animate-item';
    div.setAttribute('data-animate', 'fade-up');

    const img = document.createElement('img');
    img.src = src;
    img.alt = `갤러리 사진 ${index + 1}`;
    img.decoding = 'async';

    // 갤러리는 Love Story보다 아래에 있지만, 사용자가 빠르게 스크롤하면 바로 보여야 하므로
    // 앞쪽 몇 장은 lazy 지연 없이 붙이고, 나머지는 브라우저가 적절히 조절하게 둡니다.
    if (index < 6) {
      img.loading = 'eager';
      img.fetchPriority = 'auto';
    } else {
      img.loading = 'lazy';
      img.fetchPriority = 'low';
    }

    div.appendChild(img);
    div.addEventListener('click', () => openPhotoModal(galleryImages, index));
    grid.appendChild(div);
  }

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    removeLoadingPlaceholder(grid);

    if (galleryImages.length === 0) {
      const gallerySection = $('#gallery');
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    galleryImages.forEach((src, i) => appendGalleryImage(src, i, galleryImages));
  }

  function setImageWithExtensionFallback(img, folder, number, imageList, index) {
    // GitHub Pages는 파일명 대소문자와 확장자를 엄격하게 구분합니다.
    // 1.jpg~30.jpg를 기본으로 쓰되, 혹시 일부 파일이 jpeg/png/webp 또는 대문자 확장자로
    // 올라가 있어도 해당 번호 칸이 사라지지 않게 순차적으로 보정합니다.
    const candidates = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP']
      .map((ext) => `images/${folder}/${number}.${ext}`);
    let attempt = 0;

    img.onload = function () {
      if (Array.isArray(imageList)) imageList[index] = img.currentSrc || img.src;
    };

    img.onerror = function () {
      attempt += 1;
      if (attempt < candidates.length) {
        img.src = candidates[attempt];
      }
    };

    img.src = candidates[0];
  }

  function appendFixedGalleryImage(src, index, galleryImages) {
    const grid = $('#galleryGrid');
    if (!grid) return;

    removeLoadingPlaceholder(grid);

    const div = document.createElement('div');
    div.className = 'gallery__item animate-item';
    div.setAttribute('data-animate', 'fade-up');

    const img = document.createElement('img');
    img.alt = `갤러리 사진 ${index + 1}`;
    img.decoding = 'async';

    // 1~30장을 먼저 DOM에 모두 올려두고, 실제 파일은 브라우저가 순차적으로 받아오게 합니다.
    // 이렇게 해야 자동탐색 실패 조건 때문에 2장만 나오고 멈추는 문제가 생기지 않습니다.
    if (index < 8) {
      img.loading = 'eager';
      img.fetchPriority = index < 3 ? 'high' : 'auto';
    } else {
      img.loading = 'lazy';
      img.fetchPriority = 'low';
    }

    setImageWithExtensionFallback(img, 'gallery', index + 1, galleryImages, index);

    div.appendChild(img);
    div.addEventListener('click', () => openPhotoModal(galleryImages, index));
    grid.appendChild(div);
  }

  function initFixedGallery(totalCount) {
    const grid = $('#galleryGrid');
    removeLoadingPlaceholder(grid);

    const galleryImages = Array.from(
      { length: totalCount },
      (_, i) => `images/gallery/${i + 1}.jpg`
    );

    galleryImages.forEach((src, i) => appendFixedGalleryImage(src, i, galleryImages));
  }

  /* ═══════════════════════════════════════════
     Photo Modal (with swipe)
     ═══════════════════════════════════════════ */

  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  function openPhotoModal(images, index) {
    modalImages = images;
    modalIndex = index;
    showModalImage();
    $('#photoModal').classList.add('is-open');
    document.body.classList.add('no-scroll');
  }

  function closePhotoModal() {
    $('#photoModal').classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  function showModalImage() {
    const img = $('#modalImg');
    img.src = modalImages[modalIndex];
    $('#modalCounter').textContent = `${modalIndex + 1} / ${modalImages.length}`;
    $('#modalPrev').style.display = modalIndex > 0 ? '' : 'none';
    $('#modalNext').style.display = modalIndex < modalImages.length - 1 ? '' : 'none';
  }

  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
    }
  }

  function initPhotoModal() {
    $('#modalClose').addEventListener('click', closePhotoModal);
    $('#modalPrev').addEventListener('click', () => modalNavigate(-1));
    $('#modalNext').addEventListener('click', () => modalNavigate(1));

    const modal = $('#photoModal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'modalContainer') {
        closePhotoModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') modalNavigate(-1);
      if (e.key === 'ArrowRight') modalNavigate(1);
    });

    // Swipe support
    const container = $('#modalContainer');

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      modalNavigate(1);
    } else {
      modalNavigate(-1);
    }
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    $('#locationVenue').textContent = w.venue;
    $('#locationHall').textContent = w.hall;
    $('#locationAddress').textContent = w.address;
    $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    $('#locationMapImg').src = 'images/location/1.jpg';
    $('#kakaoMapBtn').href = w.mapLinks.kakao || '#';
    $('#naverMapBtn').href = w.mapLinks.naver || '#';

    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Account Section (축의금)
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
        <div class="account-item__info">
          <div class="account-item__role">${acc.role}</div>
          <div class="account-item__detail">
            <span class="account-item__name">${acc.name || ''}</span>
            ${acc.bank} ${acc.number}
          </div>
        </div>
        <button class="account-item__copy" data-account="${acc.bank} ${acc.number} ${acc.name || ''}">
          복사
        </button>
      `;
      container.appendChild(item);
    });
  }

  function initAccordion(triggerId, panelId) {
    const trigger = $(`#${triggerId}`);
    const panel = $(`#${panelId}`);

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);

      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0';
      }
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');

    initAccordion('groomAccordion', 'groomAccordionPanel');
    initAccordion('brideAccordion', 'brideAccordionPanel');

    // Copy account delegates
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item__copy');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    $('#footerText').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  /* ═══════════════════════════════════════════
     Loading Placeholders
     ═══════════════════════════════════════════ */

  function showLoadingPlaceholders() {
    const storyPhotos = $('#storyPhotos');
    const galleryGrid = $('#galleryGrid');

    const placeholderHTML = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

    if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations (IntersectionObserver)
     ═══════════════════════════════════════════ */

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    $$('.animate-item').forEach((el) => observer.observe(el));

    // Re-observe dynamically added items
    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('animate-item')) {
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.animate-item').forEach((el) => observer.observe(el));
          }
        });
      });
    });

    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     Init
     ═══════════════════════════════════════════ */

  function init() {
    setMetaTags();
    initCurtain();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();

    showLoadingPlaceholders();

    initPhotoModal();
    initLocation();
    initAccounts();
    initFooter();
    initScrollAnimations();

    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    // Auto-detect images.
    // story는 발견 즉시 렌더링하고, gallery는 1~30장이 확정되어 있으므로
    // 자동탐색 실패 조건에 걸리지 않도록 고정 목록으로 먼저 렌더링합니다.
    loadImagesFromFolder('story', 50, {
      stopAfterFails: 2,
      priorityCount: 4,
      onFound: appendStoryImage,
      onComplete: (storyImages) => {
        if (storyImages.length === 0) removeLoadingPlaceholder($('#storyPhotos'));
      }
    });

    // 갤러리는 실제 파일 개수가 1~30으로 정해져 있으므로 자동탐색으로 중간에 멈추지 않고
    // 30장을 고정 렌더링합니다.
    initFixedGallery(30);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
