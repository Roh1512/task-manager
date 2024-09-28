import { useEffect, useState } from "react";

type props = {
  type: string;
  placeholder: string;
  id: string;
  name: string;
  aria_label: string;
  errorMessage?: string;
  required?: boolean;
  value?: string;
};

export const InputElement = ({
  type = "text",
  placeholder,
  id,
  name,
  aria_label = "text input element",
  errorMessage = "",
  required = false,
  value,
}: props) => {
  const [errortext, setErrortext] = useState<string>(errorMessage || "");
  const [showError, setShowError] = useState<boolean>(false);
  useEffect(() => {
    setErrortext(errorMessage);
    setShowError(true);
  }, [errorMessage]);
  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        id={id}
        name={name}
        aria-label={errortext ? "Input error" : aria_label}
        aria-describedby={errortext ? "errorText" : ""}
        required={required}
        defaultValue={value}
      />
      <div className="inputErrorContainer">
        {errortext !== ""
          ? showError && (
              <>
                <p className="errortext" id="errortext">
                  {errortext}
                </p>
                <button
                  onClick={() => setShowError(false)}
                  className="closeErrorMessageBtn"
                >
                  <i className="ri-close-circle-fill"></i>
                </button>
              </>
            )
          : null}
      </div>
    </div>
  );
};
