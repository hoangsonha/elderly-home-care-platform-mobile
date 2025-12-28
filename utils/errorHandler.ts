/**
 * Error Handler Utility
 * Xử lý các lỗi từ Backend API và chuyển đổi sang thông báo tiếng Việt
 */

export interface ErrorResponse {
  timestamp?: string;
  status: string | number;
  message: string;
  error?: string | object | Array<{ field: string; message: string }>;
  path?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Chuyển đổi message lỗi từ BE sang tiếng Việt
 */
const translateErrorMessage = (message: string): string => {
  const errorMap: Record<string, string> = {
    // Register errors
    "Account already exists": "Tài khoản đã tồn tại",
    "Invalid role": "Vai trò không hợp lệ",
    "Account registration successful": "Đăng ký thành công",
    
    // Verification errors
    "Account does not exist": "Tài khoản không tồn tại",
    "Account is already verified. No need to resend code": "Tài khoản đã được xác minh. Không cần gửi lại mã",
    "Failed to resend verification code due to email sending error": "Không thể gửi lại mã xác minh do lỗi gửi email",
    "Failed to resend verification code": "Không thể gửi lại mã xác minh",
    "Verification code does not exist. Please request a new code": "Mã xác minh không tồn tại. Vui lòng yêu cầu mã mới",
    "Verification code has expired. Please request a new code": "Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới",
    "Invalid verification code. Please try again": "Mã xác minh không đúng. Vui lòng thử lại",
    "Verification code does not match": "Mã xác minh không khớp",
    "Verification successful": "Xác minh thành công",
    
    // General errors
    "You do not have access": "Bạn không có quyền truy cập",
    "Not found": "Không tìm thấy",
    "Element already exists": "Phần tử đã tồn tại",
    "You do not have permission to access this API": "Bạn không có quyền truy cập API này",
    "Element unchanged": "Phần tử không thay đổi",
    "Resource not found": "Không tìm thấy tài nguyên",
    "Some fields are invalid": "Một số trường không hợp lệ",
    "Cannot convert enum": "Không thể chuyển đổi enum",
    "Object not found": "Không tìm thấy đối tượng",
    "Invalid request": "Yêu cầu không hợp lệ",
    "Validation failed": "Xác thực thất bại",
    "Invalid email": "Email không hợp lệ",
    "Verification code must be 6 characters": "Mã xác minh phải có 6 ký tự",
  };

  // Tìm exact match trước
  if (errorMap[message]) {
    return errorMap[message];
  }

  // Tìm partial match
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return value;
    }
  }

  // Nếu không tìm thấy, trả về message gốc
  return message;
};

/**
 * Xử lý validation errors từ response
 */
const formatValidationErrors = (errors: ValidationError[]): string => {
  if (!errors || errors.length === 0) {
    return "Dữ liệu không hợp lệ";
  }

  const errorMessages = errors.map((err) => {
    const fieldMap: Record<string, string> = {
      email: "Email",
      password: "Mật khẩu",
      verificationCode: "Mã xác minh",
      role: "Vai trò",
    };

    const fieldName = fieldMap[err.field] || err.field;
    const message = translateErrorMessage(err.message);
    return `${fieldName}: ${message}`;
  });

  return errorMessages.join("\n");
};

/**
 * Parse error từ axios response
 */
export const parseApiError = (error: any): string => {
  // Nếu là string, trả về luôn
  if (typeof error === "string") {
    return translateErrorMessage(error);
  }

  // Nếu có response từ axios
  if (error?.response?.data) {
    const data = error.response.data as ErrorResponse;

    // Xử lý validation errors (array)
    if (Array.isArray(data.error)) {
      return formatValidationErrors(data.error as ValidationError[]);
    }

    // Xử lý validation errors (object với errors field)
    if (data.errors && Array.isArray(data.errors)) {
      return formatValidationErrors(data.errors as ValidationError[]);
    }

    // Xử lý message thông thường
    if (data.message) {
      return translateErrorMessage(data.message);
    }

    // Xử lý error field nếu là string
    if (typeof data.error === "string") {
      return translateErrorMessage(data.error);
    }
  }

  // Xử lý message trực tiếp từ error
  if (error?.message) {
    return translateErrorMessage(error.message);
  }

  // Fallback
  return "Đã xảy ra lỗi. Vui lòng thử lại sau";
};

/**
 * Kiểm tra xem response có phải là success không
 */
export const isSuccessResponse = (response: any): boolean => {
  if (!response) return false;
  
  const status = response.status || response.code;
  return status === "Success" || status === "SUCCESS" || status === true;
};

/**
 * Kiểm tra xem response có phải là failed không
 */
export const isFailedResponse = (response: any): boolean => {
  if (!response) return true;
  
  const status = response.status || response.code;
  return status === "Failed" || status === "FAILED" || status === "Fail" || status === false;
};

