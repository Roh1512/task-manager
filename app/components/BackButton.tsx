import { useNavigate } from "@remix-run/react";
type props = {
  disabled?: boolean;
};
export function BackButton({ disabled = false }: props) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="backButton"
      disabled={disabled}
    >
      <i className="ri-arrow-left-line"></i>
    </button>
  );
}
