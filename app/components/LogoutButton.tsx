import { Form, useNavigation } from "@remix-run/react";

export default function LogoutButton() {
  const navigation = useNavigation();
  const loading = navigation.state !== "idle";

  return (
    <Form action="/logout" method="post" className="p-2">
      <button
        type="submit"
        className="bg-orange-300 text-black text-3xl font-bold  flex items-center justify-center gap-2"
        disabled={loading}
      >
        <i className="ri-logout-circle-line"></i>{" "}
        {loading ? "Logging out..." : "Logout"}
      </button>
    </Form>
  );
}
