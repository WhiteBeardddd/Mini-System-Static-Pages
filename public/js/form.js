(async function () {
  const mode = document.currentScript.dataset.mode; // 'add' or 'edit'
  const form = document.getElementById('equipment-form');
  const errorBanner = document.getElementById('error');
  const submitBtn = document.getElementById('submit-btn');
  const notFound = document.getElementById('not-found');
  const formCard = document.getElementById('form-card');

  let recordId = null;

  function showError(message) {
    errorBanner.textContent = message;
    errorBanner.hidden = false;
  }

  function clearError() {
    errorBanner.hidden = true;
    errorBanner.textContent = '';
  }

  function fillForm(record) {
    form.assetTag.value = record.assetTag;
    form.name.value = record.name;
    form.category.value = record.category;
    form.location.value = record.location || '';
    form.status.value = record.status;
    form.notes.value = record.notes || '';
  }

  if (mode === 'edit') {
    recordId = getIdFromQuery();
    if (!recordId) {
      formCard.hidden = true;
      notFound.hidden = false;
    } else {
      try {
        const record = await Api.get(recordId);
        if (!record) {
          formCard.hidden = true;
          notFound.hidden = false;
        } else {
          fillForm(record);
        }
      } catch (err) {
        showError(err.message);
      }
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError();

    const data = {
      assetTag: form.assetTag.value,
      name: form.name.value,
      category: form.category.value,
      location: form.location.value,
      status: form.status.value,
      notes: form.notes.value,
    };

    submitBtn.disabled = true;
    try {
      if (mode === 'add') {
        await Api.create(data);
        window.location.href = 'dashboard.html';
      } else {
        const updated = await Api.update(recordId, data);
        window.location.href = `viewEquipment.html?id=${encodeURIComponent(updated.id)}`;
      }
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
    }
  });
})();
