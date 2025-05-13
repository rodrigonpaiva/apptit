'use server';

export default async function signUpAction(formData: FormData) {
    const entries = Array.from(formData.entries());
    const data = Object.fromEntries(entries);

    if (!data.name || !data.email || !data.password) {
        throw new Error('name, email and password are required!');
    }
}