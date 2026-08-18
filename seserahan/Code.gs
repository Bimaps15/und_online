/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - 2-WAY SYNC ENGINE FOR BUDGET & SESERAHAN
 * Bima & Alviana
 * ==============================================================================
 */

const TARGET_SHEET_ID = 167218541;
const SERVICE_NAME = "budget-nikah";
const DEPLOYMENT_ID = "AKfycby2AP0iagIOiYp4NrBixm0Fg9ZUfjgj2_PtADhqdEtU83Saiw6ddBBsRVDqifR-u_EwdA";

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || "read").toLowerCase();
    const callback = (e && e.parameter && e.parameter.callback) || "";

    switch (action) {
      case "health":
        return handleHealth(callback);
      case "read":
        return handleRead(callback);
      default:
        return respond(callback, {
          ok: false,
          code: "UNKNOWN_ACTION",
          message: "Aksi tidak dikenal: " + action
        });
    }
  } catch (err) {
    const callback = (e && e.parameter && e.parameter.callback) || "";
    return respond(callback, {
      ok: false,
      code: "SERVER_ERROR",
      error: String(err)
    });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Kunci operasi write hingga 10 detik untuk mencegah race condition antar-HP
    lock.waitLock(10000);

    const action = String((e && e.parameter && e.parameter.action) || "save").toLowerCase();
    const payload = parsePayload(e);

    switch (action) {
      case "save":
      case "update":
      case "create":
        return handleSave(payload);
      default:
        return jsonResponse({
          ok: false,
          code: "UNKNOWN_ACTION",
          message: "Aksi POST tidak dikenal: " + action
        });
    }
  } catch (err) {
    return jsonResponse({
      ok: false,
      code: "WRITE_ERROR",
      error: String(err)
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

// -----------------------------------------------------------------------------
// ACTION HANDLERS
// -----------------------------------------------------------------------------

function handleHealth(callback) {
  const ss = getTargetSpreadsheet();
  const sheet = getTargetSheet(ss);
  const rev = getRevision();

  return respond(callback, {
    ok: true,
    service: SERVICE_NAME,
    deployment: DEPLOYMENT_ID,
    spreadsheetId: ss.getId(),
    sheetId: sheet.getSheetId(),
    sheetName: sheet.getName(),
    revision: rev.revision,
    updatedAt: rev.updatedAt,
    serverTime: new Date().toISOString()
  });
}

function handleRead(callback) {
  const ss = getTargetSpreadsheet();
  const sheet = getTargetSheet(ss);
  const rev = getRevision();
  const data = readFromSheet(sheet);

  return respond(callback, {
    ok: true,
    action: "read",
    message: "Data berhasil dimuat",
    revision: rev.revision,
    updatedAt: rev.updatedAt,
    data: data
  });
}

function handleSave(payload) {
  if (!payload) {
    return jsonResponse({
      ok: false,
      code: "INVALID_PAYLOAD",
      message: "Payload tidak boleh kosong"
    });
  }

  // Jika payload adalah single item untuk create
  let items = [];
  if (payload.items && Array.isArray(payload.items)) {
    items = payload.items;
  } else if (payload.name) {
    items = [payload];
  } else {
    return jsonResponse({
      ok: false,
      code: "INVALID_PAYLOAD",
      message: "Payload harus berisi array items atau objek item"
    });
  }

  const ss = getTargetSpreadsheet();
  const sheet = getTargetSheet(ss);
  const values = sheet.getDataRange().getValues();

  let updatedCount = 0;
  const updatedRows = [];
  const createdItems = [];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it || !it.name) continue;

    // Tentukan tipe
    let type = (it._type || "").toLowerCase();
    if (!type) {
      const cat = String(it.category || "").toLowerCase();
      if (cat.includes("catering") || cat.includes("konsumsi")) type = "catering";
      else if (cat.includes("perlengkapan")) type = "perlengkapan";
      else type = "seserahan";
    }

    const isTemp = !it._row || String(it.id || "").startsWith("temp-") || it.id === undefined;

    const isLunas = (it.status === "lunas" || Number(it.paid || 0) >= Number(it.estimated || 0));
    const statusStr = isLunas ? "Sudah" : "Belum";

    if (isTemp) {
      // -------------------------------------------------------------
      // CREATE: Cari baris kosong di area tabel masing-masing
      // -------------------------------------------------------------
      const targetRow = findFirstAvailableRow(sheet, type);

      if (type === "seserahan") {
        sheet.getRange(targetRow, 1).setValue(it.category || "Seserahan");
        sheet.getRange(targetRow, 2).setValue(it.name);
        sheet.getRange(targetRow, 3).setValue(statusStr);
        sheet.getRange(targetRow, 4).setValue(it.estimated || 0);
        sheet.getRange(targetRow, 5).setValue(it.note || "");
        createdItems.push({
          tempId: it.id,
          id: "seserahan-" + targetRow,
          _type: "seserahan",
          _row: targetRow,
          name: it.name
        });
        updatedCount++;
        updatedRows.push(targetRow);
      } else if (type === "catering") {
        sheet.getRange(targetRow, 7).setValue(it.name);
        sheet.getRange(targetRow, 8).setValue(it.note || "");
        sheet.getRange(targetRow, 10).setValue(it.estimated || 0);
        createdItems.push({
          tempId: it.id,
          id: "catering-" + targetRow,
          _type: "catering",
          _row: targetRow,
          name: it.name
        });
        updatedCount++;
        updatedRows.push(targetRow);
      } else if (type === "perlengkapan") {
        sheet.getRange(targetRow, 12).setValue(it.name);
        sheet.getRange(targetRow, 13).setValue(statusStr);
        sheet.getRange(targetRow, 15).setValue(it.estimated || 0);
        createdItems.push({
          tempId: it.id,
          id: "perlengkapan-" + targetRow,
          _type: "perlengkapan",
          _row: targetRow,
          name: it.name
        });
        updatedCount++;
        updatedRows.push(targetRow);
      }
    } else {
      // -------------------------------------------------------------
      // UPDATE: Perbarui baris yang sudah ada
      // -------------------------------------------------------------
      let targetRow = 0;
      if (it._row) {
        targetRow = parseInt(it._row, 10);
      } else if (it.id && String(it.id).indexOf("-") !== -1) {
        const parts = String(it.id).split("-");
        targetRow = parseInt(parts[1], 10);
      }

      // Fallback pencarian baris berdasarkan kesamaan nama
      if (!targetRow || targetRow < 2) {
        for (let r = 1; r < values.length; r++) {
          if (type === "seserahan" && String(values[r][1] || "").trim().toLowerCase() === String(it.name || "").trim().toLowerCase()) {
            targetRow = r + 1;
            break;
          } else if (type === "catering" && String(values[r][6] || "").trim().toLowerCase() === String(it.name || "").trim().toLowerCase()) {
            targetRow = r + 1;
            break;
          } else if (type === "perlengkapan" && String(values[r][11] || "").trim().toLowerCase() === String(it.name || "").trim().toLowerCase()) {
            targetRow = r + 1;
            break;
          }
        }
      }

      if (targetRow && targetRow >= 2 && targetRow <= sheet.getLastRow()) {
        if (type === "seserahan") {
          if (it.name) sheet.getRange(targetRow, 2).setValue(it.name);
          sheet.getRange(targetRow, 3).setValue(statusStr);
          if (it.estimated !== undefined) sheet.getRange(targetRow, 4).setValue(it.estimated);
          if (it.note !== undefined && it.note !== "") sheet.getRange(targetRow, 5).setValue(it.note);
          updatedCount++;
          updatedRows.push(targetRow);
        } else if (type === "catering") {
          if (it.name) sheet.getRange(targetRow, 7).setValue(it.name);
          if (it.note) sheet.getRange(targetRow, 8).setValue(it.note);
          if (it.estimated !== undefined) sheet.getRange(targetRow, 10).setValue(it.estimated);
          updatedCount++;
          updatedRows.push(targetRow);
        } else if (type === "perlengkapan") {
          if (it.name) sheet.getRange(targetRow, 12).setValue(it.name);
          sheet.getRange(targetRow, 13).setValue(statusStr);
          if (it.estimated !== undefined) sheet.getRange(targetRow, 15).setValue(it.estimated);
          updatedCount++;
          updatedRows.push(targetRow);
        }
      }
    }
  }

  // Simpan pengaturan pasangan jika dikirim
  if (payload.couple || payload.targetBudget !== undefined) {
    const props = PropertiesService.getScriptProperties();
    if (payload.couple) {
      props.setProperty("SETTINGS_COUPLE", JSON.stringify(payload.couple));
    }
    if (payload.targetBudget !== undefined) {
      props.setProperty("SETTINGS_TARGET_BUDGET", String(payload.targetBudget));
    }
  }

  // Terapkan penulisan seketika
  SpreadsheetApp.flush();

  if (updatedCount === 0) {
    return jsonResponse({
      ok: false,
      code: "NO_ROWS_UPDATED",
      message: "Tidak ada row yang berhasil diperbarui atau ditambahkan",
      updated: 0
    });
  }

  const revInfo = bumpRevision();
  const freshData = readFromSheet(sheet);

  return jsonResponse({
    ok: true,
    action: "save",
    message: "Data berhasil disimpan ke Google Sheet",
    updated: updatedCount,
    created: createdItems,
    rows: updatedRows,
    revision: revInfo.revision,
    updatedAt: revInfo.updatedAt,
    data: freshData
  });
}

// -----------------------------------------------------------------------------
// HELPER: MENCARI BARIS KOSONG PADA TABEL TERKAIT (JANGAN TIMPA TOTAL)
// -----------------------------------------------------------------------------

function findFirstAvailableRow(sheet, type) {
  const values = sheet.getDataRange().getValues();
  let nameColIndex = 1; // Col B (index 1) for seserahan
  if (type === "catering") nameColIndex = 6; // Col G (index 6)
  if (type === "perlengkapan") nameColIndex = 11; // Col L (index 11)

  let totalRowIndex = -1;
  let lastFilledRow = 1;

  for (let r = 1; r < values.length; r++) {
    const nameVal = String(values[r][nameColIndex] || "").trim().toLowerCase();
    const catVal = String(values[r][0] || "").trim().toLowerCase();

    // Deteksi baris TOTAL
    if (nameVal === "total" || (type === "seserahan" && catVal === "total")) {
      totalRowIndex = r + 1; // 1-based
      break;
    }

    if (nameVal !== "" && nameVal !== "hehe") {
      lastFilledRow = r + 1; // 1-based
    }
  }

  // Jika baris TOTAL berada tepat di bawah baris data terakhir, sisipkan baris baru sebelum TOTAL!
  if (totalRowIndex !== -1 && totalRowIndex <= lastFilledRow + 1) {
    sheet.insertRowBefore(totalRowIndex);
    return totalRowIndex;
  }

  // Jika tidak ada baris TOTAL, gunakan baris persis setelah data terakhir
  return lastFilledRow + 1;
}

// -----------------------------------------------------------------------------
// DATA READING LOGIC
// -----------------------------------------------------------------------------

function readFromSheet(sheet) {
  const values = sheet.getDataRange().getValues();
  const items = [];
  let currentCat = "Seserahan";
  let totalEst = 0;
  let totalPaid = 0;

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const rowNum = r + 1;

    // --- 1. SESERAHAN (Kolom A-E) ---
    const catA = String(row[0] || "").trim();
    if (catA && catA.toLowerCase() !== "total" && catA.toLowerCase() !== "hehe") {
      currentCat = catA;
    }
    const itemB = String(row[1] || "").trim();
    const statusC = String(row[2] || "").trim().toLowerCase();
    const budgetD = Number(String(row[3] || "").replace(/[^0-9]/g, "") || 0);
    const noteE = String(row[4] || "").trim();

    if (itemB && itemB.toLowerCase() !== "total" && itemB.toLowerCase() !== "hehe") {
      const isLunas = (statusC === "sudah" || statusC === "lunas");
      const paid = isLunas ? budgetD : 0;
      items.push({
        id: "seserahan-" + rowNum,
        name: itemB,
        category: currentCat,
        estimated: budgetD,
        paid: paid,
        dueDate: "",
        note: noteE,
        status: isLunas ? "lunas" : "belum",
        _type: "seserahan",
        _row: rowNum
      });
      totalEst += budgetD;
      totalPaid += paid;
    }

    // --- 2. CATERING (Kolom G-J) ---
    const itemG = String(row[6] || "").trim();
    const qtyH = String(row[7] || "").trim();
    const priceI = Number(String(row[8] || "").replace(/[^0-9]/g, "") || 0);
    const totalJ = Number(String(row[9] || "").replace(/[^0-9]/g, "") || 0);

    if (itemG && itemG.toLowerCase() !== "total") {
      let noteCat = qtyH;
      if (priceI > 0) {
        noteCat = noteCat ? (noteCat + " @ Rp" + priceI.toLocaleString("id-ID")) : ("Rp" + priceI.toLocaleString("id-ID"));
      }
      items.push({
        id: "catering-" + rowNum,
        name: itemG,
        category: "Catering",
        estimated: totalJ,
        paid: 0,
        dueDate: "",
        note: noteCat,
        status: "belum",
        _type: "catering",
        _row: rowNum
      });
      totalEst += totalJ;
    }

    // --- 3. PERLENGKAPAN (Kolom L-O) ---
    const itemL = String(row[11] || "").trim();
    const statusM = String(row[12] || "").trim().toLowerCase();
    const priceN = Number(String(row[13] || "").replace(/[^0-9]/g, "") || 0);
    const totalO = Number(String(row[14] || "").replace(/[^0-9]/g, "") || 0);

    if (itemL && itemL.toLowerCase() !== "total") {
      const isLunasP = (statusM === "sudah" || statusM === "lunas");
      const paidP = isLunasP ? totalO : 0;
      const noteP = priceN > 0 ? ("Harga satuan: Rp" + priceN.toLocaleString("id-ID")) : "";
      items.push({
        id: "perlengkapan-" + rowNum,
        name: itemL,
        category: "Perlengkapan Seserahan",
        estimated: totalO,
        paid: paidP,
        dueDate: "",
        note: noteP,
        status: isLunasP ? "lunas" : "belum",
        _type: "perlengkapan",
        _row: rowNum
      });
      totalEst += totalO;
      totalPaid += paidP;
    }
  }

  const props = PropertiesService.getScriptProperties();
  let couple = { bride: "Alviana", groom: "Bima", weddingDate: "2026-12-11" };
  const savedCouple = props.getProperty("SETTINGS_COUPLE");
  if (savedCouple) {
    try { couple = JSON.parse(savedCouple); } catch (e) {}
  }

  let targetBudget = totalEst;
  const savedTarget = props.getProperty("SETTINGS_TARGET_BUDGET");
  if (savedTarget) {
    targetBudget = Number(savedTarget) || totalEst;
  }

  return {
    couple: couple,
    targetBudget: targetBudget,
    items: items
  };
}

// -----------------------------------------------------------------------------
// SPREADSHEET & REVISION HELPERS
// -----------------------------------------------------------------------------

function getTargetSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Spreadsheet tidak dapat diakses secara aktif.");
  }
  return ss;
}

function getTargetSheet(ss) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === TARGET_SHEET_ID) {
      return sheets[i];
    }
  }
  throw new Error("Target Sheet ID " + TARGET_SHEET_ID + " tidak ditemukan pada spreadsheet.");
}

function bumpRevision() {
  const props = PropertiesService.getScriptProperties();
  const currentRev = Number(props.getProperty("REVISION") || 0);
  const nextRev = currentRev + 1;
  const updatedAt = new Date().toISOString();

  props.setProperties({
    "REVISION": String(nextRev),
    "LAST_UPDATED_AT": updatedAt
  });

  return { revision: nextRev, updatedAt: updatedAt };
}

function getRevision() {
  const props = PropertiesService.getScriptProperties();
  let rev = Number(props.getProperty("REVISION") || 0);
  let updatedAt = props.getProperty("LAST_UPDATED_AT");

  if (!updatedAt) {
    updatedAt = new Date().toISOString();
    props.setProperties({
      "REVISION": String(rev),
      "LAST_UPDATED_AT": updatedAt
    });
  }

  return { revision: rev, updatedAt: updatedAt };
}

function parsePayload(e) {
  let payloadStr = "";
  if (e && e.parameter && e.parameter.payload) {
    payloadStr = e.parameter.payload;
  } else if (e && e.postData && e.postData.contents) {
    payloadStr = e.postData.contents;
  }

  if (!payloadStr) return null;
  try {
    return JSON.parse(payloadStr);
  } catch (err) {
    throw new Error("Format JSON payload tidak valid: " + String(err));
  }
}

function respond(callback, obj) {
  if (callback && callback.trim() !== "") {
    return jsonpResponse(callback, obj);
  }
  return jsonResponse(obj);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonpResponse(callback, obj) {
  const safeCallback = callback.replace(/[^a-zA-Z0-9_]/g, "");
  const output = safeCallback + "(" + JSON.stringify(obj) + ");";
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
