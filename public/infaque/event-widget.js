(function () {
  function captureUtmParameters() {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const currentUrl = new URL(window.location.href);
    const params = {};
    let fbp = getCookie("_fbp");
    if (fbp) params["fbp"] = fbp;
    const paramNames = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_id",
      "utm_creative_format",
      "utm_source_platform",
      "utm_marketing_tactic",
      "utm_referrer",
      "source",
      "medium",
      "content",
      "docid",
      "lang",
      "fbclid",
    ];

    paramNames.forEach((param) => {
      const value = currentUrl.searchParams.get(param);
      if (value) {
        params[param] = value;
      }
    });

    return {
      parentUrl: window.location.href,
      parameters: params,
    };
  }

  function sendUtmParams(iframe) {
    const utmData = captureUtmParameters();
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: "UTM_PARAMS", data: utmData },
        "*"
      );
    }
  }

  function injectScrollbarStyle() {
    if (!document.getElementById("event-scrollbar-style")) {
      const style = document.createElement("style");
      style.id = "event-scrollbar-style";
      style.innerHTML = `
        #event-overlay .iframe-wrapper::-webkit-scrollbar {
          display: none !important;
        }
        #event-overlay .iframe-wrapper {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function createIframe(element, overlayMode, type) {
    let baseUrlString = element.getAttribute("data-base-url");
    const eventId = element.getAttribute("data-event-id"); // For events
    const templateId = element.getAttribute("data-template-id"); // For donations
    const tenantId = element.getAttribute("data-tenant-id"); // For donations

    if (type === "event" && !eventId) {
      console.error("Missing required event ID attribute");
      return null;
    }

    if (type === "donation" && (!templateId || !tenantId || !baseUrlString)) {
      console.error("Missing required donation attributes");
      return null;
    }

    let baseUrl;
    try {
      baseUrl = new URL(baseUrlString);
    } catch (e) {
      console.error("Invalid base URL:", baseUrlString);
      return null;
    }

    if (type === "event") {
      baseUrl.pathname = `/ticket-purchase/${eventId}`;
      baseUrl.searchParams.append("header", "no-header"); // Required for event URL
    }

    const utmData = captureUtmParameters();
    Object.entries(utmData.parameters).forEach(([key, value]) => {
      baseUrl.searchParams.append(key, value);
    });

    if (overlayMode) {
      baseUrl.searchParams.append("showOverlay", "true");
    }

    const iframe = document.createElement("iframe");
    iframe.src = baseUrl.toString();
    iframe.style.width = "100%";
    iframe.style.height = overlayMode ? "724px" : "100vh";
    iframe.setAttribute("frameborder", "0");
    iframe.style.overflow = "auto";
    iframe.style.border = "none";

    iframe.onload = function () {
      setTimeout(() => sendUtmParams(iframe), 1000);
      setTimeout(() => sendUtmParams(iframe), 3000);
      setTimeout(() => sendUtmParams(iframe), 5000);
    };

    return iframe;
  }

  function loadInlineWidget(container, type) {
    if (!container) return;

    container.innerHTML = "";
    const iframe = createIframe(container, false, type);
    if (!iframe) return;

    const heightHandler = (event) => {
      if (
        event.data?.type === "setHeight" &&
        event.source === iframe.contentWindow
      ) {
        iframe.style.height = `${event.data.height}px`;
        container.style.height = `${event.data.height}px`;
      }
    };

    // Store reference to inline container and iframe for restoration
    container._inlineIframe = iframe;
    container._inlineType = type;
    container._originalStep = 0; // Store original step (step 0) when overlay opens

    // Listen for open-overlay messages from event forms (only for event type)
    const overlayHandler = (event) => {
      if (
        event.data?.type === "open-overlay" &&
        event.data?.source === "event-form" &&
        type === "event" &&
        event.source === iframe.contentWindow
      ) {
        // Store original step (step 0) - this is the step the inline iframe was on before overlay opened
        // The event.data.step (step 1) is where it's transitioning to, but we want to restore to step 0
        container._originalStep = 0;

        // Create a temporary button element with the same attributes for overlay
        const tempButton = document.createElement("button");
        tempButton.setAttribute(
          "data-event-id",
          container.getAttribute("data-event-id")
        );
        tempButton.setAttribute(
          "data-base-url",
          container.getAttribute("data-base-url")
        );
        tempButton.setAttribute(
          "data-tenant-id",
          container.getAttribute("data-tenant-id")
        );

        // Store reference to inline container on tempButton for restoration
        tempButton._inlineContainer = container;

        // Store the event data to pass to overlay iframe
        tempButton._overlayData = {
          step: event.data?.step || 1,
          email: event.data?.email,
          name: event.data?.name,
          contact: event.data?.contact,
          checkoutTicket: event.data?.checkoutTicket,
          validCouponData: event.data?.validCouponData,
          tipAmount: event.data?.tipAmount,
          footerTotal: event.data?.footerTotal,
          event: event.data?.event,
        };

        // Open overlay with the same configuration
        loadOverlayWidget(tempButton, type);

        // Send confirmation back to iframe
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: "overlay-opened",
              source: "event-form",
              overlayOpenedStatus: true,
              step: container._originalStep,
            },
            "*"
          );
        }

        // Note: We don't hide the container - the overlay will naturally cover it with z-index
        // This prevents the iframe from disappearing when overlay opens
      }
    };

    window.addEventListener("message", heightHandler);
    window.addEventListener("message", overlayHandler);

    container.appendChild(iframe);

    // Store cleanup function on container for potential future use
    container._cleanup = () => {
      window.removeEventListener("message", heightHandler);
      window.removeEventListener("message", overlayHandler);
    };
  }

  // Updated overlay function using the donation widget's overlay style.
  function loadOverlayWidget(button, type) {
    // Remove any existing overlay for this widget type.
    const existingOverlay = document.getElementById(`${type}-overlay`);
    if (existingOverlay) existingOverlay.remove();

    // Create the full-screen overlay container.
    const overlay = document.createElement("div");
    overlay.id = `${type}-overlay`;
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999",
      padding: "0px 10px",
      overflow: "hidden",
    });

    // Create the dialog container.
    const dialog = document.createElement("div");

    // Function to update dialog width based on screen size.
    function updateDialogWidth() {
      // Use full width on mobile (max-width 768px) and 360px on larger screens.
      const width = window.matchMedia("(max-width: 768px)").matches
        ? // ? "100%"
          "360px"
        : "360px";
      dialog.style.width = width;
    }
    updateDialogWidth();
    window.addEventListener("resize", updateDialogWidth);

    Object.assign(dialog.style, {
      backgroundColor: "#fff",
      borderRadius: "16px",
      boxShadow: "0 0 30px rgba(0, 0, 0, 0.6)",
      position: "relative",
      height: "724px",
      maxHeight: "95vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    });

    // Create the round close button container.
    const closeDiv = document.createElement("div");
    Object.assign(closeDiv.style, {
      position: "absolute",
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "1px solid #EAECF0",
      background: "transparent",
      cursor: "pointer",
      zIndex: "10000",
      opacity: "0.8",
      fontSize: "20px",
      color: "#98A2B3",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    // Create inner div for the "×" symbol.
    const closeIcon = document.createElement("div");
    closeIcon.textContent = "×";
    closeIcon.style.fontSize = "36px";
    // closeIcon.style.marginBottom = "6px";
    closeDiv.appendChild(closeIcon);

    // Adjust the close button's position - always position at top-right inside overlay
    function adjustCloseButtonPosition() {
      closeDiv.style.top = "10px";
      closeDiv.style.right = "10px";
      closeDiv.style.left = "auto";
      closeDiv.style.transform = "none";
    }
    adjustCloseButtonPosition();
    window.addEventListener("resize", adjustCloseButtonPosition);

    // Close overlay on click.
    closeDiv.onclick = () => {
      // Clean up event listeners
      window.removeEventListener("resize", updateDialogWidth);
      window.removeEventListener("resize", adjustCloseButtonPosition);

      // Remove height handler if it exists
      if (overlay._heightHandler) {
        window.removeEventListener("message", overlay._heightHandler);
      }

      // Notify inline iframe that overlay was closed and restore to original step (if it exists)
      if (button._inlineContainer) {
        const inlineContainer = button._inlineContainer;

        // Notify inline iframe that overlay was closed and restore to original step
        if (
          inlineContainer._inlineIframe &&
          inlineContainer._inlineIframe.contentWindow
        ) {
          inlineContainer._inlineIframe.contentWindow.postMessage(
            {
              type: "overlay-closed",
              source: "event-form",
              overlayOpenedStatus: false,
              restoreStep: inlineContainer._originalStep || 0, // Restore to step when overlay opened
            },
            "*"
          );
        }
      }

      // Remove overlay
      overlay.remove();
    };

    // Create the iframe using createIframe.
    const iframe = createIframe(button, true, type);
    if (!iframe) return;

    // Wrap the iframe in a container that allows scrolling but hides scrollbar
    const iframeWrapper = document.createElement("div");
    iframeWrapper.classList.add("iframe-wrapper");
    Object.assign(iframeWrapper.style, {
      width: "100%",
      height: "100%",
      overflow: "auto", // Allow scrolling
      msOverflowStyle: "none", // IE and Edge - hide scrollbar
      scrollbarWidth: "none", // Firefox - hide scrollbar
    });
    iframeWrapper.appendChild(iframe);

    // Append the iframe wrapper and the close button to the dialog.
    dialog.appendChild(iframeWrapper);
    dialog.appendChild(closeDiv);

    // Append the dialog to the overlay, and the overlay to the body.
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Inject scrollbar hiding styles (scrollbar hidden but scrolling still works)
    injectScrollbarStyle();

    // Listen for height messages from the iframe
    const heightHandler = (event) => {
      if (
        event.data?.type === "setHeight" &&
        event.source === iframe.contentWindow
      ) {
        iframe.style.height = `${event.data.height}px`;
      }
    };
    window.addEventListener("message", heightHandler);

    // Store height handler reference for cleanup
    overlay._heightHandler = heightHandler;

    // Resend UTM params on iframe load and send overlay data if available
    iframe.onload = function () {
      setTimeout(() => sendUtmParams(iframe), 1000);
      setTimeout(() => sendUtmParams(iframe), 3000);
      setTimeout(() => sendUtmParams(iframe), 5000);

      // Send overlay data to iframe if available (for event widgets opened from inline)
      if (button._overlayData && type === "event") {
        console.log(
          "Sending overlay-data to overlay iframe:",
          button._overlayData
        );
        // Wait for iframe to be ready, send multiple times to ensure it's received
        const sendOverlayData = () => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              {
                type: "overlay-data",
                source: "event-form",
                ...button._overlayData,
              },
              "*"
            );
            console.log("Sent overlay-data message to iframe");
          }
        };

        // Send multiple times to ensure it's received
        setTimeout(sendOverlayData, 1000);
        setTimeout(sendOverlayData, 2000);
        setTimeout(sendOverlayData, 3000);
      }
    };
  }

  function initializeWidgets() {
    document.querySelectorAll(".widget").forEach((widget) => {
      const type = widget.getAttribute("data-widget-type");

      if (!type || (type !== "donation" && type !== "event")) {
        console.warn("Widget type not specified or invalid");
        return;
      }

      if (
        widget.classList.contains("widget-button") ||
        widget.tagName.toLowerCase() === "button"
      ) {
        const newWidget = widget.cloneNode(true);
        widget.parentNode.replaceChild(newWidget, widget);

        newWidget.addEventListener("click", (e) => {
          e.preventDefault();
          loadOverlayWidget(newWidget, type);
        });
      } else {
        loadInlineWidget(widget, type);
      }
    });
  }

  ["DOMContentLoaded", "load"].forEach((event) => {
    document.addEventListener(event, initializeWidgets);
  });

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(initializeWidgets, 500);
  }

  window.reinitializeWidgets = initializeWidgets;
})();
