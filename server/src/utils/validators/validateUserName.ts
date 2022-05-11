import { validationResponse } from "./validation";

export const validateUserName = (username: String): validationResponse => {
  if (username.length > 15 || username.length < 3) {
    return {
      isValid: false,
      errors: {
        field: "username",
        message: "Username must be between 3 and 15 characters",
      },
    };
  }
  if (!username.match(/^[a-zA-Z0-9_]+$/)) {
    return {
      isValid: false,
      errors: {
        field: "username",
        message: "Username can only contain letters, numbers and underscores",
      },
    };
  }
  return {
    isValid: true,
  };
};
