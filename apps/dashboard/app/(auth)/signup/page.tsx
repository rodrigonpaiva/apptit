import Form from "next/form";
import signUpAction from "./signupAction";
import {Button} from "@repo/ui/components/button";
// import {Input} from "@repo/ui/components/input";

export default async function SignUpPage() {
    return (
        <Form action={signUpAction} className="flex flex-col">
            <input type="name" placeholder="Name" name="name" />
            <input type="email" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />

            <Button type="submit">Sign Up</Button>
            <button type="button">Sign Up with Google</button>
        </Form>
    )
}