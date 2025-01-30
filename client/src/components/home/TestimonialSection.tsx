import { FunctionComponent } from 'react';
import TypewriterAnimatedHeader from '../text/TypewriterHeaders';
import { Grid, GridItem } from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';

//TODO: Modify the author, add the image and the quote.

/**
 * TestimonialSection component
 * @returns TestimonialSection component
 */

export const TestimonialSection: FunctionComponent<{}> = (): React.ReactNode => {
    const { ref, inView } = useInView({
        threshold: 0.5,
        triggerOnce: false,
    });

    return (
        <div className="bg-white dark:bg-slate-800 max-w-[100vw] p-8">
            <TypewriterAnimatedHeader
                text="Testimonials"
                delayPerLetter={20}
                className="text-4xl font-bold dark:text-slate-100 text-slate-800"
                centerText={true}
            />
            <Grid
                templateColumns={{
                    base: '1fr',
                    md: 'repeat(5, 1fr)',
                }}
                templateRows={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                }}
                gap={6}
                className="mt-8"
            >
                {/* Image Column */}
                <GridItem colSpan={2}>
                    <div className="w-full h-[300px] bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-slate-400">
                            Image Placeholder
                        </span>
                    </div>
                </GridItem>

                {/* Text Column spanning 2 columns */}
                <GridItem colSpan={3} rowSpan={1}>
                    <div className="flex flex-col gap-4">
                        <TypewriterAnimatedHeader
                            text='"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."'
                            delayPerLetter={20}
                            className="text-4xl italic dark:text-slate-100 text-slate-800"
                            centerText={false}
                        />
                        <h3 ref={ref} className={`text-2xl font-bold dark:text-slate-100 text-slate-800 text-center duration-1000 mx-auto transition-opacity ${inView ? 'opacity-100' : 'opacity-0'}`}>
                            John Doe
                        </h3>
                    </div>
                </GridItem>
            </Grid>
        </div>
    );
};
