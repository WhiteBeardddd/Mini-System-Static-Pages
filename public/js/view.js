(async function () {
  const notFound = document.getElementById('not-found');
  const detailCard = document.getElementById('detail-card');
  const errorBanner = document.getElementById('error');
  const editLink = document.getElementById('edit-link');
  const deleteBtn = document.getElementById('delete-btn');

  function showError(message) {
    errorBanner.textContent = message;
    errorBanner.hidden = false;
  }

  function setText(id, value) {
    document.getElementById(id).textContent = value;
  }

  const id = getIdFromQuery();
  if (!id) {
    notFound.hidden = false;
    return;
  }

  let record;
  try {
    record = await Api.get(id);
  } catch (err) {
    showError(err.message);
    return;
  }

  if (!record) {
    notFound.hidden = false;
    return;
  }

  detailCard.hidden = false;
  setText('record-name', record.name);

  const statusTag = document.getElementById('record-status');
  statusTag.textContent = record.status;
  statusTag.className = statusTagClass(record.status);

  setText('record-assetTag', record.assetTag);
  setText('record-category', record.category);
  setText('record-location', record.location || '—');
  setText('record-notes', record.notes || '—');
  setText('record-createdAt', formatDate(record.createdAt));
  setText('record-updatedAt', formatDate(record.updatedAt));

  editLink.href = `editEquipment.html?id=${encodeURIComponent(record.id)}`;

  deleteBtn.addEventListener('click', async () => {
    const confirmed = confirm(`Delete "${record.name}" (${record.assetTag})? This cannot be undone.`);
    if (!confirmed) return;

    deleteBtn.disabled = true;
    try {
      await Api.remove(record.id);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showError(err.message);
      deleteBtn.disabled = false;
    }
  });
})();
