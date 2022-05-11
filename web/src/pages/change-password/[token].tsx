import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import router, { useRouter } from "next/router";
import { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import login from "../login";

import NextLink from "next/link";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const [, changePassword] = useChangePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token,
          });

          if (response.data?.changePassword.errors) {
            const errors = toErrorMap(response.data.changePassword.errors);
            if ("token" in errors) {
              setTokenError(errors.token);
            } else {
              setErrors(errors);
            }
          } else if (response.data?.changePassword.user) {
            await router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name="newPassword"
                placeholder="Your new password"
                label="New Password"
                type="password"
              />
            </Box>
            {tokenError && (
              <>
                <Box mr={2} color="red.500" mt={2}>
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Box mr={2} mt={2}>
                    <Link>Go to forgot password</Link>
                  </Box>
                </NextLink>
              </>
            )}
            <Button mt={4} type="submit" isLoading={isSubmitting}>
              Reset
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
