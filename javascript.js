/* ==========
  Version 1.0.1
  Sidebar Nav for Squarespace
  Copyright Will Myers 
========== */
(function(){
  function buildSidebarNav(indicators, settings){
    let indicatorArr = document.querySelectorAll(indicators),
        sidebarNav,
        appendElem = document.querySelector(settings.sidebarPlacement);
    
    //Build Sidebar
    sidebarNav = document.createElement("div");
    sidebarNav.setAttribute('id', 'wm-sidebar-nav');
    sidebarNav.classList.add('sidebar-nav');
    sidebarNav.setAttribute('data-sidenav-style', settings.style);
    appendElem.appendChild(sidebarNav);
    
    sidebarNav.style.setProperty('--sidebar-color', settings.color);

    indicatorArr.forEach(elem => {
      //Identify Sections
      let title = elem.getAttribute('data-title') || elem.textContent,
          titleAdjusted = title.toLowerCase().split(' ').join('_'),
          section = elem.closest(settings.parentElem),
          anchorEl = document.createElement("div");
      
      if (elem.dataset.target == 'next-section') {
        section = elem.closest(settings.parentElem).nextElementSibling;
      }
      

      section.setAttribute('data-sidebar-item', title);
      anchorEl.setAttribute('id', titleAdjusted);
      anchorEl.classList.add('sidebar-nav-anchor');
      section.append(anchorEl);
      section.setAttribute('id', 'id-' + titleAdjusted);

      //Build Nav Items
      let btn = document.createElement("a"),
          itemText = document.createElement("span"),
          itemIcon = document.createElement("span");
      btn.classList.add('sidebar-item');
      btn.setAttribute('href', '#' + titleAdjusted);
      itemText.classList.add('nav-text');
      itemText.innerHTML = title;
      itemIcon.classList.add('nav-icon');
      btn.appendChild(itemText);
      btn.appendChild(itemIcon);
      sidebarNav.appendChild(btn);
    });
    
    //Sidebar Mobile Trigger
    let mobileTrigger = document.createElement("span");
    mobileTrigger.classList.add('mobile-trigger');
    sidebarNav.prepend(mobileTrigger)
    
    //Sidebar Indicator
    let sidebarIndicator = document.createElement("span");
    sidebarIndicator.classList.add('sidebar-indicator');
    sidebarNav.appendChild(sidebarIndicator)
  }

  function SidebarNav(mySections, sidebarNav){
    let sidebarIndicator = document.querySelector('.sidebar-nav .sidebar-indicator'),
        mobileTrigger = document.querySelector('.sidebar-nav .mobile-trigger'),
        sectionCountInView = mySections.length - 1,
        navItemHeight,
        topNavItemInView,
        target,
        navItem;
    
    function isElementInViewport(el) {
      let shrinkRatio = .15;
      var top = el.offsetTop;
      var left = el.offsetLeft;
      var width = el.offsetWidth;
      var height = el.offsetHeight * (1 - shrinkRatio);

      while(el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
      }

      return (
        top < (window.pageYOffset + (window.innerHeight * (1 - shrinkRatio))) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
      );
    }

    function getTitleAdjusted(section) {
      const mapTargets = document.querySelector('[data-wm-plugin="section-sidenav"][data-mapping]') === null ? 'id' : 'attr';
      if (mapTargets === 'attr') {
        return section.getAttribute('data-sidebar-item').toLowerCase().split(' ').join('_')
      } else {
        return section.getAttribute('id').split('id-')[1]
      }
    }

    function checkSectionsInView(){
      mySections.forEach(section => {
        let inView = isElementInViewport(section),
            title = getTitleAdjusted(section),
            navItem = document.querySelector('.sidebar-item[href="#' + title + '"]');

        if (inView){
          navItem?.classList.add('in-view');
        } else {
          navItem?.classList.remove('in-view');
        }
      });
    }

    function throttle(func, timeFrame) {
      var lastTime = 0;
      return function () {
        var now = new Date;
        if (now - lastTime >= 500) {
          func();
          lastTime = now;
        }
      };
    }
    
    function debounce(func, duration) {
      let timeout
      return function (...args) {
        const effect = () => {
          timeout = null
          return func.apply(this, args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(effect, duration)
      }
    }

    function adjustSidebarIndicator(){
      sectionCountInView = document.querySelectorAll('.sidebar-nav .sidebar-item.in-view').length;
      if (sectionCountInView !== 0){
        let inView = document.querySelectorAll('.sidebar-item.in-view');
        sidebarNav.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('top-item'));
        inView[0].classList.add('top-item');
        sidebarNav.setAttribute('data-current', inView[0].getAttribute('href'));
        
       let allItemsInView = document.querySelectorAll('.sidebar-nav .sidebar-item.in-view'),
           height = 0;
        allItemsInView.forEach(item => height += item.offsetHeight);
        topNavItemInView = document.querySelector('.sidebar-nav .sidebar-item.in-view').offsetTop;
        sidebarIndicator.style.height = height + 'px';
        sidebarIndicator.style.top = topNavItemInView + 'px';
      } else{
        return;
      };
    }

    let navLock = false,
        navLockTimer;
    window.addEventListener('scroll', debounce(checkSectionsInView, 10));
    window.addEventListener('scroll', throttle(checkSectionsInView, 10));
    window.addEventListener('scroll', debounce(adjustSidebarIndicator, 10));
    window.addEventListener('scroll', throttle(adjustSidebarIndicator, 10));
    window.addEventListener('scroll', function(){
      if (!navLock) {
        sidebarNav.classList.remove('open');
      }
    });
    mobileTrigger.addEventListener('click', function(){
      sidebarNav.classList.add('open');
    });
    sidebarNav.querySelectorAll('a.sidebar-item').forEach(btn =>{
      btn.addEventListener('click', function(){
        navLock = true;
        clearTimeout(navLockTimer)
        navLockTimer = setTimeout(function(){
          navLock = false;
        }, 1000)
      })
    })
    window.addEventListener('load', function(){
      sidebarNav.classList.add('open');
      checkSectionsInView();
      adjustSidebarIndicator();
      setHeaderBottomPos()
    });

    function setHeaderBottomPos() {
      let body = document.body;
      if (document.querySelector('body.tweak-fixed-header-style-basic')) {
        body.style.setProperty('--header-bottom', '0px');
        return;
      }

      let header = document.querySelector('#header'),
          headerRect = header.getBoundingClientRect(),
          hBottom = headerRect.bottom > 0 ? headerRect.bottom + 'px' : '0px';
      body.style.setProperty('--header-bottom', hBottom);
    }
    window.addEventListener('resize', setHeaderBottomPos);
    header.addEventListener('transitionend', setHeaderBottomPos);
    header.addEventListener('transition', setHeaderBottomPos);
  }

  //BuildSidebar
  function init(){
    let style =  document.querySelector('[data-wm-plugin="section-sidenav"][data-style]') == null ? 'dots' : document.querySelector('[data-wm-plugin="section-sidenav"][data-style]').getAttribute('data-style'),
        color =  document.querySelector('[data-wm-plugin="section-sidenav"][data-color]') == null ? 'black' : document.querySelector('[data-wm-plugin="section-sidenav"][data-color]').getAttribute('data-color');
    let settings = { 
      parentElem: '.page-section',
      sidebarPlacement: 'article.sections',
      style: style,
      color:color
    };
    buildSidebarNav(indicators, settings);

    //Sidebar Actions
    let mySections = document.querySelectorAll('[data-sidebar-item]');
    let sidebarNav = document.querySelector('#wm-sidebar-nav');
    new SidebarNav(mySections, sidebarNav);
  }
  let indicators = '[data-wm-plugin="section-sidenav"]';
  if (document.querySelectorAll(indicators).length){
    if (!document.querySelector('link[href*="WMSidebarNav"]')){
      let head = document.getElementsByTagName('head')[0],
          link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'https://cdn.jsdelivr.net/gh/willmyethewebsiteguy/sidebarNav@1/styles.min.css';
      head.appendChild(link);
    }
    init();
  }
}());
