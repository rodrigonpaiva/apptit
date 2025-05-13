import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }  ) {
    return (
        <section className="flex flex-col justify-center items-center bg-[#F8F9FA] text-[#343A40]">
            <div className="">
                Logo
            </div>

            <h1>Log in to your account</h1>
            <h2>New here? Create an account</h2>

            <section className="">
                {children}
            </section>
        </section>
    )
}