export interface iResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface iProduct {
  manufactureCode: string;
  colorCode: string[];
}
