export interface User {
  id: string;
  email: string;
  token: string;
  data: {
    name: string;
  };
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
