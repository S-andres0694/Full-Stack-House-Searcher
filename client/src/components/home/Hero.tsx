import { FunctionComponent } from 'react';
import TypewriterAnimatedHeader from '../text/TypewriterHeaders';
import ButtonWithHoverAnimations from '../utilities/ButtonWithHoverAnimations';
import { FaFlask } from 'react-icons/fa6';
import { useSpring } from '@react-spring/web';

/**
 * Hero component
 * @returns Hero component
 */

export const Hero: FunctionComponent<{}> = (): JSX.Element => {
	// TODO: Move them to the house searcher itself.
	return (
		<div className="dark:bg-slate-800 dark:border-b-slate-100 border-b-4 border-b-slate-800 bg-white max-w-[100vw]">
			<div className="flex items-center pl-10 lg:justify-between pr-10 lg:pr-0">
				<div className="py-10 flex flex-col gap-3 max-w-[100%]">
					<h1 className="text-sm uppercase tracking-widest font-ibm-plex-sans font-light dark:text-slate-300 text-slate-600">
						A gateway to the perfect home.
					</h1>
					<TypewriterAnimatedHeader
						className="text-5xl font-light font-ibm-plex-sans"
						text="House Searcher, an optimized home search platform."
						delayPerLetter={15}
						colorAnimationEndIndex={13}
						colorAnimation={['#7E6BFA', '#4CCCFF']}
					/>
					<div className="flex flex-col gap-5">
						<p className="text-lg dark:text-slate-400 text-slate-600 font-ibm-plex-sans mt-6">
							House Searcher is an optimized home search platform that helps you
							find the perfect home for you. It's a platform that helps you find
							the perfect home for you. The platform is designed to help you
							find the perfect home for you.
						</p>
						<ButtonWithHoverAnimations
							text="Search for your house now!"
							className="w-fit py-6 px-8 text-lg mt-4 hover:shadow-lg hover:shadow-slate-700 hover:dark:shadow-white-800"
							type="button"
							onClick={() => {}}
						/>
						<hr className="w-full lg:w-[45%] mt-4 border-slate-700" />
						<div className="flex gap-2 items-start">
							<FaFlask className="text-slate-600 dark:text-slate-400 lg:text-2xl text-6xl" />
							<p className="text-xl dark:text-slate-400 text-slate-600 font-ibm-plex-sans">
								<span className="font-bold">
									*This service is still on development.
								</span>
								We (me the only current dev) are working hard to make it better
								for you.
							</p>
						</div>
					</div>
				</div>
				<div className="hidden lg:flex w-[30%] h-auto">
					<div className="w-[80%] h-auto overflow-hidden rounded-full border-2 border-slate-700 aspect-square flex items-center justify-center bg-slate-100 dark:bg-slate-700">
						<span className="text-2xl font-ibm-plex-sans text-slate-600 dark:text-slate-300">
							Image Placeholder
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
