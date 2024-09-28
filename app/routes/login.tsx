import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { BackButton } from "~/components/BackButton";
import { InputElement } from "~/components/InputElement";
import { isLoggedIn, login } from "~/utils/auth.server";
import { validateLoginForm } from "~/utils/formValidation.server";
import { LoginForm } from "~/utils/types.server";

export const loader: LoaderFunction = async ({ request }) => {
  return (await isLoggedIn(request)) ? redirect("/dashboard") : null;
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const formValues = Object.fromEntries(formData);
    const user: LoginForm = {
      email: formValues.email as string,
      password: formValues.password as string,
    };
    const validationErrors = await validateLoginForm(user);
    if (validationErrors) {
      return json({ errors: validationErrors });
    }
    return await login({
      email: formValues.email as string,
      password: formValues.password as string,
    });
  } catch (error) {
    console.error("Unexpected error in action:", error);
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const errorRef = useRef<HTMLParagraphElement>(null);

  console.log(actionData);

  useEffect(() => {
    if (actionData?.error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [actionData?.error]);

  const isSubmitting = navigation.state === "submitting";
  return (
    <div>
      <BackButton />
      <h1>Login</h1>
      <Form method="post" autoComplete="off" className="authForm">
        <fieldset className="formFields" disabled={isSubmitting}>
          <InputElement
            type="email"
            placeholder="Enter Email"
            id="email"
            name="email"
            aria_label="Email"
            errorMessage={actionData?.errors?.email as string}
          />
          <InputElement
            type="password"
            placeholder="Enter Password"
            id="password"
            name="password"
            aria_label="Password"
            errorMessage={actionData?.errors?.password as string}
          />
          <button className="loginBtn authFormBtn">
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </fieldset>
      </Form>
      <div className="authParagraphContainer">
        <p>
          Do not have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
      <p ref={errorRef} className="text-red-800 text-center" tabIndex={-1}>
        {actionData?.error || "\u00A0"}
      </p>
    </div>
  );
}
