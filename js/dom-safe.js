/** Safe DOM helpers — avoid null reference errors when markup differs by page. */

function getEl(id) {
  return document.getElementById(id);
}

function setInnerHTML(id, html) {
  const el = getEl(id);
  if (el) el.innerHTML = html;
  return el;
}

function setTextContent(id, text) {
  const el = getEl(id);
  if (el) el.textContent = text;
  return el;
}

function runOnDomReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}
