import { redirect } from "next/navigation";

const NotFound = () => {
  redirect("/en/errors/404");
};

export default NotFound;

