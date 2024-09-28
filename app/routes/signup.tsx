import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { BackButton } from "~/components/BackButton";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useEffect, useRef } from "react";
import { createUser } from "~/utils/user.server";
import { SignupForm } from "~/utils/types.server";
import { validateSignUpForm } from "~/utils/formValidation.server";
import { InputElement } from "~/components/InputElement";
import { isLoggedIn } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  return (await isLoggedIn(request)) ? redirect("/dashboard") : null;
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const formValues = Object.fromEntries(formData);

    const user: SignupForm = {
      username: formValues.username as string,
      email: formValues.email as string,
      password: formValues.password as string,
      firstName: formValues.firstName as string,
      lastName: formValues.lastName as string,
    };

    const validationErrors = await validateSignUpForm(user);
    if (validationErrors) {
      return json({ errors: validationErrors });
    }

    console.log("Calling createUser function");
    try {
      const result = await createUser(user);
      return json({ user: result }, { status: 200 });
    } catch (createUserError) {
      console.error("Error from createUser:", createUserError);
      return json(
        {
          error:
            createUserError instanceof Error
              ? createUserError.message
              : "Error creating user",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in action:", error);
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};

export default function Signup() {
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
      <h1>Sign Up</h1>
      {actionData?.user ? <p>{actionData.user.username}</p> : <>&nbsp;</>}
      <Form method="post" autoComplete="off" className="authForm">
        <fieldset disabled={isSubmitting} className="formFields">
          {/* Form fields... */}
          <div style={{ width: "100%" }}>
            <InputElement
              type="text"
              placeholder="Enter username"
              id="username"
              name="username"
              aria_label="Username"
              errorMessage={actionData?.errors.username as string}
              required={true}
            />
          </div>
          <InputElement
            type="email"
            placeholder="Enter Email"
            id="email"
            name="email"
            aria_label="Email"
            errorMessage={actionData?.errors.email as string}
            required={true}
          />
          <InputElement
            type="password"
            placeholder="Enter Password"
            id="password"
            name="password"
            aria_label="Password"
            errorMessage={actionData?.errors.password as string}
            required={true}
          />
          <InputElement
            type="text"
            placeholder="Enter your first name"
            id="firstName"
            name="firstName"
            aria_label="First name"
            errorMessage={actionData?.errors.firstName as string}
            required={true}
          />
          <InputElement
            type="text"
            placeholder="Enter your last name"
            id="lastName"
            name="lastName"
            aria_label="Last name"
            errorMessage={actionData?.errors.lastName as string}
            required={true}
          />
          <button
            disabled={isSubmitting}
            className="signupBtn authFormBtn"
            type="submit"
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </fieldset>
      </Form>
      <div className="authParagraphContainer">
        <p>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
      <p ref={errorRef} className="text-red-800 text-center" tabIndex={-1}>
        {actionData?.error || "\u00A0"}
      </p>
    </div>
  );
}
