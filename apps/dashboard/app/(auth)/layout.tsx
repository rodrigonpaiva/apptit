import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }  ) {
    const t =  await getTranslations('AuthPage');
    return (
        <section className="w-full h-screen flex flex-col justify-center items-center bg-gray-light text-gray-strong">
            <div className="mb-16">
                Logo
            </div>

            <h1>{t('greeting')}</h1>

            <h1 className="text-2xl font-bold mb-2">Log in to your account</h1>
            <h2>New here? <Link href="/signup" className="text-navy-blue">Create an account</Link></h2>

            <section className="mt-12">
                {children}
            </section>
        </section>
    )
}