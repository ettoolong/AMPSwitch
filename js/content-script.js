// const isAMP = (document.querySelector('html').hasAttribute('amp-version'));
const isAMP = (document.querySelector('html').hasAttribute('⚡'));
const ampTag = (document.querySelector('link[rel=amphtml]'));
const canonicalTag = (document.querySelector('link[rel=canonical]'));

let supportAMP = false;
let ampUrl = '';
let canonicalUrl = '';

if (isAMP) {
  canonicalUrl = canonicalTag.getAttribute('href');
  supportAMP = true;
}

if (ampTag) {
  ampUrl = ampTag.getAttribute('href');
  supportAMP = true;
}

chrome.runtime.sendMessage({supportAMP, isAMP, ampUrl, canonicalUrl});
