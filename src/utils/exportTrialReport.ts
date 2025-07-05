import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { RequestFormM } from 'src/types/requestForm'

function toDateOrDash(value?: any): Date | string {
  if (value && typeof value.toDate === 'function') return value.toDate()
  return '-'
}


export async function exportTrialReport(request: RequestFormM) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Trial Report')

  // Set column widths
  sheet.columns = [
    { width: 4 },  // No.
    { width: 30 },  // Jenis Instrument / Reagent
    { width: 15 },  // Kualitas
    { width: 20 },  // Tampilan Produk
    { width: 25 },  // Harga
    { width: 20 },  // Lainnya
    { width: 20 },  // Kesimpulan
  ]

  // Merge cells
  sheet.mergeCells('A1:B4')
  sheet.mergeCells('C1:G1')
  sheet.mergeCells('C2:G2')
  sheet.mergeCells('C3:D3')
  sheet.mergeCells('C4:D4')

  sheet.mergeCells('A5:B5')
  sheet.mergeCells('A6:B6')
  sheet.mergeCells('A7:B7')
  sheet.mergeCells('A8:B8')
  sheet.mergeCells('A9:B9')
  sheet.mergeCells('A10:B10')
  sheet.mergeCells('A12:B12')
  sheet.mergeCells('A13:B13')
  sheet.mergeCells('A14:B14')
  sheet.mergeCells('A15:B15')
  sheet.mergeCells('A16:B16')
  sheet.mergeCells('A17:B17')

  sheet.mergeCells('A18:G18')

  sheet.mergeCells('C5:D5')
  sheet.mergeCells('C6:D6')
  sheet.mergeCells('C7:D7')
  sheet.mergeCells('C8:D8')
  sheet.mergeCells('C9:D9')
  sheet.mergeCells('C10:D10')

  sheet.mergeCells('F12:G12')
  sheet.mergeCells('F13:G17')

  // Set row heights
  const headerRows: number[] = [1, 2, 3, 4]
  headerRows.forEach(i => sheet.getRow(i).height = 20)
  sheet.getRow(5).height = 10
  const infoRows: number[] = [6, 7, 8, 10]
  infoRows.forEach(i => sheet.getRow(i).height = 26)

  // Add logo
  try {
    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/e-recruitment-59a9b.appspot.com/o/logo.png?alt=media&token=0304d2e2-f0ca-4dfb-9798-17ae4c7f8c0a'
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
    const response = await fetch(proxyUrl)
    const imageBuffer = await response.arrayBuffer()

    const imageId = workbook.addImage({ buffer: imageBuffer, extension: 'png' })

    sheet.addImage(imageId, {
      tl: { col: 0.99999, row: 0.15 },  // geser ke kanan & agak turun dikit biar tengah cell
      ext: { width: 235, height: 100 },
    })
    
  } catch (err) {
    console.warn('Failed to load image:', err)
  }

  // === HEADER ===
  const setCell = (cell: string, value: ExcelJS.CellValue, bold = false, size = 10, align: 'left' | 'center' = 'left') => {
    sheet.getCell(cell).value = value
    sheet.getCell(cell).font = { bold, size }
    sheet.getCell(cell).alignment = { vertical: 'middle', horizontal: align }
  }

  setCell('C1', 'PT SETIA ANUGRAH MEDIKA', true, 16, 'center')
  setCell('C2', 'Permintaan Instalasi/Uji Fungsi Alat', true, 14, 'center')
  setCell('C3', 'Nomor Dokumen', false, 10, 'center')
  setCell('E3', 'Tanggal', false, 10, 'center')
  setCell('F3', 'Nomor Revisi', false, 10, 'center')
  setCell('G3', 'Halaman', false, 10, 'center')

  setCell('C4', request.noDokumen || '', true, 9, 'center')
  const cellE4 = sheet.getCell('E4')
  cellE4.value = toDateOrDash(request.tanggal)
  if (cellE4.value instanceof Date) cellE4.numFmt = 'dd/mm/yyyy'
  cellE4.font = { bold: true, size: 9 }
  cellE4.alignment = { vertical: 'middle', horizontal: 'center' }

  setCell('F4', request.noRevisi || '', true, 9, 'center')
  setCell('G4', '1', true, 9, 'center')

  // === INFORMASI RS ===
  setCell('A6', 'Nama RS/Lab')
  setCell('C6', `  ${request.namaRS || '-'}`, true, 9)

  setCell('F6', 'Tgl Pengajuan Form')
  const cellG6 = sheet.getCell('G6')
  cellG6.value = toDateOrDash(request.tanggalPengajuan)
  if (cellG6.value instanceof Date) cellG6.numFmt = 'dd/mm/yyyy'
  cellG6.font = { bold: true, size: 9 }
  cellG6.alignment = { vertical: 'middle', horizontal: 'left' }

  setCell('A7', 'Alamat')
  setCell('C7', `  ${request.alamat || '-'}`, true, 9)
  setCell('F7', 'Alat')
  setCell('G7', `  ${request.alat || '-'}`, true, 9)

  setCell('A8', 'No Telepon')
  setCell('C8', `  ${request.noTelepon || '-'}`, true, 9)
  setCell('F8', 'Merk')
  setCell('G8', `  ${request.merk || '-'}`, true, 9)

  setCell('A9', 'Kepala Laboratorium')
  setCell('C9', `  ${request.namaKepalaLab || '-'}`, true, 9)
  setCell('F9', 'Serial Number')
  setCell('G9', `  ${request.serialNumber || '-'}`, true, 9)

  setCell('A10', 'Penanggung Jawab Alat')
  setCell('C10', `  ${request.penanggungJawabAlat || '-'}`, true, 9)
  setCell('F10', 'No. SPK/Invoice')
  setCell('G10', `  ${request.noInvoice || '-'}`, true, 9)

  // === PIC ===
  setCell('A12', 'Business Representative Person')
  setCell('C12', `  ${request.businessRepresentivePerson || '-'}`, true, 9)
  setCell('F12', 'Pra Instalasi (diisi bila diperlukan)', true, 10, 'left')
  setCell('F13', `  ${request.praInstalasi || '-'}`, true, 9)

  setCell('A13', 'Technical Support')
  setCell('C13', `  ${request.technicalSupport || '-'}`, true, 9)

  setCell('A14', 'Field Service Engineer')
  setCell('C14', `  ${request.fieldServiceEngineer || '-'}`, true, 9)

  setCell('A15', 'Tanggal Permintaan Pemasangan')
  const c15 = sheet.getCell('C15')
  c15.value = toDateOrDash(request.tanggalPermintaanPemasangan)
  if (c15.value instanceof Date) c15.numFmt = 'dd/mm/yyyy'
  c15.font = { bold: true, size: 9 }
  c15.alignment = { vertical: 'middle', horizontal: 'left' }

  setCell('A16', 'Tanggal Pemasangan')
  const c16 = sheet.getCell('C16')
  c16.value = toDateOrDash(request.tanggalPemasangan)
  if (c16.value instanceof Date) c16.numFmt = 'dd/mm/yyyy'
  c16.font = { bold: true, size: 9 }
  c16.alignment = { vertical: 'middle', horizontal: 'left' }

  setCell('A17', 'Tanggal Training')
  const c17 = sheet.getCell('C17')
  c17.value = toDateOrDash(request.tanggalTraining)
  if (c17.value instanceof Date) c17.numFmt = 'dd/mm/yyyy'
  c17.font = { bold: true, size: 9 }
  c17.alignment = { vertical: 'middle', horizontal: 'left' }

  sheet.getCell('A19').value = 'Wajib diisi Business Representative : (Reagen & Accessories yang dibutuhkan serta STATUS (SOLD/SAMPEL)'
  sheet.getCell('A19').font = { bold: true, size: 10 }
  sheet.getCell('A19').alignment = { vertical: 'middle', horizontal: 'left' }
    // === LIST ITEM (A19 dan ke bawah) ===
    const itemStartRow = 21

    sheet.mergeCells(`A${itemStartRow-1}:D${itemStartRow-1}`)
    sheet.mergeCells(`F${itemStartRow-1}:G${itemStartRow-1}`)
    // Header Tabel
    sheet.getCell(`A${itemStartRow - 1}`).value = 'Nama Barang'
    sheet.getCell(`E${itemStartRow - 1}`).value = 'Jumlah'
    sheet.getCell(`F${itemStartRow - 1}`).value = 'Status'
  
    ;['A', 'E', 'F'].forEach((col) => {
      const cell = sheet.getCell(`${col}${itemStartRow - 1}`)
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }, // Kuning terang
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })

    for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
      const cell = sheet.getCell(`${col}${itemStartRow - 1}`)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    }
    // Data Rows
    request.items?.forEach((item, index) => {
      const rowIndex = itemStartRow + index
    
      sheet.mergeCells(`A${rowIndex}:D${rowIndex}`)
      sheet.mergeCells(`F${rowIndex}:G${rowIndex}`)
    
      // Nama Barang → rata kiri
      const cellName = sheet.getCell(`A${rowIndex}`)
      cellName.value = item.namaItem
      cellName.alignment = { vertical: 'middle', horizontal: 'left' }
    
      // Jumlah → rata tengah
      const cellQty = sheet.getCell(`E${rowIndex}`)
      cellQty.value = `${item.jumlah} ${item.satuan}`
      cellQty.alignment = { vertical: 'middle', horizontal: 'center' }
    
      // Status → rata tengah
      const cellStatus = sheet.getCell(`F${rowIndex}`)
      cellStatus.value = item.status
      cellStatus.alignment = { vertical: 'middle', horizontal: 'center' }
    
      // Styling semua cell A–G (border & fill)
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
        const cell = sheet.getCell(`${col}${rowIndex}`)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      }
    })
    

          // === ACCESSORIES SECTION ===
     const accessoriesStartRow = itemStartRow + (request.items?.length || 0) + 1

     if (request.accesories && request.accesories.length > 0) {
       sheet.mergeCells(`A${accessoriesStartRow-1}:G${accessoriesStartRow-1}`)
       // Header Tabel
       sheet.getCell(`A${accessoriesStartRow - 1}`).value = 'Accessories'
     
       ;['A'].forEach((col) => {
         const cell = sheet.getCell(`${col}${accessoriesStartRow - 1}`)
         cell.font = { bold: true }
         cell.fill = {
           type: 'pattern',
           pattern: 'solid',
           fgColor: { argb: 'FFD3D3D3' }, // Kuning terang
         }
         cell.alignment = { vertical: 'middle', horizontal: 'left' }
         cell.border = {
           top: { style: 'thin' },
           left: { style: 'thin' },
           bottom: { style: 'thin' },
           right: { style: 'thin' },
         }
       })
   
       for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
         const cell = sheet.getCell(`${col}${accessoriesStartRow - 1}`)
         cell.border = {
           top: { style: 'thin' },
           left: { style: 'thin' },
           bottom: { style: 'thin' },
           right: { style: 'thin' },
         }
       }
       // Data Rows
       request.accesories?.forEach((item, index) => {
         const rowIndex = accessoriesStartRow + index
       
         sheet.mergeCells(`A${rowIndex}:D${rowIndex}`)
         sheet.mergeCells(`F${rowIndex}:G${rowIndex}`)
       
         // Nama Barang → rata kiri
         const cellName = sheet.getCell(`A${rowIndex}`)
         cellName.value = item.namaItem
         cellName.alignment = { vertical: 'middle', horizontal: 'left' }
       
         // Jumlah → rata tengah
         const cellQty = sheet.getCell(`E${rowIndex}`)
         cellQty.value = `${item.jumlah} ${item.satuan}`
         cellQty.alignment = { vertical: 'middle', horizontal: 'center' }
       
         // Status → rata tengah
         const cellStatus = sheet.getCell(`F${rowIndex}`)
         cellStatus.value = item.status
         cellStatus.alignment = { vertical: 'middle', horizontal: 'center' }
       
         // Styling semua cell A–G (border & fill)
         for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
           const cell = sheet.getCell(`${col}${rowIndex}`)
           cell.fill = {
             type: 'pattern',
             pattern: 'solid',
           }
           cell.border = {
             top: { style: 'thin' },
             left: { style: 'thin' },
             bottom: { style: 'thin' },
             right: { style: 'thin' },
           }
         }
       })
     }
     
  const uniqueApprovalsMap = new Map<string, RequestFormM['approvals'][number]>()

  request.approvals?.forEach((approval) => {
    if (
      approval.status === 'APPROVED' &&
      approval.nama &&
      approval.signature // pastikan signature tidak kosong
    ) {
      const existing = uniqueApprovalsMap.get(approval.nama)

      const currentDate =
        typeof approval.tanggal?.toDate === 'function'
          ? approval.tanggal.toDate()
          : new Date(0)

      const existingDate =
        existing && typeof existing.tanggal?.toDate === 'function'
          ? existing.tanggal.toDate()
          : new Date(0)

      // Simpan yang tanggalnya lebih baru
      if (!existing || currentDate > existingDate) {
        uniqueApprovalsMap.set(approval.nama, approval)
      }
    }
  })


// 2. Sort berdasarkan tanggal
const approvals = Array.from(uniqueApprovalsMap.values()).sort((a, b) => {
  const dateA = typeof a.tanggal?.toDate === 'function' ? a.tanggal.toDate() : new Date(0)
  const dateB = typeof b.tanggal?.toDate === 'function' ? b.tanggal.toDate() : new Date(0)
  return dateA.getTime() - dateB.getTime()
})

// 3. Render ke worksheet
const approvalSectionStartRow = accessoriesStartRow + (request.accesories?.length || 0) + 3
const maxApprovalSlots = 5
const maxColIndex = 7 // Kolom G (0-based index)

if (approvals.length === 0) {
  sheet.mergeCells(`A${approvalSectionStartRow}:G${approvalSectionStartRow}`)
  sheet.getCell(`A${approvalSectionStartRow}`).value = 'Belum ada approval yang disetujui'
  sheet.getCell(`A${approvalSectionStartRow}`).font = { italic: true }
} else {
  for (let i = 0; i < approvals.length && i < maxApprovalSlots; i++) {
    const approval = approvals[i]
    
    const offset = approvals.length - 1 - i
    const excelCol = maxColIndex - offset           // Kolom tempat teks (1-based for Excel)
    const imageCol = excelCol - 1                   // Kolom tempat gambar (0-based for ExcelJS)
    
    // === 1. Header "Disetujui Oleh"
    const headerCell = sheet.getCell(approvalSectionStartRow, excelCol)
    headerCell.value = 'Disetujui Oleh'
    headerCell.font = { bold: true }
    headerCell.alignment = { vertical: 'middle', horizontal: 'center' }

    // === 2. Signature Image
    const sigRow = approvalSectionStartRow + 1
    sheet.getRow(sigRow).height = 40 // Ensure enough height

    if (approval.signature) {
      try {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(approval.signature)}`
        const response = await fetch(proxyUrl)
        if (!response.ok) throw new Error('Gagal fetch image')

        const buffer = await response.arrayBuffer()
        const imageId = workbook.addImage({ buffer, extension: 'png' })

        sheet.getColumn(excelCol).width = 20

        sheet.addImage(imageId, {
          tl: { col: imageCol + 0.95, row: sigRow - 1 + 0.15 }, // geser ke tengah cell
          ext: { width: 100, height: 40 },
          editAs: 'oneCell',
        })
      } catch (err) {
        console.warn(`Gagal load signature untuk: ${approval.nama}`, err)
        sheet.getCell(sigRow, excelCol).value = '(TTD gagal)'
      }
    } else {
      sheet.getCell(sigRow, excelCol).value = '-'
    }

    const nameRow = sigRow + 1
    sheet.getRow(nameRow).height = 20 // Tambah tinggi baris
    const nameCell = sheet.getCell(nameRow, excelCol)
    nameCell.value = `(${approval.nama})` || '(....)'
    nameCell.alignment = { vertical: 'middle', horizontal: 'center' }
    nameCell.font = { size: 10 }
  }
}
  const approvalRowsUsed = approvals.length > 0 ? 3 : 1 // baris header + tanda tangan + nama
  const noteStartRow = approvalSectionStartRow + approvalRowsUsed + 1

  sheet.mergeCells(`A${noteStartRow}:G${noteStartRow}`)
  sheet.mergeCells(`A${noteStartRow + 1}:G${noteStartRow + 1}`)
  sheet.mergeCells(`A${noteStartRow + 2}:G${noteStartRow + 2}`)
  sheet.mergeCells(`A${noteStartRow + 3}:G${noteStartRow + 3}`)

  setCell(`A${noteStartRow}`, 'Note :', true, 10, 'left')
  setCell(`A${noteStartRow + 1}`, '- Tanpa Form ini, kelengkapan untuk Instalasi tidak dapat dikeluarkan oleh ADMIN', true, 10, 'left')
  setCell(`A${noteStartRow + 2}`, '- Form ini diajukan minimal 1 minggu sebelum tanggal permintaan Instalasi / Uji Fungsi Alat', true, 10, 'left')
  setCell(`A${noteStartRow + 3}`, '- Form ini tidak memerlukan tandatangan basah, dan SAH dengan persetujuan (OK) melalui Email', true, 10, 'left')

  // === SIMPAN FILE ===
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `Trial_Report_${request.noDokumen || 'export'}.xlsx`)
}
