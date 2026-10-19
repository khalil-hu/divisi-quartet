/* ============================================================
   DIVISI × Die with a Smile — 交互脚本
   逐字淡入 / 翻屏 / 进度 / 视差
   ============================================================ */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 封面标题逐字拆分 ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.setProperty('--cd', (i * 0.07).toFixed(2) + 's');
      el.appendChild(s);
    });
  });

  /* ---------- 屏幕索引与进度指示器 ---------- */
  const sections = [...document.querySelectorAll('.screen')];
  const total = sections.length;
  const progressCur = document.querySelector('.progress-cur');
  const progressTotal = document.querySelector('.progress-total');
  progressTotal.textContent = total;
  let cur = 0;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      en.target.classList.toggle('is-in', en.isIntersecting);
      if (en.isIntersecting) {
        cur = sections.indexOf(en.target);
        progressCur.textContent = cur + 1;
      }
    });
  }, { threshold: 0.5 });
  sections.forEach((s) => io.observe(s));

  function goTo(i) {
    i = Math.max(0, Math.min(total - 1, i));
    sections[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* ---------- 键盘:上下键 / 空格 / PgUp / PgDn / Home / End ---------- */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goTo(cur + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(cur - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(total - 1);
    } else if (e.key === ' ' && !(e.target.closest && e.target.closest('button, a, input, textarea, select'))) {
      e.preventDefault();
      goTo(cur + 1);
    }
  });

  /* ---------- 滚轮:一次手势翻一屏 ---------- */
  let wheelAcc = 0;
  let wheelLock = false;
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelLock) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) < 42) return;
    goTo(cur + (wheelAcc > 0 ? 1 : -1));
    wheelAcc = 0;
    wheelLock = true;
    setTimeout(() => { wheelLock = false; }, 900);
  }, { passive: false });

  /* ---------- 鼠标视差(±3px,仅精密指针设备) ---------- */
  if (matchMedia('(pointer: fine)').matches && !reduceMotion) {
    const layers = [...document.querySelectorAll('[data-parallax]')];
    let tx = 0, ty = 0, cx = 0, cy = 0;

    window.addEventListener('pointermove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 .. 1
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      layers.forEach((l) => {
        const amt = parseFloat(l.dataset.parallax) || 3;
        l.style.transform =
          'translate3d(' + (cx * amt).toFixed(2) + 'px, ' + (cy * amt).toFixed(2) + 'px, 0)';
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();
