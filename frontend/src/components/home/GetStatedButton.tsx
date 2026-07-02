"use client";
import { useOpenAuth } from "@/contexts/OpenAuthContext";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";

const GetStatedButton = () => {
  const { setOpenSignUp } = useOpenAuth();
  const t = useTranslations('HomePage');
  return (
    <button
      onClick={() => setOpenSignUp(true)}
      className="group px-7 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-md transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
    >
      {t("started")}
      <FontAwesomeIcon
        icon={faArrowRight}
        className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
      />
    </button>
  );
};

export default GetStatedButton;
