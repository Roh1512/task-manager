import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { InputElement } from "~/components/InputElement";
import LogoutButton from "~/components/LogoutButton";
import {
  deleteAccount,
  getUser,
  isLoggedIn,
  requireUserId,
} from "~/utils/auth.server";
import { validateEditProfileForm } from "~/utils/formValidation.server";
import { editProfileDetails } from "~/utils/user.server";
import type { EditProfileForm } from "~/utils/types.server";
import { PageLoader } from "~/components/PageLoader";
import { DeleteConformation } from "~/components/DeleteConfirmation";
import { formatDistanceToNow } from "date-fns";

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request);
  if (!loggedIn) {
    return redirect("/login");
  }

  try {
    const userDetails = await getUser(request);
    return json(userDetails);
  } catch (error) {
    return json({ error: error }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const { _action, ...formValues } = Object.fromEntries(formData);
    const userId = await requireUserId(request);

    switch (_action) {
      case "update_profile": {
        const user: EditProfileForm = {
          email: formValues.email as string,
          username: formValues.username as string,
          firstName: formValues.firstName as string,
          lastName: formValues.lastName as string,
          password: formValues.password as string,
          newPassword: formValues.newPassword as string,
        };

        const validationErrors = await validateEditProfileForm(user);
        if (validationErrors) {
          return json({ errors: validationErrors });
        }
        const updatedUserInfo = await editProfileDetails(userId, user);

        return json(updatedUserInfo);
      }
      case "delete_profile": {
        const password = formValues.password as string;
        const deletedProfile = await deleteAccount(userId, password, request);
        return deletedProfile;
      }
      default: {
        return redirect("/profile");
      }
    }
  } catch (error) {
    console.error("Unexpected error in edit profile action:", error);
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};

export default function Profile() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [edit, setEdit] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const loadingPage = navigation.state === "loading" && !navigation.formData;
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const loadingSubmitButton =
    navigation.state === "submitting" &&
    navigation.formData?.get("_action") === "update_profile";

  useEffect(() => {
    if (actionData?.user) {
      setEdit(false);
    }
  }, [actionData?.user]);

  return (
    <div className="mainDiv">
      {showDelete && <DeleteConformation setShowDelete={setShowDelete} />}
      {loadingPage ? (
        <PageLoader />
      ) : (
        <>
          <BackButton disabled={edit ? true : false} />
          <div className="flex justify-between items-center flex-col p-2 h-fit">
            <button
              onClick={() => setEdit(!edit)}
              className={`editButton ${
                edit
                  ? "animate-right bg-red-800 text-white animate-pulse "
                  : "animate-left bg-slate-400 text-black"
              }`}
            >
              {edit ? (
                <span>
                  <i className="ri-close-line"></i> Cancel
                </span>
              ) : (
                <span>
                  <i className="ri-file-edit-fill"></i> Edit Profile
                </span>
              )}
            </button>
            {edit === false ? (
              <>
                <div className="w-full flex flex-col items-center justify-center min-h-60  h-full gap-4">
                  <h2 className="text-3xl font-bold">
                    {loaderData?.firstName + " " + loaderData?.lastName}
                  </h2>
                  <p>
                    <strong>Username: </strong>
                    {loaderData?.username}
                  </p>
                  <p>
                    <strong>Email: </strong>
                    {loaderData?.email}
                  </p>
                  <div>
                    <p>
                      <strong>Profile Created</strong>{" "}
                      {formatDistanceToNow(new Date(loaderData?.createdAt))}{" "}
                      ago.
                    </p>
                    <p>
                      <strong>Last updated</strong>{" "}
                      {formatDistanceToNow(new Date(loaderData?.updatedAt))}{" "}
                      ago.
                    </p>
                  </div>
                </div>
                <LogoutButton />
                <button
                  onClick={() => setShowDelete(true)}
                  className="bg-red-800 text-white rounded-3xl"
                >
                  <i className="ri-delete-bin-7-line"></i> Deactivate Profile
                </button>
              </>
            ) : (
              <Form className="editProfileForm" method="post">
                <h2 className="text-3xl text-center font-bold mb-2">
                  Edit Profile
                </h2>
                <fieldset
                  className="editFormFieldset"
                  disabled={loadingSubmitButton}
                >
                  <label htmlFor="username" className="text-lg">
                    Username
                  </label>
                  :
                  <InputElement
                    id="username"
                    name="username"
                    placeholder="Username"
                    type="text"
                    aria_label="username"
                    value={loaderData?.username}
                    errorMessage={actionData?.errors?.username as string}
                  />
                  <label htmlFor="email" className="text-lg">
                    Email
                  </label>
                  :
                  <InputElement
                    id="email"
                    name="email"
                    placeholder="Email"
                    type="email"
                    aria_label="email"
                    value={loaderData?.email}
                    errorMessage={actionData?.errors?.email as string}
                  />
                  <label htmlFor="firstName" className="text-lg">
                    First Name
                  </label>
                  :
                  <InputElement
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                    type="text"
                    aria_label="first name"
                    value={loaderData?.firstName}
                    errorMessage={actionData?.errors?.firstName as string}
                  />
                  <label htmlFor="lastName" className="text-lg">
                    Last Name
                  </label>
                  <InputElement
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    type="text"
                    aria_label="last name"
                    value={loaderData?.lastName}
                    errorMessage={actionData?.errors?.lastName as string}
                  />
                  <label htmlFor="password">Enter your password</label>
                  <InputElement
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your current password to conitinue."
                    required={true}
                    aria_label="Enter your current password"
                    errorMessage={actionData?.errors?.password as string}
                  />
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <label htmlFor="changePassword">
                      Do you want to change the password?
                    </label>
                    <input
                      type="checkbox"
                      defaultChecked={changePassword}
                      onChange={() => {
                        setChangePassword((prevState) => !prevState);
                      }}
                      name="changePassword"
                      className="checkbox"
                    />
                  </div>
                  {changePassword ? (
                    <>
                      <label htmlFor="newPassword">New Password</label>
                      <InputElement
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        placeholder="newPassword"
                        required={true}
                        aria_label="Enter a new password"
                        errorMessage={actionData?.errors?.newPassword}
                      />
                    </>
                  ) : (
                    <>&nbsp;</>
                  )}
                  {actionData?.error ? (
                    <p className="errortextLG">{actionData.error}</p>
                  ) : (
                    <>&nbsp;</>
                  )}
                  <button
                    type="submit"
                    className="bg-blue-800 text-white w-full"
                    name="_action"
                    value="update_profile"
                  >
                    {loadingSubmitButton ? "Saving....." : "Save Changes"}
                  </button>
                </fieldset>
              </Form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
