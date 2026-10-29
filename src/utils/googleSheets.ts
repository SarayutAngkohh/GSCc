import { Task, CategoryItem } from '../types/task';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Creates a new Google Spreadsheet and exports all tasks to it.
 */
export async function createAndExportToGoogleSheet(
  tasks: Task[],
  categories: CategoryItem[],
  accessToken: string
): Promise<ExportResult> {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Prepare sheet headers and rows
  const headers = [
    'ID',
    'ชื่อเรื่อง / การบ้าน',
    'หมวดหมู่',
    'วันเริ่มต้น',
    'วันสิ้นสุด / กำหนดส่ง',
    'มี Deadline',
    'เวลา',
    'ระดับความสำคัญ',
    'สถานะ',
    'รายละเอียด',
    'เช็คลิสต์ย่อย (Subtasks)',
    'สร้างเมื่อ (ISO)'
  ];

  const rows = tasks.map((t) => {
    const categoryName = categoryMap.get(t.categoryId) || t.categoryId;
    const subtaskSummary = (t.subtasks || [])
      .map((st) => `[${st.completed ? '✓' : ' '}] ${st.title}`)
      .join(' | ');

    return [
      t.id,
      t.title,
      categoryName,
      t.startDate,
      t.endDate,
      t.hasDeadline ? 'มี Deadline' : 'ไม่มี',
      t.time || '-',
      t.priority,
      t.status === 'completed' ? 'ทำเสร็จแล้ว' : t.status === 'in_progress' ? 'กำลังทำ' : 'ยังไม่ได้ทำ',
      t.description || '',
      subtaskSummary,
      t.createdAt
    ];
  });

  // 1. Create a new Spreadsheet using Google Sheets API
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `Genius Society - ตารางงานและกำหนดส่ง (${new Date().toLocaleDateString('th-TH')})`
      },
      sheets: [
        {
          properties: {
            title: 'ตารางงานทั้งหมด',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Google Sheets API error (${createResponse.status}): ${errText}`);
  }

  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // 2. Append rows to the newly created sheet
  const values = [headers, ...rows];
  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/ตารางงานทั้งหมด!A1:L${values.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `ตารางงานทั้งหมด!A1:L${values.length}`,
        majorDimension: 'ROWS',
        values
      })
    }
  );

  if (!updateResponse.ok) {
    const errText = await updateResponse.text();
    throw new Error(`Failed to insert data into Google Sheet (${updateResponse.status}): ${errText}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl
  };
}

/**
 * Imports tasks from an existing Google Spreadsheet ID or URL
 */
export async function importTasksFromGoogleSheet(
  spreadsheetIdOrUrl: string,
  categories: CategoryItem[],
  accessToken: string
): Promise<Task[]> {
  // Extract spreadsheet ID if full URL was provided
  let spreadsheetId = spreadsheetIdOrUrl.trim();
  const urlMatch = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch) {
    spreadsheetId = urlMatch[1];
  }

  // Fetch values from Sheet
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z500`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Sheets fetch failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rows = data.values;
  if (!rows || rows.length < 2) {
    throw new Error('ไม่พบข้อมูลใน Google Sheet หรือตารางว่างเปล่า');
  }

  // Find category match or default
  const categoryNameToId = new Map(categories.map((c) => [c.name, c.id]));
  const defaultCategoryId = categories[0]?.id || 'homework';

  const importedTasks: Task[] = [];
  const nowIso = new Date().toISOString();

  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row[1]) continue; // Title is required

    const title = String(row[1] || 'งานที่นำเข้า').trim();
    const categoryName = String(row[2] || '').trim();
    const categoryId = categoryNameToId.get(categoryName) || defaultCategoryId;
    const startDate = String(row[3] || new Date().toISOString().slice(0, 10)).trim();
    const endDate = String(row[4] || startDate).trim();
    const hasDeadlineStr = String(row[5] || 'มี').trim();
    const hasDeadline = !hasDeadlineStr.includes('ไม่มี');
    const time = String(row[6] || '').trim();
    const priorityRaw = String(row[7] || 'medium').toLowerCase();
    const priority = ['urgent', 'high', 'medium', 'low'].includes(priorityRaw)
      ? (priorityRaw as Task['priority'])
      : 'medium';
    const statusRaw = String(row[8] || '').trim();
    const status = statusRaw.includes('เสร็จ')
      ? 'completed'
      : statusRaw.includes('กำลัง')
      ? 'in_progress'
      : 'todo';
    const description = String(row[9] || '').trim();

    const task: Task = {
      id: `sheet-imp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      description,
      startDate,
      endDate,
      hasDeadline,
      time: time !== '-' ? time : undefined,
      isAllDay: !time || time === '-',
      categoryId,
      priority,
      status,
      subtasks: [],
      attachments: [],
      history: [
        {
          id: `hist-${Date.now()}-${i}`,
          timestamp: nowIso,
          author: 'Google Sheets Import',
          action: 'นำเข้าข้อมูลงานจาก Google Sheets'
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    importedTasks.push(task);
  }

  return importedTasks;
}
