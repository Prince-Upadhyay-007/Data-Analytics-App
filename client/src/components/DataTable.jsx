import { useMemo, useState } from "react";
import { Filter, Plus, Search, Trash2, X } from "lucide-react";

const CATEGORIES = ["Sales", "Marketing", "Operations"];
const PAGE_SIZE = 6;

const emptyForm = {
  title: "",
  category: "Sales",
  revenue: "",
  users: "",
  date: new Date().toISOString().slice(0, 10),
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DataTable({
  records = [],
  loading = false,
  onAdd,
  onDelete,
  globalSearch,
}) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [localSearch, setLocalSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const filtered = useMemo(() => {
    const query = (localSearch || globalSearch || "").trim().toLowerCase();
    return records.filter((record) => {
      const matchesCategory =
        categoryFilter === "All" || record.category === categoryFilter;
      const haystack = [
        record.title,
        record.category,
        String(record.revenue),
        String(record.users),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [records, categoryFilter, localSearch, globalSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitRecord(event) {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim() || form.revenue === "" || form.users === "") {
      setFormError("Title, revenue, and users are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        title: form.title.trim(),
        category: form.category,
        revenue: Number(form.revenue),
        users: Number(form.users),
        date: form.date,
      });
      setForm(emptyForm);
      setModalOpen(false);
      setPage(1);
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || "Failed to add record");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeRecord(id) {
    const confirmed = window.confirm("Delete this analytics record?");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      window.alert(error.message || "Failed to delete record");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Operational logs
          </p>
          <h2 className="text-lg font-semibold text-white">Analytics records</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-[220px] flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              value={localSearch}
              onChange={(event) => {
                setLocalSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Filter table..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-2 pl-9 pr-3 text-sm text-white"
            />
          </label>

          <label className="relative">
            <Filter
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              className="appearance-none rounded-xl border border-white/10 bg-slate-950/50 py-2 pl-9 pr-8 text-sm text-white"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Plus size={16} />
            Add New Record
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.14em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Revenue</th>
              <th className="px-4 py-3 font-medium">Users</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Loading records...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No records match the current filters.
                </td>
              </tr>
            ) : (
              pageRows.map((record) => (
                <tr
                  key={record._id}
                  className="border-t border-white/5 text-slate-200 hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-medium text-white">{record.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        record.category === "Sales"
                          ? "bg-cyan-400/10 text-cyan-300"
                          : record.category === "Marketing"
                            ? "bg-violet-400/10 text-violet-300"
                            : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {record.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(record.revenue)}</td>
                  <td className="px-4 py-3">{record.users}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(record.date)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeRecord(record._id)}
                      disabled={deletingId === record._id}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      {deletingId === record._id ? "Deleting" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <p>
          Showing {pageRows.length} of {filtered.length} records
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <form
            onSubmit={submitRecord}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Add new record</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Q3 Software Subscription Sale"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Revenue">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.revenue}
                    onChange={(event) => updateField("revenue", event.target.value)}
                    placeholder="1250.50"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                  />
                </Field>
                <Field label="Users">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.users}
                    onChange={(event) => updateField("users", event.target.value)}
                    placeholder="45"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                  />
                </Field>
              </div>
              <Field label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </Field>
            </div>

            {formError && (
              <p className="mt-4 text-sm text-rose-300">{formError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Create record"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
