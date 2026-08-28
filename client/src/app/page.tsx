import { headers, cookies } from "next/headers";
import { HomePage } from "@views/home";
import { detectServerLanguage } from "@shared/config/i18n";

const Page = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const initialLang = detectServerLanguage(headerStore, cookieStore);

  return <HomePage initialLang={initialLang} />;
};

export default Page;
