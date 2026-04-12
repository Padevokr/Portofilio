(function () {
  const modal = document.getElementById("idea-modal");
  const dialog = modal?.querySelector(".idea-modal__dialog");
  const form = document.getElementById("idea-form");
  const submitButton = document.getElementById("idea-submit");
  const successBox = document.getElementById("idea-success");
  const statusBox = document.getElementById("idea-form-status");

  if (!modal || !dialog || !form || !submitButton || !successBox || !statusBox) return;

  const config = window.IDEA_INBOX_CONFIG || {};
  const useMockRequest = config.mock === true;
  const apiBaseUrl = typeof config.apiBaseUrl === "string" ? config.apiBaseUrl.trim().replace(/\/+$/, "") : "";

  const fields = {
    category: document.getElementById("idea-category"),
    scale:    document.getElementById("idea-scale"),
    idea:     document.getElementById("idea-text"),
    reason:   document.getElementById("idea-reason"),
    contact:  document.getElementById("idea-contact"),
  };

  const fieldWrappers = {
    category: fields.category.closest(".idea-form__field"),
    scale:    fields.scale.closest(".idea-form__field"),
    idea:     fields.idea.closest(".idea-form__field"),
    reason:   fields.reason.closest(".idea-form__field"),
    contact:  fields.contact.closest(".idea-form__field"),
  };

  const errorNodes = {
    category: document.getElementById("idea-category-error"),
    scale:    document.getElementById("idea-scale-error"),
    idea:     document.getElementById("idea-text-error"),
    reason:   document.getElementById("idea-reason-error"),
    contact:  document.getElementById("idea-contact-error"),
  };

  const counters = {
    idea:    document.getElementById("idea-text-count"),
    reason:  document.getElementById("idea-reason-count"),
    contact: document.getElementById("idea-contact-count"),
  };

  const openButtons  = document.querySelectorAll("[data-idea-open]");
  const closeButtons = modal.querySelectorAll("[data-idea-close]");

  const focusableSelector = [
    "button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    "a[href]",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ");

  let lastFocusedElement = null;
  let isSubmitting = false;

  function getSelectedCategories() {
    try {
      const parsed = JSON.parse(fields.category.value || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()) : [];
    } catch (_) {
      return [];
    }
  }

  function setSelectedCategories(values) {
    fields.category.value = JSON.stringify(values);
  }

  function getFocusableElements() {
    return Array.from(dialog.querySelectorAll(focusableSelector)).filter(
      (el) => !el.hasAttribute("hidden") && el.offsetParent !== null
    );
  }

  function setStatus(message, type) {
    statusBox.textContent = message || "";
    statusBox.classList.remove("is-error", "is-success");
    if (type) statusBox.classList.add(type === "error" ? "is-error" : "is-success");
  }

  function setFieldError(name, message) {
    const wrapper   = fieldWrappers[name];
    const errorNode = errorNodes[name];
    if (!wrapper || !errorNode) return;
    wrapper.classList.toggle("has-error", Boolean(message));
    errorNode.textContent = message || "";
  }

  function clearErrors() {
    Object.keys(errorNodes).forEach((name) => setFieldError(name, ""));
    setStatus("", "");
  }

  function updateCounter(fieldName) {
    const field   = fields[fieldName];
    const counter = counters[fieldName];
    if (!field || !counter) return;
    counter.textContent = String(field.value.length);
  }

  function updateCatCards() {
    const values = getSelectedCategories();
    modal.querySelectorAll(".idea-cat-card").forEach((card) => {
      const isSelected = values.includes(card.dataset.catValue || "");
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  }

  function updateScaleCards() {
    const val = fields.scale.value;
    modal.querySelectorAll(".idea-scale-card").forEach((card) => {
      const isSelected = card.dataset.scaleValue === val;
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  }

  function clearSuccessState() {
    successBox.hidden = true;
  }

  function resetFormState() {
    form.reset();
    setSelectedCategories([]);
    fields.scale.value    = "";
    updateCatCards();
    updateScaleCards();
    updateCounter("idea");
    updateCounter("reason");
    updateCounter("contact");
    clearErrors();
    clearSuccessState();
  }

  function openModal(trigger) {
    lastFocusedElement = trigger || document.activeElement;
    modal.hidden = false;
    document.body.classList.add("idea-modal-open");
    clearErrors();
    clearSuccessState();
    window.requestAnimationFrame(() => {
      (fields.idea || getFocusableElements()[0] || dialog).focus();
    });
  }

  function closeModal() {
    if (isSubmitting) return;
    modal.hidden = true;
    document.body.classList.remove("idea-modal-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function validate() {
    const selectedCategories = getSelectedCategories();
    const payload = {
      category: selectedCategories.join(", "),
      scale:    fields.scale.value.trim(),
      idea:     fields.idea.value.trim(),
      reason:   fields.reason.value.trim(),
      contact:  fields.contact.value.trim(),
    };

    let isValid = true;
    clearErrors();

    if (!selectedCategories.length) {
      setFieldError("category", "Select at least one category.");
      isValid = false;
    }
    if (!payload.scale) {
      setFieldError("scale", "Select a scale.");
      isValid = false;
    }
    if (!payload.idea) {
      setFieldError("idea", "Enter the main idea.");
      isValid = false;
    } else if (payload.idea.length > 500) {
      setFieldError("idea", "Main idea must be 500 characters or fewer.");
      isValid = false;
    }
    if (payload.reason.length > 400) {
      setFieldError("reason", "Reason must be 400 characters or fewer.");
      isValid = false;
    }
    if (payload.contact.length > 100) {
      setFieldError("contact", "Contact must be 100 characters or fewer.");
      isValid = false;
    }

    return { isValid, payload };
  }

  async function postIdea(payload) {
    if (useMockRequest) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      return { ok: true };
    }

    if (!apiBaseUrl) {
      throw new Error("Idea API is not configured.");
    }

    const response = await fetch(`${apiBaseUrl}/api/idea`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = "Could not send the idea. Please try again later.";
      try {
        const data = await response.json();
        if (typeof data?.details?.message === "string" && data.details.message.trim()) {
          message = data.details.message.trim();
        } else if (typeof data?.error === "string" && data.error.trim()) {
          message = data.error.trim();
        }
      } catch (_) {}
      throw new Error(message);
    }

    return response;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const { isValid, payload } = validate();
    if (!isValid) {
      setStatus("Please fix the highlighted fields.", "error");
      return;
    }

    isSubmitting = true;
    submitButton.disabled   = true;
    submitButton.textContent = "Sending...";
    setStatus("Sending idea...", "");
    clearSuccessState();

    try {
      await postIdea(payload);
      resetFormState();
      successBox.hidden = false;
      setStatus("Idea submitted successfully.", "success");
    } catch (error) {
      setStatus(error.message || "Could not send the idea. Please try again later.", "error");
    } finally {
      isSubmitting = false;
      submitButton.disabled   = false;
      submitButton.textContent = "Submit idea";
    }
  }

  function handleDialogClick(event) {
    const catCard = event.target.closest(".idea-cat-card");
    if (catCard) {
      const value = catCard.dataset.catValue || "";
      const selected = getSelectedCategories();
      const nextSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      setSelectedCategories(nextSelected);
      updateCatCards();
      setFieldError("category", "");
      clearSuccessState();
      return;
    }

    const scaleCard = event.target.closest(".idea-scale-card");
    if (scaleCard) {
      fields.scale.value = scaleCard.dataset.scaleValue || "";
      updateScaleCards();
      setFieldError("scale", "");
      clearSuccessState();
    }
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || modal.hidden) return;
    const focusable = getFocusableElements();
    if (!focusable.length) { event.preventDefault(); return; }
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  openButtons.forEach((btn) => btn.addEventListener("click", () => openModal(btn)));
  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  dialog.addEventListener("click", handleDialogClick);
  form.addEventListener("submit", handleSubmit);

  [fields.idea, fields.reason, fields.contact].forEach((field) => {
    field.addEventListener("input", () => {
      clearSuccessState();
      setFieldError(field.name, "");
      updateCounter(field.name);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) { closeModal(); return; }
    trapFocus(event);
  });

  updateCounter("idea");
  updateCounter("reason");
  updateCounter("contact");
  updateCatCards();
  updateScaleCards();
})();
