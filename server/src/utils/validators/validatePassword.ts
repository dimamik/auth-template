import { validationResponse } from "./validation";

export const validatePassword = (password: string): validationResponse => {
  if (password.length < 2) {
    return {
      isValid: false,
      errors: {
        field: "password",
        message: "Password must be at least 8 characters",
      },
    };
  }
  return {
    isValid: true,
  };
};
