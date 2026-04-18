(function () {
  const MAX_IMAGE_FILES = 3;
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
  const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

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
  let translations = window.portfolioTranslations || {};

  const fields = {
    category: document.getElementById("idea-category"),
    scale: document.getElementById("idea-scale"),
    idea: document.getElementById("idea-text"),
    reason: document.getElementById("idea-reason"),
    contact: document.getElementById("idea-contact"),
    images: document.getElementById("idea-images"),
  };

  const fieldWrappers = {
    category: fields.category.closest(".idea-form__field"),
    scale: fields.scale.closest(".idea-form__field"),
    idea: fields.idea.closest(".idea-form__field"),
    reason: fields.reason.closest(".idea-form__field"),
    contact: fields.contact.closest(".idea-form__field"),
    images: fields.images.closest(".idea-form__field"),
  };

  const errorNodes = {
    category: document.getElementById("idea-category-error"),
    scale: document.getElementById("idea-scale-error"),
    idea: document.getElementById("idea-text-error"),
    reason: document.getElementById("idea-reason-error"),
    contact: document.getElementById("idea-contact-error"),
    images: document.getElementById("idea-images-error"),
  };

  const counters = {
    idea: document.getElementById("idea-text-count"),
    reason: document.getElementById("idea-reason-count"),
    contact: document.getElementById("idea-contact-count"),
    images: document.getElementById("idea-images-count"),
  };

  const imagesList = document.getElementById("idea-images-list");
  const uploadZone = modal.querySelector(".idea-upload");
  const openButtons = document.querySelectorAll("[data-idea-open]");
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
  let selectedImages = [];

  function t(key, fallback) {
    const value = translations[key];
    return typeof value === "string" && value.trim() ? value : fallback;
  }

  function getCurrentLanguage() {
    const htmlLang = document.documentElement.getAttribute("lang");
    const storedLang = localStorage.getItem("lang");
    return (storedLang || htmlLang || "en").trim().toLowerCase();
  }

  function getLocalizedCategory(value) {
    const map = {
      Project: t("idea-category-project", "Project"),
      "Website feature": t("idea-category-website-feature", "Website feature"),
      Automation: t("idea-category-automation", "Automation"),
      Telegram: t("idea-category-telegram", "Telegram"),
      Tool: t("idea-category-tool", "Tool"),
      Experiment: t("idea-category-experiment", "Experiment"),
      Other: t("idea-category-other", "Other"),
    };

    return map[value] || value;
  }

  function getLocalizedScale(value) {
    const map = {
      Small: t("idea-scale-small", "Small"),
      Medium: t("idea-scale-medium", "Medium"),
      Large: t("idea-scale-large", "Large"),
    };

    return map[value] || value;
  }

  function getSelectedCategories() {
    try {
      const parsed = JSON.parse(fields.category.value || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()) : [];
    } catch (_) {
      return [];
    }
  }

  function getSelectedImages() {
    return [...selectedImages];
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
    const wrapper = fieldWrappers[name];
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
    const field = fields[fieldName];
    const counter = counters[fieldName];
    if (!field || !counter) return;

    if (fieldName === "images") {
      counter.textContent = String(getSelectedImages().length);
      return;
    }

    counter.textContent = String(field.value.length);
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} ${t("idea-images-unit-kb", "")}`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${t("idea-images-unit-mb", "")}`;
  }

  function getImageFingerprint(file) {
    return [file.name, file.size, file.lastModified].join(":");
  }

  function syncFileInput() {
    if (typeof DataTransfer === "undefined") return;
    const transfer = new DataTransfer();
    selectedImages.forEach((file) => transfer.items.add(file));
    fields.images.files = transfer.files;
  }

  function setSelectedImages(files) {
    selectedImages = [...files];
    syncFileInput();
  }

  function clearImageSelection() {
    selectedImages = [];
    fields.images.value = "";
    syncFileInput();
  }

  function appendImages(newFiles) {
    const existing = new Map(selectedImages.map((file) => [getImageFingerprint(file), file]));
    newFiles.forEach((file) => {
      existing.set(getImageFingerprint(file), file);
    });
    setSelectedImages(existing.values());
    fields.images.value = "";
  }

  function renderSelectedImages() {
    const files = getSelectedImages();
    updateCounter("images");

    if (!imagesList) return;
    imagesList.innerHTML = "";

    if (!files.length) {
      imagesList.hidden = true;
      return;
    }

    imagesList.hidden = false;
    files.forEach((file) => {
      const item = document.createElement("li");
      item.className = "idea-upload__item";
      item.dataset.fileId = getImageFingerprint(file);
      const name = document.createElement("span");
      name.className = "idea-upload__name";
      name.textContent = file.name;
      const size = document.createElement("span");
      size.className = "idea-upload__size";
      size.textContent = formatFileSize(file.size);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "idea-upload__remove";
      remove.dataset.fileRemove = item.dataset.fileId;
      remove.setAttribute("aria-label", t("idea-images-remove-label", ""));
      remove.setAttribute("title", t("idea-images-remove-label", ""));
      remove.textContent = "×";
      item.append(name, size, remove);
      imagesList.appendChild(item);
    });
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
    fields.scale.value = "";
    clearImageSelection();
    updateCatCards();
    updateScaleCards();
    updateCounter("idea");
    updateCounter("reason");
    updateCounter("contact");
    renderSelectedImages();
    clearErrors();
    clearSuccessState();
  }

  function refreshDynamicText() {
    if (!isSubmitting) {
      submitButton.textContent = t("idea-submit", "Submit idea");
    }
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
    resetFormState();
    modal.hidden = true;
    document.body.classList.remove("idea-modal-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function hasAllowedExtension(filename) {
    const lower = filename.toLowerCase();
    return ALLOWED_IMAGE_EXTENSIONS.some((extension) => lower.endsWith(extension));
  }

  function validateImages(files) {
    if (files.length > MAX_IMAGE_FILES) {
      return t("idea-error-images-count", "");
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type) || !hasAllowedExtension(file.name)) {
        return t("idea-error-images-type", "");
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return t("idea-error-images-size", "");
      }
    }

    return "";
  }

  function commitImages(nextFiles) {
    const existing = new Map(selectedImages.map((file) => [getImageFingerprint(file), file]));
    nextFiles.forEach((file) => {
      existing.set(getImageFingerprint(file), file);
    });

    const mergedFiles = Array.from(existing.values());
    if (mergedFiles.length > MAX_IMAGE_FILES) {
      fields.images.value = "";
      setFieldError("images", t("idea-error-images-count", ""));
      return;
    }

    setSelectedImages(mergedFiles);
    fields.images.value = "";
    renderSelectedImages();
    setFieldError("images", validateImages(getSelectedImages()));
    clearSuccessState();
  }

  function validate() {
    const selectedCategories = getSelectedCategories();
    const images = getSelectedImages();
    const payload = {
      category: selectedCategories.map(getLocalizedCategory).join(", "),
      scale: getLocalizedScale(fields.scale.value.trim()),
      idea: fields.idea.value.trim(),
      reason: fields.reason.value.trim(),
      contact: fields.contact.value.trim(),
      website: "",
    };

    let isValid = true;
    clearErrors();

    if (!selectedCategories.length) {
      setFieldError("category", t("idea-error-category", "Select at least one category."));
      isValid = false;
    }
    if (!payload.scale) {
      setFieldError("scale", t("idea-error-scale", "Select a scale."));
      isValid = false;
    }
    if (!payload.idea) {
      setFieldError("idea", t("idea-error-main", "Enter the main idea."));
      isValid = false;
    } else if (payload.idea.length > 500) {
      setFieldError("idea", t("idea-error-main-length", "Main idea must be 500 characters or fewer."));
      isValid = false;
    }
    if (payload.reason.length > 400) {
      setFieldError("reason", t("idea-error-reason-length", "Reason must be 400 characters or fewer."));
      isValid = false;
    }
    if (payload.contact.length > 100) {
      setFieldError("contact", t("idea-error-contact-length", "Contact must be 100 characters or fewer."));
      isValid = false;
    }

    const imagesError = validateImages(images);
    if (imagesError) {
      setFieldError("images", imagesError);
      isValid = false;
    }

    return { isValid, payload, images };
  }

  function buildMultipartPayload(payload, images) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });
    images.forEach((image) => {
      formData.append("images", image, image.name);
    });
    return formData;
  }

  async function postIdea(payload, images) {
    if (useMockRequest) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      return { ok: true };
    }

    if (!apiBaseUrl) {
      throw new Error(t("idea-error-api-not-configured", "Idea API is not configured."));
    }

    const headers = {
      Accept: "application/json",
      "X-Portfolio-Lang": getCurrentLanguage(),
    };
    const requestInit = {
      method: "POST",
      headers,
    };

    if (images.length) {
      requestInit.body = buildMultipartPayload(payload, images);
    } else {
      headers["Content-Type"] = "application/json";
      requestInit.body = JSON.stringify(payload);
    }

    const response = await fetch(`${apiBaseUrl}/api/idea`, requestInit);

    if (!response.ok) {
      let message = t("idea-error-send", "Could not send the idea. Please try again later.");
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

    const { isValid, payload, images } = validate();
    if (!isValid) {
      setStatus(t("idea-error-fix", "Please fix the highlighted fields."), "error");
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = t("idea-status-sending-button", "Sending...");
    setStatus(
      images.length
        ? t("idea-status-sending-images", "")
        : t("idea-status-sending", "Sending idea..."),
      ""
    );
    clearSuccessState();

    try {
      await postIdea(payload, images);
      resetFormState();
      successBox.hidden = false;
      setStatus(t("idea-status-success", "Idea submitted successfully."), "success");
    } catch (error) {
      setStatus(error.message || t("idea-error-send", "Could not send the idea. Please try again later."), "error");
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = t("idea-submit", "Submit idea");
    }
  }

  function handleDialogClick(event) {
    const removeButton = event.target.closest("[data-file-remove]");
    if (removeButton) {
      const fileId = removeButton.dataset.fileRemove || "";
      setSelectedImages(getSelectedImages().filter((file) => getImageFingerprint(file) !== fileId));
      renderSelectedImages();
      setFieldError("images", validateImages(getSelectedImages()));
      clearSuccessState();
      return;
    }

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
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
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

  fields.images.addEventListener("change", () => {
    commitImages(Array.from(fields.images.files || []));
  });

  if (uploadZone) {
    ["dragenter", "dragover"].forEach((eventName) => {
      uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.add("is-dragover");
      });
    });

    ["dragleave", "dragend", "drop"].forEach((eventName) => {
      uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        if (eventName === "dragleave" && uploadZone.contains(event.relatedTarget)) return;
        uploadZone.classList.remove("is-dragover");
      });
    });

    uploadZone.addEventListener("drop", (event) => {
      const droppedFiles = Array.from(event.dataTransfer?.files || []);
      if (!droppedFiles.length) return;
      commitImages(droppedFiles);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
      return;
    }
    trapFocus(event);
  });

  document.addEventListener("portfolio:translations-updated", (event) => {
    translations = event.detail?.translations || {};
    refreshDynamicText();
  });

  updateCounter("idea");
  updateCounter("reason");
  updateCounter("contact");
  renderSelectedImages();
  updateCatCards();
  updateScaleCards();
  refreshDynamicText();
})();
