import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import login from "./login";

const forgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant="small">
      {complete ? (
        <div>Email has been sent, please check inbox</div>
      ) : (
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values, { setErrors }) => {
            if (!values.email.includes("@")) {
              setErrors({ email: "Must be a valid email" });
            } else {
              setComplete(true);
            }
            const response = await forgotPassword({
              email: values.email,
            });
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Box mt={4}>
                <InputField name="email" placeholder="email" label="Email" />
              </Box>
              <Button mt={4} type="submit" isLoading={isSubmitting}>
                Forgot password
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(forgotPassword);
