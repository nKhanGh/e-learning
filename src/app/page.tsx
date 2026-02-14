import { redirect } from "next/navigation";

const defaultPage = () => {
  redirect('/en');
}

export default defaultPage;