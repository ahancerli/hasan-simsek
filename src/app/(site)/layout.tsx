import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSettings } from "@/lib/data";
import { uploadUrl, siteImage } from "@/lib/assets";

const str = (v: unknown) => String(v ?? "");

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const company = str(s?.company_name) || "Hasan Şimşek İnşaat";
  const logo = s?.logo ? uploadUrl("settings_v", s.logo) : siteImage("logo.png");

  return (
    <>
      <a href="#icerik" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[200] focus:rounded focus:bg-brand focus:px-4 focus:py-2">İçeriğe geç</a>
      <Header
        company={company}
        slogan={str(s?.slogan)}
        logo={logo}
        email={str(s?.email)}
        hours={str(s?.working_hours)}
        address={str(s?.address)}
        social={{ facebook: str(s?.facebook), twitter: str(s?.twitter), instagram: str(s?.instagram), linkedin: str(s?.linkedin) }}
      />
      <main id="icerik">{children}</main>
      <Footer
        company={company}
        slogan={str(s?.slogan)}
        footerLogo={s?.footer_logo ? uploadUrl("settings_v", s.footer_logo) : siteImage("hasan-simsek.png")}
        address={str(s?.address)}
        email={str(s?.email)}
        phone={str(s?.phone_1)}
        hours={str(s?.working_hours)}
      />
    </>
  );
}
