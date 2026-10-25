/**
 * Loads data/links.yaml and renders the page. js-yaml (loaded in
 * index.html) does the parsing; this file only touches the DOM.
 */
(function () {
  // Generic action icons (not tied to any platform), hand-drawn once.
  const ICONS = {
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v16H4V4Zm0 0 8 8 8-8"/></svg>',
  };

  // Platform icons (GitHub, LinkedIn, Discord, ...) are never hand-coded
  // here. Each social entry in links.yaml names a Simple Icons slug
  // (see https://simpleicons.org); brandIcon() fetches that icon's SVG
  // at runtime via Iconify, which already renders it with
  // fill="currentColor" so it tracks the current theme automatically.
  // Adding a new platform is a one-line YAML edit, not a JS change.
  //
  // Iconify is used instead of simpleicons.org's own CDN because a few
  // brands (LinkedIn among them) have been pulled from that CDN and
  // from the simple-icons package's latest releases after trademark
  // requests; Iconify's mirror of the simple-icons set still serves
  // them.
  const brandIconCache = {};

  function fetchBrandIcon(slug) {
    return fetch(
      "https://api.iconify.design/simple-icons/" +
        encodeURIComponent(slug) +
        ".svg"
    )
      .then(function (response) {
        if (!response.ok) throw new Error("Unknown icon slug: " + slug);
        return response.text();
      })
      .catch(function () {
        return null; // falls back to the generic external-link icon
      });
  }

  function preloadBrandIcons(slugs) {
    const unique = Array.from(new Set(slugs.filter(Boolean)));
    return Promise.all(
      unique.map(function (slug) {
        return fetchBrandIcon(slug).then(function (svg) {
          if (svg) brandIconCache[slug] = svg;
        });
      })
    );
  }

  function iconForSocial(social) {
    return (social.icon && brandIconCache[social.icon]) || ICONS.external;
  }

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (key) {
        if (key === "class") node.className = props[key];
        else if (key === "text") node.textContent = props[key];
        else if (key === "html") node.innerHTML = props[key];
        else node.setAttribute(key, props[key]);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function renderLinkRow(link) {
    const isLink = !link.disabled && link.url;
    const tag = isLink ? "a" : "div";
    const props = { class: "link-row" };

    if (isLink) {
      props.href = link.url;
      props.target = "_blank";
      props.rel = "noopener noreferrer";
    } else {
      props["aria-disabled"] = "true";
      props.tabindex = "-1";
    }

    const text = el("span", { class: "link-row-text" }, [
      el("span", { class: "link-row-name", text: link.name }),
      link.category
        ? el("span", { class: "link-row-category", text: link.category })
        : null,
    ]);

    const trailing = isLink
      ? el("span", { class: "link-row-icon", html: ICONS.external })
      : el("span", { class: "link-row-badge", text: "Soon" });

    return el(tag, props, [text, trailing]);
  }

  function renderSocial(social) {
    if (!social.url) return null;
    return el(
      "a",
      {
        class: "social-icon",
        href: social.url,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": social.label,
        title: social.label,
      },
      [el("span", { class: "social-icon-glyph", html: iconForSocial(social) })]
    );
  }

  function renderMailIcon(email) {
    return el(
      "a",
      {
        class: "social-icon",
        href: "mailto:" + email,
        "aria-label": "Email " + email,
        title: email,
      },
      [el("span", { class: "social-icon-glyph", html: ICONS.mail })]
    );
  }

  async function render(config) {
    // Identity
    const nameEl = document.getElementById("profile-name");
    const taglineEl = document.getElementById("profile-tagline");
    const logoEl = document.getElementById("profile-logo");
    if (nameEl) nameEl.textContent = config.profile.name;
    if (taglineEl) taglineEl.textContent = config.profile.tagline;
    if (logoEl && config.profile.logoUrl) logoEl.src = config.profile.logoUrl;

    // Socials (+ contact email icon, if configured)
    const socialList = document.getElementById("social-list");
    const socialSection = document.getElementById("social-section");
    if (socialList) {
      await preloadBrandIcons((config.socials || []).map((s) => s.icon));
      const icons = (config.socials || []).map(renderSocial).filter(Boolean);
      if (config.contact && config.contact.email) {
        icons.push(renderMailIcon(config.contact.email));
      }
      if (icons.length === 0) {
        if (socialSection) socialSection.hidden = true;
      } else {
        icons.forEach(function (icon) {
          socialList.appendChild(icon);
        });
      }
    }

    // Links: enabled links first, "coming soon" (disabled) ones always
    // last, regardless of where they're placed in links.yaml.
    const list = document.getElementById("link-list");
    if (list) {
      const ordered = config.links
        .map(function (link, index) {
          return { link: link, index: index };
        })
        .sort(function (a, b) {
          const diff = Number(!!a.link.disabled) - Number(!!b.link.disabled);
          return diff !== 0 ? diff : a.index - b.index;
        });

      ordered.forEach(function (entry) {
        list.appendChild(renderLinkRow(entry.link));
      });
    }

    // Footer
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const homeLink = document.getElementById("footer-home-link");
    if (homeLink && config.profile.homeUrl) {
      homeLink.href = config.profile.homeUrl;
    }
  }

  function loadConfig() {
    return fetch("/data/links.yaml")
      .then(function (response) {
        if (!response.ok) throw new Error("Failed to load data/links.yaml");
        return response.text();
      })
      .then(function (text) {
        return window.jsyaml.load(text);
      });
  }

  function init() {
    loadConfig()
      .then(render)
      .catch(function (err) {
        console.error(err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
