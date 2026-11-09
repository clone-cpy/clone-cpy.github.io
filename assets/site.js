(function () {
  'use strict';

  var root = document.documentElement;

  // 主题切换
  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('admin-theme', next);
        localStorage.setItem('theme', next);
      } catch (error) {
        /* 忽略隐私模式下的写入失败 */
      }
    });
  });

  // 顶栏滚动阴影
  var header = document.querySelector('[data-header]');
  if (header) {
    var sync = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  // 移动端导航
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  if (navToggle && navLinks) {
    var setOpen = function (open) {
      navLinks.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.addEventListener('click', function () {
      setOpen(!navLinks.classList.contains('is-open'));
    });
    navLinks.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (event) {
      if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  // 入场动画
  var revealItems = document.querySelectorAll(
    '.post-card, .section-head, .hero__copy, .profile-card, .cta-card, .about__card, .tag-cloud, .page-head'
  );
  if (revealItems.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: '0px 0px -6% 0px' }
    );
    revealItems.forEach(function (element, index) {
      element.setAttribute('data-reveal', '');
      element.style.transitionDelay = Math.min(index % 6, 5) * 45 + 'ms';
      observer.observe(element);
    });
  }

  // 目录高亮
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.post-toc a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var anchors = new Map();
    tocLinks.forEach(function (link) {
      var id = decodeURIComponent(link.getAttribute('href').slice(1));
      var heading = document.getElementById(id);
      if (heading) anchors.set(heading, link);
    });
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tocLinks.forEach(function (link) {
            link.classList.remove('is-active');
          });
          var active = anchors.get(entry.target);
          if (active) active.classList.add('is-active');
        });
      },
      { rootMargin: '-90px 0px -72% 0px' }
    );
    anchors.forEach(function (link, heading) {
      spy.observe(heading);
    });
  }

  // 代码块复制
  document.querySelectorAll('.prose pre').forEach(function (pre) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = '复制';
    button.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;
      var done = function (label) {
        button.textContent = label;
        setTimeout(function () {
          button.textContent = '复制';
        }, 1600);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          done('已复制');
        }, function () {
          done('复制失败');
        });
      } else {
        done('不支持');
      }
    });
    pre.appendChild(button);
  });

  // “/” 聚焦搜索框
  var searchInput = document.querySelector('.search-form input');
  if (searchInput) {
    document.addEventListener('keydown', function (event) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag)) {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }
})();
