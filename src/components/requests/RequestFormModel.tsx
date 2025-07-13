// src/types/requestForm.ts
import { Timestamp } from 'firebase/firestore'

export interface ApprovalM {
  nama: string
  tanggal: Timestamp
  status: string
  isFinalStatus: boolean
  signature: string
  note: string
}

export interface FormItem {
  id: string
  namaItem: string
  jumlah: number
  satuan: string
  status: string
}

export interface RequestFormM {
  id: string
  type: string
  pic: string
  namaRS: string
  divisi: string
  onlineOffline: string
  tanggalPresentasi: Timestamp | null
  createdBy: string
  noDokumen: string
  tanggal: Timestamp | null
  noRevisi: number
  tanggalPengajuan: Timestamp | null
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
  tanggalPermintaanPemasangan: Timestamp | null
  tanggalPemasangan: Timestamp | null
  tanggalTraining: Timestamp | null
  catatan: string
  praInstalasi: string
  dtCreated: Timestamp
  dtUpdated: Timestamp
  items: FormItem[]
  accesories: FormItem[]
  approvals: ApprovalM[]
}
