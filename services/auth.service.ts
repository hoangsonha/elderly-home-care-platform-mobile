// auth.service.ts

import axiosInstance from "./axiosInstance";
import { UserService } from "./user.service";

export const AuthService = {
  // Login: kiểm tra email + password
  login: async (email: string, password: string) => {
    const users = await UserService.getAllUsers();

    // Lọc user hợp lệ
    const validUsers = users.filter((u) => u.email && u.password);

    // Tìm user khớp email + password
    const user = validUsers.find(
      (u) => u.email == email && u.password == password
    );
    console.log({ user });
    if (!user) return null; // không tìm thấy

    return user;
  },
  register: async (payload: any) => {
    const response = await axiosInstance.post("/users", payload);
    return response.data;
  },
};
