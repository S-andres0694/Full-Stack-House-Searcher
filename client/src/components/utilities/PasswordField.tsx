import { FormState, UseFormRegister } from 'react-hook-form';
import { Field } from '../ui/field';
import { PasswordInput } from '../ui/password-input';
import { FunctionComponent } from 'react';

type PasswordFieldProps = {
	errors: FormState<any>['errors'];
	register: UseFormRegister<any>;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	required: boolean;
	requiredLabel: boolean;
};

/**
 * A password input field with a label, error message, and validation
 * @param errors - The errors object from react-hook-form
 * @param register - The register function from react-hook-form
 * @returns A password input field with a label, error message, and validation
 */

export const PasswordField: FunctionComponent<PasswordFieldProps> = ({
	errors,
	register,
	onChange,
	required,
	requiredLabel,
}: PasswordFieldProps) => {
	return (
		<Field
			label="Password"
			invalid={!!errors.password}
			errorText={errors.password?.message?.toString()}
			colorPalette="accent"
			required={requiredLabel}
		>
			<PasswordInput
				autoComplete="on"
				required={required}
				placeholder="Enter your password"
				variant="subtle"
				{...register('password', {
					required: 'Password is required',
				})}
				onChange={onChange}
				className={`px-4 ${
					!errors.password
						? 'focus:border border-black dark:border-white'
						: 'border border-red-500'
				} rounded-full`}
			/>
		</Field>
	);
};
