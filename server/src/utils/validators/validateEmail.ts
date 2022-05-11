import { validationResponse } from "./validation";

export const validateEmail = (email: string): validationResponse => {
  if (!email.includes("@")) {
    return {
      isValid: false,
      errors: {
        field: "email",
        message: "Email must include an @",
      },
    };
  }
  return {
    isValid: true,
  };
};

export const isEmail = (string: string) => string.includes("@");
