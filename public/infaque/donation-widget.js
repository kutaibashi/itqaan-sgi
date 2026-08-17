(function () {
  let tenant_Id;
  let tipStatus,
    campaign,
    languageData,
    email,
    contribution,
    contributionWithoutConversion,
    onetime,
    conversionRate,
    phoneNumberStatusMandatory,
    emailCommunicationStatus,
    convertToMonthlySubStatus,
    businessNameStatus,
    businessNameStatusMandatory,
    nameStatusMandatory,
    addressStatusMandatory,
    addressStatus,
    formComponents,
    contactStatus,
    selectedDonationPurpose,
    cdnSessionId,
    dailyGiving,
    dailyGivingDates,
    hasManuallyChangedCurrency,
    causeCampaignSpecificId,
    hideDropdown,
    showSecondStep,
    step,
    tipAmount;

  // CDN Logging Helper Function
  // This function is fire-and-forget and will never block or error out the widget
  function logCdnEvent(event) {
    try {
      // Only log specific donation events
      const eventType = event.data?.type;
      const includedEvents = ["open-overlay", "from-donate-btn"];

      if (!includedEvents.includes(eventType)) {
        return; // Only log included events
      }

      // Extract cdn-session-id from event data if it exists, otherwise use "N/A"
      const cdnSessionId =
        event.data?.["cdn-session-id"] || event.data?.cdnSessionId || "N/A";

      // Convert entire event.data to string for the message
      const message = JSON.stringify(event.data);

      // Prepare payload
      const payload = {
        "tenant-id": "infaque-cdn",
        "event-type": 2,
        "cdn-session-id": cdnSessionId,
        message: message,
      };

      // Send to CDN logging endpoint (fire-and-forget, non-blocking)
      fetch(
        "https://us-central1-infaque-cdn.cloudfunctions.net/logCdnEventV02",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      ).catch(() => {
        // Silently fail - don't break widget functionality
        // No console logging to keep it completely silent
      });
    } catch (error) {
      // Silently catch any errors (e.g., JSON.stringify failures)
      // Widget continues normally regardless of logging failures
    }
  }

  // Handle incoming messages to decide which form/functionality to use
  window.addEventListener("message", function (event) {
    // Log all incoming events
    logCdnEvent(event);
    // Check if the message is from our React application
    if (event.data && typeof event.data === "object") {
      if (event.data.type === "select_form") {
        const showOldForm = event.data.showOldForm;

        console.log(
          `Using ${showOldForm ? "old" : "new"} form based on React app message`
        );

        if (showOldForm) {
          // Run the first IIFE (old code)
          runSecondFunction();
        } else {
          // Run the second IIFE (new  code)
          runFirstFunction();
        }
      }
    }
  });

  // Wrapper for the first implementation
  function runFirstFunction() {
    console.log("🔵 runFirstFunction is running");
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }
    function captureUtmParameters() {
      const currentUrl = new URL(window.location.href);
      const params = {};
      let fbp = getCookie("_fbp") || "NA";
      console.log("fbp from cookies", fbp);
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
        "showOldForm",
        "fbclid",
      ];

      paramNames.forEach((param) => {
        const value = currentUrl.searchParams.get(param);
        if (value) params[param] = value;
      });

      return {
        parentUrl: window.location.href,
        parameters: params,
      };
    }

    function sendUtmParams(iframe) {
      const utmData = captureUtmParameters();
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: "UTM_PARAMS", data: utmData },
          "*"
        );
      }
    }

    function sendtoSecondStep(iframe, templateId) {
      console.log("cdnSessionId sending step 3 in the widget", cdnSessionId);
      console.log("templateId sending step 3 in the widget", templateId);
      console.log(
        "dailyGiving sending step 3 in the widget",
        dailyGiving,
        dailyGivingDates
      );
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "overlay-opened",
            source: "donation-form",
            overlayOpenedStatus: true,
            step: step,
            tipStatus,
            campaign,
            languageData,
            email,
            contribution,
            contributionWithoutConversion,
            selectedDonationPurpose,
            onetime,
            conversionRate,
            phoneNumberStatusMandatory,
            emailCommunicationStatus,
            convertToMonthlySubStatus,
            businessNameStatus,
            businessNameStatusMandatory,
            nameStatusMandatory,
            addressStatusMandatory,
            addressStatus,
            formComponents,
            contactStatus,
            "cdn-session-id": cdnSessionId ? cdnSessionId : "N/A",
            cdnSessionId: cdnSessionId ? cdnSessionId : "N/A",
            templateId: templateId ? templateId : "N/A",
            dailyGiving: dailyGiving ? dailyGiving : false,
            dailyGivingDates: dailyGivingDates
              ? dailyGivingDates
              : {
                startDate: null,
                endDate: null,
              },
            hasManuallyChangedCurrency,
            causeCampaignSpecificId,
            tipAmount,
            hideDropdown,
            showSecondStep
          },
          "*"
        );
      }
    }

    function injectScrollbarStyle() {
      if (!document.getElementById("donation-scrollbar-style")) {
        const style = document.createElement("style");
        style.id = "donation-scrollbar-style";
        style.innerHTML = `
          #donation-overlay .iframe-wrapper::-webkit-scrollbar {
            display: none !important;
          }`;
        document.head.appendChild(style);
      }
    }

    function createDonationIframe(element, overlayMode) {
      const templateId = element.getAttribute("data-template-id");
      const tenantId = element.getAttribute("data-tenant-id");
      const baseUrlString = element.getAttribute("data-base-url");
      console.log("templateId", templateId);
      console.log("tenantId", tenantId);
      console.log("baseUrlString", baseUrlString);

      if (!templateId || !tenantId || !baseUrlString) {
        console.error("Missing required data attributes");
        return null;
      }

      let baseUrl;
      try {
        baseUrl = new URL(baseUrlString);
      } catch (e) {
        console.error("Invalid base URL:", baseUrlString);
        return null;
      }

      const utmData = captureUtmParameters();
      Object.entries(utmData.parameters).forEach(([key, value]) => {
        baseUrl.searchParams.append(key, value);
      });

      if (overlayMode) baseUrl.searchParams.append("showOverlay", "true");

      console.log("CDI 1: opening URL within iframe", baseUrl.toString());

      const iframe = document.createElement("iframe");
      iframe.src = baseUrl.toString();
      iframe.style.width = "100%";
      iframe.style.height = overlayMode ? "720px" : "400px";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow", "payment");
      iframe.removeAttribute("scrolling");
      iframe.style.borderRadius = "16px";
      iframe.onload = function () {
        [3000, 5000].forEach((delay) => {
          console.log(
            `CDI 3 ${delay}: sending UTM params and sending to second step`
          );
          setTimeout(() => sendUtmParams(iframe), delay);
          setTimeout(() => sendtoSecondStep(iframe, templateId), delay);
        });
      };

      console.log("CDI 2: returning iframe created", iframe);
      return iframe;
    }

    function loadOverlayDonation(button) {
      const existingOverlay = document.getElementById("donation-overlay");
      if (existingOverlay) existingOverlay.remove();

      const overlay = document.createElement("div");
      overlay.id = "donation-overlay";
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
        padding: "0 10px",
        overflowY: "scroll", // ✅ prevent overlay scroll
      });

      const dialog = document.createElement("div");
      Object.assign(dialog.style, {
        width: "360px",
        height: "95vh",
        borderRadius: "16px",
        position: "relative",
      });

      const closeDiv = document.createElement("div");
      Object.assign(closeDiv.style, {
        position: "absolute",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "rgb(213, 213, 213)",
        cursor: "pointer",
        zIndex: "10000",
        opacity: "0.8",
        fontSize: "20px",
        color: "rgb(34, 40, 50)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });

      const closeIcon = document.createElement("div");
      closeIcon.textContent = "×";
      closeIcon.style.fontSize = "36px";
      closeIcon.style.marginBottom = "6px";
      closeDiv.appendChild(closeIcon);

      function adjustCloseButtonPosition() {
        closeDiv.style.top = "-13px";
        closeDiv.style.left = "98%";

        closeDiv.style.transform = "translateX(-50%)";
      }

      window.addEventListener("resize", adjustCloseButtonPosition);
      adjustCloseButtonPosition();

      function handleCloseMessage(event) {
        if (event.data?.type === "close-overlay") {
          overlay.remove();
          document.body.style.overflow = ""; // ✅ re-enable body scroll
          window.removeEventListener("resize", adjustCloseButtonPosition);
          window.removeEventListener("message", handleCloseMessage);
        }
      }

      window.addEventListener("message", handleCloseMessage);

      closeDiv.onclick = () => {
        overlay.remove();
        document.body.style.overflow = ""; // ✅ re-enable body scroll
        window.removeEventListener("resize", adjustCloseButtonPosition);
        window.removeEventListener("message", handleCloseMessage);
      };

      const iframe = createDonationIframe(button, true);
      if (!iframe) return;
      iframe.style.overflow = "visible";

      const iframeWrapper = document.createElement("div");
      iframeWrapper.classList.add("iframe-wrapper");
      Object.assign(iframeWrapper.style, {
        overflow: "hidden", // ✅ disable iframe scroll
      });

      iframeWrapper.appendChild(iframe);
      dialog.appendChild(iframeWrapper);
      dialog.appendChild(closeDiv);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      document.body.style.overflow = "hidden"; // ✅ disable page scroll when overlay is open

      injectScrollbarStyle();

      window.addEventListener("message", (event) => {
        if (
          event.data?.type === "setHeight" &&
          event.source === iframe.contentWindow
        ) {
          iframe.style.height = `${event.data.height}px`;
        }
      });
    }

    function handleAllMessages(event) {
      try {
        // Log all incoming events
        logCdnEvent(event);

        if (!event.data || typeof event.data !== "object") return;

        console.log("event.data in the widget", event.data);

        if (event.data.type === "open-overlay") {
          const buttonParams = event.data.buttonParams;
          tipStatus = event.data.tipStatus;
          campaign = event.data.campaign;
          languageData = event.data.languageData;
          email = event.data.email;
          contribution = event.data.contribution;
          contributionWithoutConversion =
            event.data.contributionWithoutConversion;
          onetime = event.data.onetime;
          conversionRate = event.data.conversionRate;
          phoneNumberStatusMandatory = event.data.phoneNumberStatusMandatory;
          emailCommunicationStatus = event.data.emailCommunicationStatus;
          convertToMonthlySubStatus = event.data.convertToMonthlySubStatus;
          businessNameStatus = event.data.businessNameStatus;
          businessNameStatusMandatory = event.data.businessNameStatusMandatory;
          nameStatusMandatory = event.data.nameStatusMandatory;
          addressStatusMandatory = event.data.addressStatusMandatory;
          addressStatus = event.data.addressStatus;
          contactStatus = event.data.contactStatus;
          selectedDonationPurpose = event.data.selectedDonationPurpose;
          tenant_Id = event.data.tenantId;
          formComponents = event.data.formComponents;
          cdnSessionId = event?.data["cdn-session-id"]
            ? event?.data["cdn-session-id"]
            : "N/A";
          dailyGiving = event.data?.dailyGiving || false;
          dailyGivingDates = event.data?.dailyGivingDates || {
            startDate: null,
            endDate: null,
          };
          hasManuallyChangedCurrency = event.data.hasManuallyChangedCurrency || null;
          causeCampaignSpecificId = event.data.causeCampaignSpecificId || null;
          hideDropdown = event.data.hideDropdown || false;
          tipAmount = event.data?.tipAmount || null;
          showSecondStep = event.data?.showSecondStep || false;
          step = event.data?.step || 1;


          console.log("cdnSessionId saved in the widget", cdnSessionId);

          const buttonElement = document.createElement("button");
          buttonElement.id = "donation-widget-1744632713466-c76gm";
          buttonElement.classList.add(
            "donation-widget",
            "donation-widget-button"
          );
          buttonElement.setAttribute(
            "data-template-id",
            buttonParams.templateId
          );
          buttonElement.setAttribute(
            "data-template-name",
            buttonParams.templateName
          );
          buttonElement.setAttribute("data-tenant-id", buttonParams.tenantId);
          buttonElement.setAttribute("data-base-url", buttonParams.baseUrl);
          buttonElement.innerText = buttonParams.buttonText || "Donate Now";

          document.body.appendChild(buttonElement);
          if (buttonElement) loadOverlayDonation(buttonElement);
        }
      } catch (e) {
        console.error("Error handling message:", e);
      }
    }

    window.removeEventListener("message", handleAllMessages);
    window.addEventListener("message", handleAllMessages);
  }

  // Wrapper for the second implementation
  function runSecondFunction() {
    console.log("🔵 runSecondFunction is running (default)");

    function captureUtmParameters() {
      const currentUrl = new URL(window.location.href);
      const params = {};
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

    function createDonationIframe(element, overlayMode) {
      const templateId = element.getAttribute("data-template-id");
      const tenantId = element.getAttribute("data-tenant-id"); // assuming tenantId === projectId
      let baseUrlString = element.getAttribute("data-base-url");

      if (!templateId || !tenantId || !baseUrlString) {
        console.error("Missing required data attributes");
        return null;
      }

      let baseUrl;
      try {
        baseUrl = new URL(baseUrlString);
      } catch (e) {
        console.error("Invalid base URL:", baseUrlString);
        return null;
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
      iframe.setAttribute("allow", "payment");
      iframe.setAttribute("frameborder", "0");
      iframe.removeAttribute("scrolling");

      // ✅ Apply style conditionally based on tenant/project id
      if (tenantId === "bonyan") {
        iframe.style.height = overlayMode ? "100%" : "400px";
        iframe.style.msOverflowStyle = "none"; // IE and Edge
        iframe.style.scrollbarWidth = "none"; // Firefox
      } else {
        iframe.style.height = overlayMode ? "720px" : "400px";
        iframe.style.borderRadius = "16px";
      }

      iframe.onload = function () {
        [1000, 3000, 5000].forEach((delay) => {
          setTimeout(() => sendUtmParams(iframe), delay);
        });
      };

      return iframe;
    }

    function loadInlineDonation(container) {
      if (!container) return;
      container.innerHTML = "";
      const iframe = createDonationIframe(container, false);

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

      window.addEventListener("message", heightHandler);
      container.appendChild(iframe);
    }

    // Inject custom styles to hide the scrollbar for WebKit browsers in the wrapper.
    function injectScrollbarStyle() {
      if (!document.getElementById("donation-scrollbar-style")) {
        const style = document.createElement("style");
        style.id = "donation-scrollbar-style";
        style.innerHTML = `
              /* Hide scrollbar for Chrome, Safari and Opera */
              #donation-overlay .iframe-wrapper::-webkit-scrollbar {
                display: none !important;
              }
            `;
        document.head.appendChild(style);
      }
    }

    function loadOverlayDonation(button) {
      const existingOverlay = document.getElementById("donation-overlay");
      if (existingOverlay) existingOverlay.remove();

      // Create the full-screen overlay container.
      const overlay = document.createElement("div");
      overlay.id = "donation-overlay";
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
        padding: "0px 10px 0px 10px",
      });

      // Create the dialog container.
      const dialog = document.createElement("div");

      // Function to update dialog width based on screen size.
      function updateDialogWidth() {
        // Full width on mobile (max-width 768px), 30% on larger screens.
        const width = window.matchMedia("(max-width: 768px)").matches
          ? "100%"
          : "30%";
        dialog.style.width = width;
      }
      updateDialogWidth(); // initial width set

      Object.assign(dialog.style, {
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 0 30px rgba(0, 0, 0, 0.6)",
        position: "relative",
        height: "95vh", // Adjust as needed.
        display: "flex",
        flexDirection: "column",
      });

      // Create the round close button container (div) with an inner div for the "×".
      const closeDiv = document.createElement("div");
      closeDiv.style.position = "absolute";
      closeDiv.style.top = "10px";
      closeDiv.style.left = "50%";
      closeDiv.style.transform = "translateX(-50%)";
      closeDiv.style.width = "32px";
      closeDiv.style.height = "32px";
      closeDiv.style.borderRadius = "50%";
      closeDiv.style.background = "rgb(213, 213, 213)";
      closeDiv.style.cursor = "pointer";
      closeDiv.style.zIndex = "10000";
      closeDiv.style.opacity = "0.8";
      closeDiv.style.fontSize = "20px";
      closeDiv.style.color = "rgb(34, 40, 50)";
      closeDiv.style.display = "flex";
      closeDiv.style.alignItems = "center";
      closeDiv.style.justifyContent = "center";

      // Create inner div for the "×" symbol.
      const closeIcon = document.createElement("div");
      closeIcon.textContent = "×";
      closeIcon.style.fontSize = "36px";
      closeIcon.style.marginBottom = "6px";
      closeDiv.appendChild(closeIcon);

      // Function to adjust the position of the close button based on screen size
      function adjustCloseButtonPosition() {
        const mediaQuery = window.matchMedia("(max-width: 768px)");

        // On mobile, change the position
        closeDiv.style.top = "-13px";
        closeDiv.style.left = "98%";
        closeDiv.style.transform = "translateX(-50%)";
      }

      // Add event listener for window resize to instantly update button position
      window.addEventListener("resize", adjustCloseButtonPosition);

      // Initialize position on page load
      adjustCloseButtonPosition();

      closeDiv.style.cursor = "pointer";

      // Close button click event
      closeDiv.onclick = () => {
        overlay.remove();
        window.removeEventListener("resize", updateDialogWidth);
      };

      // Listen for postMessage to close overlay from parent
      function handleCloseMessage(event) {
        if (event.data && event.data.type === "close-overlay") {
          console.log("Received close-overlay message from parent");
          overlay.remove();
          window.removeEventListener("resize", updateDialogWidth);
          window.removeEventListener("message", handleCloseMessage);
        }
      }
      window.addEventListener("message", handleCloseMessage);

      // Create the iframe for the donation widget.
      const iframe = createDonationIframe(button, true);

      if (!iframe) return;
      // Remove overflow styling from iframe so that the wrapper can handle scrolling.
      iframe.style.overflow = "visible";

      // Wrap the iframe in a container that hides the scrollbar.
      const iframeWrapper = document.createElement("div");
      iframeWrapper.classList.add("iframe-wrapper");
      Object.assign(iframeWrapper.style, {
        width: "100%",
        height: "100%",
        overflow: "auto",
        msOverflowStyle: "none", // IE and Edge
        scrollbarWidth: "none", // Firefox
      });
      iframeWrapper.appendChild(iframe);

      // Append the iframe wrapper and the close div to the dialog.
      dialog.appendChild(iframeWrapper);
      dialog.appendChild(closeDiv);

      // Append the dialog to the overlay.
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      // Inject the scrollbar-hiding styles.
      injectScrollbarStyle();

      // Update dialog width on window resize.
      window.addEventListener("resize", updateDialogWidth);

      const heightHandler = (event) => {
        if (
          event.data?.type === "setHeight" &&
          event.source === iframe.contentWindow
        ) {
          // Adjust height
          iframe.style.height = `${event.data.height}px`;
          container.style.height = `${event.data.height}px`;
        }
      };

      window.addEventListener("message", heightHandler);

      window.addEventListener("message", (e) => console.log("Any message:", e));
      iframe.onload = function () {
        setTimeout(() => sendUtmParams(iframe), 1000);
        setTimeout(() => sendUtmParams(iframe), 3000);
        setTimeout(() => sendUtmParams(iframe), 5000);
      };
    }

    function loadOverlayDonationforOtherTenant(button) {
      const existingOverlay = document.getElementById("donation-overlay");
      if (existingOverlay) existingOverlay.remove();

      const overlay = document.createElement("div");
      overlay.id = "donation-overlay";
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
        padding: "0 10px",
        overflow: "auto", // Changed from "auto" to ensure consistent behavior
      });

      const dialog = document.createElement("div");
      Object.assign(dialog.style, {
        width: "360px",
        maxWidth: "100%", // Added to ensure dialog doesn't overflow on small screens
        maxHeight: "90vh", // Added to ensure dialog doesn't overflow viewport
        borderRadius: "16px",
        position: "relative",
        backgroundColor: "#fff", // Added to ensure dialog is visible
        margin: "20px auto", // Added to provide space when zoomed
      });

      const closeDiv = document.createElement("div");
      Object.assign(closeDiv.style, {
        position: "absolute",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "rgb(213, 213, 213)",
        cursor: "pointer",
        zIndex: "10000",
        opacity: "0.8",
        fontSize: "20px",
        color: "rgb(34, 40, 50)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });

      const closeIcon = document.createElement("div");
      closeIcon.textContent = "×";
      closeIcon.style.fontSize = "36px";
      closeIcon.style.marginBottom = "6px";
      closeDiv.appendChild(closeIcon);

      function adjustCloseButtonPosition() {
        closeDiv.style.top = "-13px";
        closeDiv.style.left = "98%";
        // } else {
        //   closeDiv.style.top = "6px";
        //   closeDiv.style.left = "200%";
        // }
        closeDiv.style.transform = "translateX(-50%)";
      }

      window.addEventListener("resize", adjustCloseButtonPosition);
      adjustCloseButtonPosition();

      closeDiv.onclick = () => {
        overlay.remove();
        document.body.style.overflow = ""; // ✅ re-enable body scroll
        window.removeEventListener("resize", adjustCloseButtonPosition);
      };

      // Listen for postMessage to close overlay from parent
      function handleCloseMessage(event) {
        if (event.data && event.data.type === "close-overlay") {
          console.log("Received close-overlay message from parent");
          overlay.remove();
          document.body.style.overflow = ""; // ✅ re-enable body scroll
          window.removeEventListener("resize", adjustCloseButtonPosition);
          window.removeEventListener("message", handleCloseMessage);
        }
      }
      window.addEventListener("message", handleCloseMessage);

      const iframe = createDonationIframe(button, true);
      if (!iframe) return;
      iframe.style.overflow = "visible";

      const iframeWrapper = document.createElement("div");
      iframeWrapper.classList.add("iframe-wrapper");
      Object.assign(iframeWrapper.style, {
        width: "100%",
        height: "100%",
        overflow: "auto", // Changed from "hidden" to "auto" to allow scrolling
        msOverflowStyle: "none", // IE and Edge
        scrollbarWidth: "none", // Firefox
      });

      iframeWrapper.appendChild(iframe);
      dialog.appendChild(iframeWrapper);
      dialog.appendChild(closeDiv);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      document.body.style.overflow = "hidden"; // ✅ disable page scroll when overlay is open

      injectScrollbarStyle();

      window.addEventListener("message", (event) => {
        if (
          event.data?.type === "setHeight" &&
          event.source === iframe.contentWindow
        ) {
          iframe.style.height = `${event.data.height}px`;
        }
      });
    }

    function initializeWidgets() {
      document.querySelectorAll(".donation-widget").forEach((widget) => {
        if (
          widget.classList.contains("donation-widget-button") ||
          widget.tagName.toLowerCase() === "button"
        ) {
          const newWidget = widget.cloneNode(true);
          widget.parentNode.replaceChild(newWidget, widget);

          newWidget.addEventListener("click", (e) => {
            e.preventDefault();

            if (tenant_Id === "bonyan-ngo") {
              loadOverlayDonation(newWidget);
            } else {
              console.log("🟢 message post");

              // Step 1: Inject overlay first
              loadOverlayDonationforOtherTenant(newWidget);

              // Step 2: Listen for "iframe-ready" message from the iframe app
              window.addEventListener(
                "message",
                function handleIframeReady(event) {
                  // Optional: Security check (can be '*', or check event.origin)
                  if (event.data?.type === "iframe-ready") {
                    console.log("✅ iframe reported it is ready");

                    // Remove listener after receiving once (avoid duplicate sends)
                    window.removeEventListener("message", handleIframeReady);

                    // Step 3: Get iframe reference
                    const iframe = document.querySelector(
                      "#donation-overlay .iframe-wrapper iframe"
                    );

                    if (iframe && iframe.contentWindow) {
                      console.log(
                        "📤 Sending from-donate-btn message to iframe"
                      );
                      iframe.contentWindow.postMessage(
                        { type: "from-donate-btn", fromDonateButton: true },
                        "*"
                      );
                    } else {
                      console.warn("❌ iframe not found at time of sending");
                    }
                  }
                }
              );
            }
          });
        } else {
          loadInlineDonation(widget);
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

    window.reinitializeDonationWidgets = initializeWidgets;
  }

  // By default, run the new form (second function)
  // This can be overridden by a message from the React app
  const urlParams = new URLSearchParams(window.location.search);
  const showOldFormParam = urlParams.get("showOldForm");

  if (showOldFormParam === "true") {
    runFirstFunction();
  } else {
    runSecondFunction();
  }
})();
