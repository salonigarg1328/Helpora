const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const victimKey = (userId) => `helpora:victim-history:${userId}`;
const ngoKey = (userId) => `helpora:ngo-history:${userId}`;

export const getVictimHistory = (userId) => {
  if (!userId) return [];
  return readJson(victimKey(userId));
};

export const upsertVictimHistory = (userId, reportLike) => {
  if (!userId || !reportLike) return;
  const key = victimKey(userId);
  const existing = readJson(key);
  const id = reportLike._id || reportLike.id || `tmp-${Date.now()}`;

  const normalized = {
    _id: id,
    disasterType: reportLike.disasterType || 'unknown',
    description: reportLike.description || '',
    status: reportLike.status || 'pending',
    isSOS: Boolean(reportLike.isSOS),
    neededResources: reportLike.neededResources || [],
    assignedNgoName:
      reportLike.assignedNgoName ||
      reportLike.assignedNgo?.name ||
      reportLike.assignedNgoName ||
      '',
    createdAt: reportLike.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const index = existing.findIndex((item) => String(item._id) === String(id));
  if (index >= 0) {
    existing[index] = { ...existing[index], ...normalized };
  } else {
    existing.unshift(normalized);
  }

  writeJson(key, existing);
};

export const updateVictimHistoryStatus = (userId, reportId, status, assignedNgoName = '') => {
  if (!userId || !reportId) return;
  const key = victimKey(userId);
  const existing = readJson(key);
  const index = existing.findIndex((item) => String(item._id) === String(reportId));
  if (index === -1) return;

  existing[index] = {
    ...existing[index],
    status,
    assignedNgoName: assignedNgoName || existing[index].assignedNgoName,
    updatedAt: new Date().toISOString(),
  };

  writeJson(key, existing);
};

export const getNgoHistory = (userId) => {
  if (!userId) return [];
  return readJson(ngoKey(userId));
};

export const upsertNgoHistory = (userId, reportLike) => {
  if (!userId || !reportLike) return;
  const key = ngoKey(userId);
  const existing = readJson(key);
  const id = reportLike._id || reportLike.id || `tmp-${Date.now()}`;

  const normalized = {
    _id: id,
    victimName: reportLike.victimName || reportLike.victim?.name || 'Unknown victim',
    victimPhone: reportLike.victimPhone || reportLike.victim?.phone || '',
    disasterType: reportLike.disasterType || 'unknown',
    status: reportLike.status || 'accepted',
    neededResources: reportLike.neededResources || [],
    createdAt: reportLike.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const index = existing.findIndex((item) => String(item._id) === String(id));
  if (index >= 0) {
    existing[index] = { ...existing[index], ...normalized };
  } else {
    existing.unshift(normalized);
  }

  writeJson(key, existing);
};

export const updateNgoHistoryStatus = (userId, reportId, status) => {
  if (!userId || !reportId) return;
  const key = ngoKey(userId);
  const existing = readJson(key);
  const index = existing.findIndex((item) => String(item._id) === String(reportId));
  if (index === -1) return;

  existing[index] = {
    ...existing[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  writeJson(key, existing);
};
