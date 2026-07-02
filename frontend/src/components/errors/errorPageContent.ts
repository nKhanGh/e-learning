import accessDeniedImage from "@/assets/images/accessDenied.png";
import needAuthImage from "@/assets/images/needAuth.png";
import notFoundImage from "@/assets/images/notFound.png";
import redirectPageImage from "@/assets/images/redirect-page.png";
import type { StaticImageData } from "next/image";

export type ErrorStatusCode = 401 | 403 | 404 | 500;
export type ErrorLocale = "en" | "vi";

type LocalizedCopy = Record<ErrorLocale, string>;

export type ErrorPageContent = {
  statusCode: ErrorStatusCode;
  image: StaticImageData;
  imageAlt: LocalizedCopy;
  title: LocalizedCopy;
  description: LocalizedCopy;
  primaryAction: LocalizedCopy;
  secondaryAction: LocalizedCopy;
};

export const errorPageContent: Record<ErrorStatusCode, ErrorPageContent> = {
  401: {
    statusCode: 401,
    image: needAuthImage,
    imageAlt: {
      en: "Login form illustration",
      vi: "Minh hoa dang nhap",
    },
    title: {
      en: "Login required",
      vi: "Can dang nhap",
    },
    description: {
      en: "Please sign in to continue using this feature.",
      vi: "Vui long dang nhap de tiep tuc su dung tinh nang nay.",
    },
    primaryAction: {
      en: "Sign in",
      vi: "Dang nhap",
    },
    secondaryAction: {
      en: "Back home",
      vi: "Ve trang chu",
    },
  },
  403: {
    statusCode: 403,
    image: accessDeniedImage,
    imageAlt: {
      en: "Access denied illustration",
      vi: "Minh hoa bi tu choi quyen truy cap",
    },
    title: {
      en: "Access denied",
      vi: "Khong co quyen truy cap",
    },
    description: {
      en: "Your account does not have permission to open this area.",
      vi: "Tai khoan cua ban khong co quyen mo khu vuc nay.",
    },
    primaryAction: {
      en: "Back home",
      vi: "Ve trang chu",
    },
    secondaryAction: {
      en: "Go back",
      vi: "Quay lai",
    },
  },
  404: {
    statusCode: 404,
    image: notFoundImage,
    imageAlt: {
      en: "Page not found illustration",
      vi: "Minh hoa khong tim thay trang",
    },
    title: {
      en: "Page not found",
      vi: "Khong tim thay trang",
    },
    description: {
      en: "The page or resource you are looking for is not available.",
      vi: "Trang hoac tai nguyen ban dang tim hien khong ton tai.",
    },
    primaryAction: {
      en: "Back home",
      vi: "Ve trang chu",
    },
    secondaryAction: {
      en: "Go back",
      vi: "Quay lai",
    },
  },
  500: {
    statusCode: 500,
    image: redirectPageImage,
    imageAlt: {
      en: "Rocket launch illustration",
      vi: "Minh hoa ten lua khoi dong",
    },
    title: {
      en: "Something went wrong",
      vi: "He thong dang gap loi",
    },
    description: {
      en: "We could not complete this request. Please try again shortly.",
      vi: "He thong chua the hoan tat yeu cau nay. Vui long thu lai sau.",
    },
    primaryAction: {
      en: "Back home",
      vi: "Ve trang chu",
    },
    secondaryAction: {
      en: "Try again",
      vi: "Thu lai",
    },
  },
};

export const errorStatusCodes = [401, 403, 404, 500] as const;

