export interface iResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface iProduct {
  manufactureCode: string;
  colorCode: string[];
}
