(function () {
  // Check if window.mainReceiverUrl is defined.
  if (!window.mainReceiverUrl) {
    console.error("window.mainReceiverUrl is not defined.");
    return;
  }

  // Determine the target origin from mainReceiverUrl for postMessage security.
  var targetOrigin = "*";
  try {
    var receiverUrlObj = new URL(window.mainReceiverUrl);
    targetOrigin = receiverUrlObj.origin;
  } catch (e) {
    console.error("Invalid mainReceiverUrl:", window.mainReceiverUrl);
  }

  /**
   * Capture URL information from the parent page.
   * - mainUrl: The origin + pathname (without query parameters or hash)
   * - fullUrl: The complete URL (including query parameters and hash)
   */
  function captureUrlInfo() {
    return {
      mainUrl: window.location.origin + window.location.pathname,
      fullUrl: window.location.href,
    };
  }

  /**
   * Send the captured URL information to a given iframe via postMessage.
   *
   * @param {HTMLIFrameElement} iframe - The target iframe element.
   */
  function sendUrlInfoToIframe(iframe) {
    var urlInfo = captureUrlInfo();
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: "PARENT_PAGE_URL_DATA", data: urlInfo },
          targetOrigin
        );
      }
    } catch (e) {
      console.error("Error sending URL info to iframe:", e);
    }
  }

  /**
   * Attach a load listener to an iframe and also schedule fallback sends.
   * This helps in case the iframe is already loaded.
   *
   * @param {HTMLIFrameElement} iframe - The iframe to attach the listener to.
   */
  function attachLoadListenerToIframe(iframe) {
    // Define a function to send the URL info.
    function sendMessages() {
      sendUrlInfoToIframe(iframe);
    }

    // When the iframe fires a load event, schedule multiple sends.
    iframe.addEventListener("load", function () {
      setTimeout(sendMessages, 1000);
      setTimeout(sendMessages, 3000);
      setTimeout(sendMessages, 5000);
    });

    // Also schedule sending in case the load event has already occurred.
    setTimeout(sendMessages, 1000);
    setTimeout(sendMessages, 3000);
    setTimeout(sendMessages, 5000);
  }

  /**
   * Attach load event listeners to all iframes currently in the DOM.
   */
  function attachListenersToAllIframes() {
    var iframes = document.querySelectorAll("iframe");
    if (iframes.length === 0) {
      console.warn("No iframes found on the page.");
    }
    iframes.forEach(function (iframe) {
      attachLoadListenerToIframe(iframe);
    });
  }

  // Ensure the DOM is ready before processing.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachListenersToAllIframes);
  } else {
    attachListenersToAllIframes();
  }

  // Use MutationObserver to attach listeners to any new iframes added dynamically.
  var observer = new MutationObserver(function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1 && node.tagName.toLowerCase() === "iframe") {
          attachLoadListenerToIframe(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
