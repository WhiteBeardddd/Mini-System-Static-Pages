const Api = {
  async list() {
    const res = await fetch('/api/equipment');
    if (!res.ok) throw new Error('Failed to load equipment.');
    return res.json();
  },

  async get(id) {
    const res = await fetch(`/api/equipment/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to load record.');
    return res.json();
  },

  async create(data) {
    return Api._send('/api/equipment', 'POST', data);
  },

  async update(id, data) {
    return Api._send(`/api/equipment/${encodeURIComponent(id)}`, 'PUT', data);
  },

  async remove(id) {
    const res = await fetch(`/api/equipment/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to delete record.');
    }
  },

  async _send(url, method, data) {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || 'Something went wrong.');
    }
    return body;
  },
};

function statusTagClass(status) {
  if (status === 'Available') return 'tag tag-available';
  if (status === 'In use') return 'tag tag-inuse';
  if (status === 'Under repair') return 'tag tag-repair';
  return 'tag';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id');
}
