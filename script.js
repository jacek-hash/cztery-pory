(function () {
  const params = new URLSearchParams(window.location.search);
  const utmFields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  window.dataLayer = window.dataLayer || [];

  function getDevice() {
    if (window.matchMedia("(max-width: 720px)").matches) return "mobile";
    if (window.matchMedia("(max-width: 1024px)").matches) return "tablet";
    return "desktop";
  }

  function pushEvent(name, extra) {
    const payload = Object.assign(
      {
        event: name,
        source: params.get("utm_source") || "direct",
        medium: params.get("utm_medium") || "none",
        campaign: params.get("utm_campaign") || "",
        ad_group: params.get("utm_adgroup") || "",
        creative: params.get("utm_content") || "",
        keyword: params.get("utm_term") || "",
        device: getDevice()
      },
      extra || {}
    );

    window.dataLayer.push(payload);
    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
    }
  }

  utmFields.forEach(function (field) {
    document.querySelectorAll('input[name="' + field + '"]').forEach(function (input) {
      input.value = params.get(field) || "";
    });
  });

  document.querySelectorAll('input[name="ad_group"]').forEach(function (input) {
    input.value = params.get("utm_adgroup") || "";
  });
  document.querySelectorAll('input[name="creative"]').forEach(function (input) {
    input.value = params.get("utm_content") || "";
  });
  document.querySelectorAll('input[name="keyword"]').forEach(function (input) {
    input.value = params.get("utm_term") || "";
  });
  document.querySelectorAll('input[name="device"]').forEach(function (input) {
    input.value = getDevice();
  });

  pushEvent("lp_cpb_view");

  document.querySelectorAll("[data-event]").forEach(function (element) {
    element.addEventListener("click", function () {
      pushEvent(element.dataset.event, {
        cta_location: element.dataset.location || element.textContent.trim()
      });
    });
  });

  document.querySelectorAll("form").forEach(function (form) {
    let started = false;
    form.addEventListener("input", function () {
      if (!started) {
        started = true;
        pushEvent("lp_cpb_form_start");
      }
    });
  });

  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const status = form.querySelector(".form-status");

      pushEvent("lp_cpb_form_submit", {
        cta_location: form.id === "leadForm" ? "final-form" : "mini-form",
        declared_plot_status: data.get("plot_status") || "",
        declared_build_timing: data.get("build_timing") || "",
        declared_size_range: data.get("size_range") || ""
      });

      if (status) {
        status.textContent = "Dziękujemy. To wersja demonstracyjna LP. Wdrożenie produkcyjne powinno wysłać dane do CRM i pokazać thank-you page.";
      } else {
        alert("Dziękujemy. To wersja demonstracyjna LP. Wdrożenie produkcyjne powinno wysłać dane do CRM.");
      }
    });
  });
})();
