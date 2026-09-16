(async function () {
  const CATEGORIES = ['Switch', 'Router', 'Firewall', 'Cable', 'Other'];

  const searchInput = document.getElementById('search');
  const statusFilter = document.getElementById('status-filter');
  const tableWrap = document.getElementById('table-wrap');
  const tableBody = document.getElementById('table-body');
  const emptyState = document.getElementById('empty-state');
  const errorBanner = document.getElementById('error');
  const statTotalCount = document.getElementById('stat-total-count');
  const statCategories = document.getElementById('stat-categories');

  let records = [];

  function showError(message) {
    errorBanner.textContent = message;
    errorBanner.hidden = false;
  }

  function renderStats() {
    statTotalCount.textContent = records.length;

    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    for (const r of records) {
      if (counts[r.category] !== undefined) counts[r.category] += 1;
    }

    statCategories.innerHTML = '';
    for (const category of CATEGORIES) {
      const chip = document.createElement('span');
      chip.className = 'stat-chip';

      const label = document.createTextNode(`${category}: `);
      const count = document.createElement('strong');
      count.textContent = counts[category];

      chip.append(label, count);
      statCategories.appendChild(chip);
    }
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    const filtered = records.filter((r) => {
      const matchesQuery =
        !query ||
        r.assetTag.toLowerCase().includes(query) ||
        r.name.toLowerCase().includes(query);
      const matchesStatus = !status || r.status === status;
      return matchesQuery && matchesStatus;
    });

    tableBody.innerHTML = '';

    if (records.length === 0) {
      tableWrap.hidden = true;
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    tableWrap.hidden = false;

    if (filtered.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.textContent = 'No equipment matches your search.';
      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }

    for (const r of filtered) {
      const row = document.createElement('tr');

      const tagCell = document.createElement('td');
      tagCell.textContent = r.assetTag;
      row.appendChild(tagCell);

      const nameCell = document.createElement('td');
      nameCell.textContent = r.name;
      row.appendChild(nameCell);

      const categoryCell = document.createElement('td');
      categoryCell.textContent = r.category;
      row.appendChild(categoryCell);

      const locationCell = document.createElement('td');
      locationCell.textContent = r.location || '—';
      row.appendChild(locationCell);

      const statusCell = document.createElement('td');
      const statusTag = document.createElement('span');
      statusTag.className = statusTagClass(r.status);
      statusTag.textContent = r.status;
      statusCell.appendChild(statusTag);
      row.appendChild(statusCell);

      const actionsCell = document.createElement('td');
      actionsCell.className = 'row-actions';

      const viewLink = document.createElement('a');
      viewLink.className = 'btn btn-small';
      viewLink.href = `viewEquipment.html?id=${encodeURIComponent(r.id)}`;
      viewLink.textContent = 'View';

      const editLink = document.createElement('a');
      editLink.className = 'btn btn-small';
      editLink.href = `editEquipment.html?id=${encodeURIComponent(r.id)}`;
      editLink.textContent = 'Edit';

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-small btn-danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => handleDelete(r));

      actionsCell.append(viewLink, editLink, deleteBtn);
      row.appendChild(actionsCell);

      tableBody.appendChild(row);
    }
  }

  async function handleDelete(record) {
    const confirmed = confirm(`Delete "${record.name}" (${record.assetTag})? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await Api.remove(record.id);
      records = records.filter((r) => r.id !== record.id);
      render();
      renderStats();
    } catch (err) {
      showError(err.message);
    }
  }

  searchInput.addEventListener('input', render);
  statusFilter.addEventListener('change', render);

  try {
    records = await Api.list();
    render();
    renderStats();
  } catch (err) {
    showError(err.message);
  }
})();
