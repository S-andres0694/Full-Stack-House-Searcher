import { FieldErrors, FormState, UseFormRegister } from "react-hook-form";
import { Field } from "../ui/field";
import { PasswordInput } from "../ui/password-input";
import { FunctionComponent } from "react";

type PasswordFieldProps = {
    errors: FormState<any>['errors'],
    register: UseFormRegister<any>,
}

/**
 * A password input field with a label, error message, and validation
 * @param errors - The errors object from react-hook-form
 * @param register - The register function from react-hook-form
 * @returns A password input field with a label, error message, and validation
 */

export const PasswordField: FunctionComponent<PasswordFieldProps>    = ({
    errors,
    register,
}: PasswordFieldProps) => {
    return (
        <Field
            label="Password"
            invalid={!!errors.password}
            errorText={errors.password?.message?.toString()}
            colorPalette="accent"
        >
            <PasswordInput
                placeholder="Enter your password"
                variant="subtle"
                {...register('password', {
                    required: 'Password is required',
                })}
                className={`px-4 ${!errors.password
                        ? 'focus:border border-black dark:border-white'
                        : 'border border-red-500'
                    } rounded-full`}
            />
        </Field>
    );
}