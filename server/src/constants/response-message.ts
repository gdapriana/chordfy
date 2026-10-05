export const RESPONSE_MESSAGE = {
  SUCCESS: {
    DEFAULT: "Request successful",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    QUERY: "Resource queried successfully"
  },

  ERROR: {
    DEFAULT: "Something went wrong",
    BAD_REQUEST: "Bad request",
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Resource already exists",
    INTERNAL_SERVER: "Internal server error"
  },

  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logout successful",
    REGISTER_SUCCESS: "Registration successful",

    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_REQUIRED: "Access token is required",
    INVALID_TOKEN: "Invalid or expired access token",
    REFRESH_TOKEN_REQUIRED: "Refresh token is required",
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token"
  },

  USER: {
    NOT_FOUND: "User not found",
    ALREADY_EXISTS: "User already exists",
    CREATED: "User created successfully",
    UPDATED: "User updated successfully",
    DELETED: "User deleted successfully"
  }
} as const;
