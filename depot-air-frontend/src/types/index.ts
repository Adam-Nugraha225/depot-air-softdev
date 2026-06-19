// Tambahkan tipe global di sini
export type ApiResponse<T> = {
  data: T;
  message: string;
  status: number;
};
