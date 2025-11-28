// Define forbidden tags and attributes for clarity and reuse.
const FORBIDDEN_TAGS = ['script', 'iframe', 'object', 'embed', 'style'];
const FORBIDDEN_ATTR = [
  'onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout', 'onfocus',
  'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress',
  'onmousedown', 'onmouseup', 'ondblclick', 'oncontextmenu', 'onwheel',
  'ondrag', 'ondrop', 'onscroll'
];

// Helper to escape HTML entities
const escapeHTML = (str: string) => {
  const p = document.createElement('p');
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
};

export const sanitizeHTML = (dirty: string): string => {
  if (typeof window === 'undefined' || !dirty) {
    return dirty;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(dirty, 'text/html');

  // 1. Quarantine forbidden tags
  doc.querySelectorAll(FORBIDDEN_TAGS.join(',')).forEach(tagNode => {
    const originalHtml = tagNode.outerHTML;
    const pre = doc.createElement('pre');
    pre.className = 'quarantined-code';
    pre.textContent = originalHtml;
    tagNode.parentNode?.replaceChild(pre, tagNode);
  });

  // 2. Quarantine forbidden attributes
  doc.querySelectorAll('*').forEach(element => {
    const attrs = Array.from(element.attributes);
    attrs.forEach(attr => {
      if (FORBIDDEN_ATTR.includes(attr.name.toLowerCase())) {
        const quarantinedAttr = doc.createElement('span');
        quarantinedAttr.className = 'quarantined-code';
        quarantinedAttr.textContent = ` ${attr.name}="${escapeHTML(attr.value)}"`;

        // Insert the quarantined span as the first child of the element
        element.insertBefore(quarantinedAttr, element.firstChild);

        // Remove the dangerous attribute
        element.removeAttribute(attr.name);
      }

      // 3. Sanitize 'href' and 'src' attributes for javascript: URLs
      if (['href', 'src'].includes(attr.name.toLowerCase())) {
        if (attr.value.trim().toLowerCase().startsWith('javascript:')) {
          const quarantinedAttr = doc.createElement('span');
          quarantinedAttr.className = 'quarantined-code';
          quarantinedAttr.textContent = ` ${attr.name}="${escapeHTML(attr.value)}"`;
          element.insertBefore(quarantinedAttr, element.firstChild);
          element.removeAttribute(attr.name);
        }
      }
    });
  });

  return doc.body.innerHTML;
};
