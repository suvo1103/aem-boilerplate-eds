import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'usa-overlay';
  block.append(overlay);

  // Create header
  const header = document.createElement('header');
  header.className = 'usa-header usa-header--basic usa-header--megamenu';

  // Nav container
  const navContainer = document.createElement('div');
  navContainer.className = 'usa-nav-container';

  // Navbar
  const navbar = document.createElement('div');
  navbar.className = 'usa-navbar';

  // Logo
  const logo = document.createElement('div');
  logo.className = 'usa-logo';
  logo.innerHTML = `<em class="usa-logo__text"><a href="/" title="&lt;Project title&gt;">&lt;Project title&gt;</a></em>`;

  // Menu button
  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'usa-menu-btn';
  menuBtn.textContent = 'Menu';

  navbar.append(logo, menuBtn);

  // Navigation
  const nav = document.createElement('nav');
  nav.className = 'usa-nav';
  nav.setAttribute('aria-label', 'Primary navigation');

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'usa-nav__close';
  closeBtn.innerHTML = `<img src="/assets/img/usa-icons/close.svg" role="img" alt="Close" />`;

  // Primary nav list
  const navList = document.createElement('ul');
  navList.className = 'usa-nav__primary usa-accordion';

  // Example nav item with submenu
  const navItem1 = document.createElement('li');
  navItem1.className = 'usa-nav__primary-item';
  navItem1.innerHTML = `
    <button
      type="button"
      class="usa-accordion__button usa-nav__link usa-current"
      aria-expanded="false"
      aria-controls="basic-mega-nav-section-one"
    >
      <span>&lt;Current section&gt;</span>
    </button>
    <div
      id="basic-mega-nav-section-one"
      class="usa-nav__submenu usa-megamenu"
    >
      <div class="grid-row grid-gap-4">
        ${[1,2,3,4].map(() => `
        <div class="usa-col">
          <ul class="usa-nav__submenu-list">
            <li class="usa-nav__submenu-item">
              <a href="javascript:void(0);">&lt;Navigation link&gt;</a>
            </li>
            <li class="usa-nav__submenu-item">
              <a href="javascript:void(0);">&lt;Navigation link&gt;</a>
            </li>
            <li class="usa-nav__submenu-item">
              <a href="javascript:void(0);">&lt;Navigation link&gt;</a>
            </li>
          </ul>
        </div>
        `).join('')}
      </div>
    </div>
  `;

  // Example nav item with submenu (second)
  const navItem2 = document.createElement('li');
  navItem2.className = 'usa-nav__primary-item';
  navItem2.innerHTML = `
    <button
      type="button"
      class="usa-accordion__button usa-nav__link"
      aria-expanded="false"
      aria-controls="basic-mega-nav-section-two"
    >
      <span>&lt;Section&gt;</span>
    </button>
    <div
      id="basic-mega-nav-section-two"
      class="usa-nav__submenu usa-megamenu"
    >
      <div class="grid-row grid-gap-4">
        ${[1,2,3,4].map(() => `
        <div class="usa-col">
          <ul class="usa-nav__submenu-list">
            <li class="usa-nav__submenu-item">
              <a href="javascript:void(0);">&lt;Navigation link&gt;</a>
            </li>
            <li class="usa-nav__submenu-item">
              <a href="javascript:void(0);">&lt;Navigation link&gt;</a>
            </li>
            <li class="usa-nav__submenu-item">
              <a href="javascript:void(0);">&lt;Navigation link&gt;</a>
            </li>
          </ul>
        </div>
        `).join('')}
      </div>
    </div>
  `;

  // Simple nav link
  const navItem3 = document.createElement('li');
  navItem3.className = 'usa-nav__primary-item';
  navItem3.innerHTML = `
    <a href="javascript:void(0);" class="usa-nav-link">&lt;Simple link&gt;</a>
  `;

  navList.append(navItem1, navItem2, navItem3);

  // Search section
  const searchSection = document.createElement('section');
  searchSection.setAttribute('aria-label', 'Search component');
  searchSection.innerHTML = `
    <form class="usa-search usa-search--small" role="search">
      <label class="usa-sr-only" for="search-field">Search</label>
      <input
        class="usa-input"
        id="search-field"
        type="search"
        name="search"
      />
      <button class="usa-button" type="submit">
        <img
          src="/assets/img/usa-icons-bg/search--white.svg"
          class="usa-search__submit-icon"
          alt="Search"
        />
      </button>
    </form>
  `;

  nav.append(closeBtn, navList, searchSection);
  navContainer.append(navbar, nav);
  header.append(navContainer);
  block.append(header);
}
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
