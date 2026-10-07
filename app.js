const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadPapers() {
  const r = await fetch("/api/papers");
  if (!r.ok) throw new Error("Could not load papers.");
  return r.json();
}

function fillSelect(sel, values, label) {
  const cur = sel.value;
  sel.innerHTML = `<option value="">${label}</option>` + [...new Set(values)].sort().map((v) => `<option>${esc(v)}</option>`).join("");
  sel.value = cur;
}

async function initBrowse() {
  const list = $("#list");
  let all = [];
  try { all = await loadPapers(); } catch (e) { list.innerHTML = `<p class="empty">${esc(e.message)}</p>`; return; }
  const f = { major: $("#fMajor"), degree: $("#fDegree"), semester: $("#fSem"), q: $("#fQ") };
  const draw = () => {
    const q = f.q.value.toLowerCase();
    const rows = all.filter((p) =>
      (!f.major.value || p.major === f.major.value) &&
      (!f.degree.value || p.degree === f.degree.value) &&
      (!f.semester.value || p.semester === f.semester.value) &&
      (!q || `${p.subject} ${p.title} ${p.year}`.toLowerCase().includes(q)));
    list.innerHTML = rows.length ? rows.map((p) => `
      <div class="item"><div><b>${esc(p.subject)}</b> ${p.year ? "(" + esc(p.year) + ")" : ""}
      <small>${esc(p.major)} · ${esc(p.degree)} · Sem ${esc(p.semester)} · ${esc(p.title)}</small></div>
      <a class="open" href="/api/file/${encodeURIComponent(p.id)}" target="_blank" rel="noopener">Open</a></div>`).join("")
      : `<p class="empty">No papers match yet. <a href="upload.html">Upload the first one.</a></p>`;
  };
  fillSelect(f.major, all.map((p) => p.major), "All majors");
  fillSelect(f.degree, all.map((p) => p.degree), "All degrees");
  fillSelect(f.semester, all.map((p) => p.semester), "All semesters");
  Object.values(f).forEach((el) => el.addEventListener("input", draw));
  draw();
}

function initUpload() {
  const form = $("#upForm"), msg = $("#msg"), btn = form.querySelector("button");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Uploading…"; btn.disabled = true;
    try {
      const r = await fetch("/api/papers", { method: "POST", body: new FormData(form) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Upload failed.");
      msg.textContent = "Uploaded. Students can now find it under Browse papers.";
      form.reset();
    } catch (err) { msg.textContent = err.message; }
    btn.disabled = false;
  });
}

const page = document.body.dataset.page;
if (page === "browse") initBrowse();
if (page === "upload") initUpload();
