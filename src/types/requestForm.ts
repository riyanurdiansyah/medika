import { Timestamp } from 'firebase/firestore'

// ItemM equivalent
export interface ItemM {
  id: string
  name: string
  quantity: number
  unit: string
  price?: number
  description?: string
}

// ApprovalM equivalent
export interface ApprovalM {
  nama: string
  tanggal: Timestamp
  status: string
  isFinalStatus: boolean
}

// RequestFormM equivalent - converted from Flutter
export interface RequestFormM {
  id: string
  type: string
  noDokumen: string
  createdBy: string
  tanggal?: Timestamp
  noRevisi: number
  namaLab: string
  tanggalPengajuan?: Timestamp
  alamat: string
  alat: string
  noTelepon: string
  merk: string
  namaKepalaLab: string
  serialNumber: string
  penanggungJawabAlat: string
  noInvoice: string
  businessRepresentivePerson: string
  technicalSupport: string
  fieldServiceEngineer: string
  tanggalPermintaanPemasangan?: Timestamp
  tanggalPemasangan?: Timestamp
  tanggalTraining?: Timestamp
  catatan: string
  praInstalasi: string
  dtCreated: Timestamp
  dtUpdated: Timestamp
  items: ItemM[]
  accesories: ItemM[]
  approvals: ApprovalM[]
  namaRS: string
  divisi: string
  namaBR: string
  tanggalPresentasi?: Timestamp
  onlineOffline: string
  pic: string
}

// Factory function equivalent to Flutter's fromJson
export const createRequestFormMFromJson = (json: any): RequestFormM => {
  return {
    id: json['id'] ?? '',
    type: json['type'] ?? '',
    noDokumen: json['noDokumen'] ?? '',
    createdBy: json['createdBy'] ?? '',
    tanggal: json['tanggal'],
    noRevisi: json['noRevisi'] ?? 0,
    namaLab: json['namaLab'] ?? '',
    tanggalPengajuan: json['tanggalPengajuan'],
    alamat: json['alamat'] ?? '',
    alat: json['alat'] ?? '',
    noTelepon: json['noTelepon'] ?? '',
    merk: json['merk'] ?? '',
    namaKepalaLab: json['namaKepalaLab'] ?? '',
    serialNumber: json['serialNumber'] ?? '',
    penanggungJawabAlat: json['penanggungJawabAlat'] ?? '',
    noInvoice: json['noInvoice'] ?? '',
    businessRepresentivePerson: json['businessRepresentivePerson'] ?? '',
    technicalSupport: json['technicalSupport'] ?? '',
    fieldServiceEngineer: json['fieldServiceEngineer'] ?? '',
    tanggalPermintaanPemasangan: json['tanggalPermintaanPemasangan'],
    tanggalPemasangan: json['tanggalPemasangan'],
    tanggalTraining: json['tanggalTraining'],
    catatan: json['catatan'] ?? '',
    praInstalasi: json['praInstalasi'] ?? '',
    dtCreated: json['dtCreated'],
    dtUpdated: json['dtUpdated'],
    items: (json['items'] as any[])?.map((e: any) => createItemMFromJson(e)) ?? [],
    accesories: (json['accesories'] as any[])?.map((e: any) => createItemMFromJson(e)) ?? [],
    approvals: (json['approvals'] as any[])?.map((e: any) => createApprovalMFromJson(e)) ?? [],
    namaRS: json["namaRS"] ?? "",
    namaBR: json["namaBR"] ?? "",
    divisi: json["divisi"] ?? "",
    onlineOffline: json["onlineOffline"] ?? "",
    tanggalPresentasi: json["tanggalPresentasi"],
    pic: json["pic"] ?? "",
  }
}

// Factory function for ItemM
export const createItemMFromJson = (json: any): ItemM => {
  return {
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    quantity: json['quantity'] ?? 0,
    unit: json['unit'] ?? '',
    price: json['price'],
    description: json['description']
  }
}

// Factory function for ApprovalM
export const createApprovalMFromJson = (json: any): ApprovalM => {
  return {
    nama: json['nama'] ?? '',
    tanggal: json['tanggal'],
    status: json['status'] ?? 'pending',
    isFinalStatus: json['isFinalStatus'] ?? false
  }
}

// toJson equivalent function
export const requestFormMToJson = (requestForm: RequestFormM): any => {
  return {
    'id': requestForm.id,
    'type': requestForm.type,
    'noDokumen': requestForm.noDokumen,
    'createdBy': requestForm.createdBy,
    'tanggal': requestForm.tanggal,
    'noRevisi': requestForm.noRevisi,
    'namaLab': requestForm.namaLab,
    'tanggalPengajuan': requestForm.tanggalPengajuan,
    'alamat': requestForm.alamat,
    'alat': requestForm.alat,
    'noTelepon': requestForm.noTelepon,
    'merk': requestForm.merk,
    'namaKepalaLab': requestForm.namaKepalaLab,
    'serialNumber': requestForm.serialNumber,
    'penanggungJawabAlat': requestForm.penanggungJawabAlat,
    'noInvoice': requestForm.noInvoice,
    'businessRepresentivePerson': requestForm.businessRepresentivePerson,
    'technicalSupport': requestForm.technicalSupport,
    'fieldServiceEngineer': requestForm.fieldServiceEngineer,
    'tanggalPermintaanPemasangan': requestForm.tanggalPermintaanPemasangan,
    'tanggalPemasangan': requestForm.tanggalPemasangan,
    'tanggalTraining': requestForm.tanggalTraining,
    'catatan': requestForm.catatan,
    'praInstalasi': requestForm.praInstalasi,
    'dtCreated': requestForm.dtCreated,
    'dtUpdated': requestForm.dtUpdated,
    'items': requestForm.items.map((e) => itemMToJson(e)),
    'accesories': requestForm.accesories.map((e) => itemMToJson(e)),
    'approvals': requestForm.approvals.map((e) => approvalMToJson(e)),
    'namaRS': requestForm.namaRS,
    'namaBR': requestForm.namaBR,
    'tanggalPresentasi': requestForm.tanggalPresentasi,
    'divisi': requestForm.divisi,
    'onlineOffline': requestForm.onlineOffline,
    'pic': requestForm.pic,
  }
}

// Helper functions for ItemM and ApprovalM
export const itemMToJson = (item: ItemM): any => {
  return {
    'id': item.id,
    'name': item.name,
    'quantity': item.quantity,
    'unit': item.unit,
    'price': item.price,
    'description': item.description
  }
}

export const approvalMToJson = (approval: ApprovalM): any => {
  return {
    'nama': approval.nama,
    'tanggal': approval.tanggal,
    'status': approval.status,
    'isFinalStatus': approval.isFinalStatus
  }
} 