(function() {
  const backLink = document.querySelector('.bh-back');
  if (!backLink) return;

  const ref = document.referrer;
  if (ref && new URL(ref).origin === location.origin) {
    backLink.addEventListener('click', function(e) {
      e.preventDefault();
      history.back();
    });
    // Update the label to be generic
    const textNode = backLink.lastChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = ' Back';
    }
  }
  // If no same-origin referrer, the existing href="products.html" works as fallback
})();
