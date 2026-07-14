const storageKey = "myBlogEntries";

const initialEntries = [
  {
    id: crypto.randomUUID(),
    title: "محاضرة تعريفية عن مشروع التخرج",
    type: "محاضرة",
    content: "سيتم مناقشة الأفكار الأساسية ومراحل التنفيذ.",
    date: "2026-08-10"
  },
  {
    id: crypto.randomUUID(),
    title: "اجتماع أسبوعي مع الفريق",
    type: "اجتماع",
    content: "مراجعة التقدم ومشاركة المهام الجديدة.",
    date: "2026-07-20"
  }
];

function loadEntries() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(initialEntries));
    return initialEntries;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return initialEntries;
  }
}

function saveEntries(entries) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function renderEvents(entries) {
  const events = entries
    .filter((entry) => entry.type === "اجتماع" || entry.type === "محاضرة")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const container = document.getElementById("eventsList");
  if (!events.length) {
    container.innerHTML = '<div class="empty">لا توجد أحداث قادمة حالياً.</div>';
    return;
  }

  container.innerHTML = events
    .map(
      (entry) => `
        <article class="item">
          <h3>${entry.title}</h3>
          <div class="meta">${entry.type} • ${formatDate(entry.date)}</div>
          <p>${entry.content}</p>
        </article>
      `
    )
    .join("");
}

function renderEntries(entries) {
  const container = document.getElementById("entriesList");
  if (!entries.length) {
    container.innerHTML = '<div class="empty">لم تتم إضافة أي ملاحظات بعد.</div>';
    return;
  }

  container.innerHTML = entries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (entry) => `
        <article class="item">
          <h3>${entry.title}</h3>
          <div class="meta">${entry.type} • ${formatDate(entry.date)}</div>
          <p>${entry.content}</p>
          <div class="item-actions">
            <button type="button" class="action-btn edit" data-action="edit" data-id="${entry.id}">تعديل</button>
            <button type="button" class="action-btn delete" data-action="delete" data-id="${entry.id}">حذف</button>
          </div>
        </article>
      `
    )
    .join("");
}

function resetForm() {
  form.reset();
  document.querySelector('input[name="id"]').value = "";
  document.getElementById("submitBtn").textContent = "حفظ";
  document.getElementById("cancelEditBtn").hidden = true;
}

const form = document.getElementById("entryForm");
const entriesList = document.getElementById("entriesList");
const cancelEditBtn = document.getElementById("cancelEditBtn");
let entries = loadEntries();

renderEvents(entries);
renderEntries(entries);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const editingId = data.get("id");

  if (editingId) {
    entries = entries.map((entry) =>
      entry.id === editingId
        ? {
            ...entry,
            title: data.get("title"),
            type: data.get("type"),
            content: data.get("content"),
            date: data.get("date")
          }
        : entry
    );
  } else {
    const newEntry = {
      id: crypto.randomUUID(),
      title: data.get("title"),
      type: data.get("type"),
      content: data.get("content"),
      date: data.get("date")
    };

    entries = [newEntry, ...entries];
  }

  saveEntries(entries);
  renderEvents(entries);
  renderEntries(entries);
  resetForm();
});

entriesList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  if (button.dataset.action === "delete") {
    entries = entries.filter((entry) => entry.id !== id);
    saveEntries(entries);
    renderEvents(entries);
    renderEntries(entries);
    resetForm();
    return;
  }

  if (button.dataset.action === "edit") {
    const entry = entries.find((item) => item.id === id);
    if (!entry) return;

    form.elements.title.value = entry.title;
    form.elements.type.value = entry.type;
    form.elements.content.value = entry.content;
    form.elements.date.value = entry.date;
    form.elements.id.value = entry.id;
    document.getElementById("submitBtn").textContent = "تحديث";
    cancelEditBtn.hidden = false;
    form.elements.title.focus();
  }
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});
