import Form from "next/form";

export default async function SignInPage() {
    return (
        <Form className="flex flex-col">
            <input type="email" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />

            <button type="submit">Sign In</button>
            <button type="button">Sign In with Google</button>
        </Form>
    )
}