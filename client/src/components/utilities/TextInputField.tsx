import {
	useForm,
	UseFormRegister,
	FormState,
	UseFormSetError,
	Path,
} from 'react-hook-form';
import { Field } from '../ui/field';
import { Input } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { FieldValues } from 'react-hook-form';

type InputFieldProps<T extends FieldValues> = {
	label: string;
	name: string;
	type: string;
	placeholder: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	regexPattern: RegExp;
	register: UseFormRegister<T>;
	errors: FormState<T>['errors'];
	setError: UseFormSetError<T>;
	required: boolean;
};

/**
 * This component is used to create an input field with a label.
 * @param label - The label of the input field.
 * @param name - The name of the input field.
 * @param type - The type of the input field.
 * @param placeholder - The placeholder of the input field.
 * @param onChange - The onChange event of the input field.
 * @param regexPattern - The regex pattern to validate the input field.
 * @param register - The register function from react-hook-form.
 * @param errors - The errors object from react-hook-form.
 * @param required - Whether the input field is required.
 * @returns A component that creates an input field with a label.
 */

export const InputField: FunctionComponent<InputFieldProps<any>> = <T extends FieldValues>({
	label,
	name,
	type,
	placeholder,
	onChange,
	regexPattern,
	required,
	register,
	errors,
}: InputFieldProps<T>) => {
	return (
		<Field
			label={label}
			invalid={!!errors[name]}
			errorText={errors[name]?.message?.toString()}
			className={'text-black dark:text-white'}
		>
			<Input
				variant="subtle"
				type={type}
				placeholder={placeholder}
				{...register(name as Path<T>, {
					required: required ? `${label} is required` : false,
					pattern: {
						value: regexPattern,
						message: `Invalid ${label.toLowerCase()}`,
					},
					onChange, // Optional chaining to pass onChange if provided
				})}
				className={`px-4 ${
					!errors[name]
						? 'focus:border border-black dark:border-white'
						: 'border border-red-500'
				} rounded-full`}
			/>
		</Field>
	);
};
