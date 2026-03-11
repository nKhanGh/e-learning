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
      className="group px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
    >
      {t("started")}
      <FontAwesomeIcon
        icon={faArrowRight}
        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
      />
    </button>
  );
};

export default GetStatedButton;
