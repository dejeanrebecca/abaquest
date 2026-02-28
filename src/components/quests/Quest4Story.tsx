import { StorySceneViewer, StorySceneData } from '../common/StorySceneViewer';
import quest4Scene1 from '@/docs/Quest-4_Image1.png';
import quest4Scene2 from '@/docs/Quest-4_Image2.png';
import quest4Scene3 from '@/docs/Quest-4_Image3.png';
import quest4Scene4 from '@/docs/Quest-4_Image4.png';
import quest4Scene5 from '@/docs/Quest-4_Image5.png';

interface Quest4StoryProps {
    onComplete: () => void;
}

export function Quest4Story({ onComplete }: Quest4StoryProps) {
    const storyScenes: StorySceneData[] = [
        {
            imageSrc: quest4Scene1,
            speaker: 'narrator',
            narrationText: "It's Funday Friday! Ameerah hops around excitedly, but Ameer is moving as slow as a turtle because he wants to do math, not play.",
        },
        {
            imageSrc: quest4Scene2,
            speaker: 'ameerah',
            narrationText: "On the boat ride to school, Ameerah said Its Friday! Friday! steers the boat too hard. SPLASH! A giant wave soaks them completely. 'Oops! My bad!' Ameerah says.",
        },
        {
            imageSrc: quest4Scene3,
            speaker: 'ameer',
            narrationText: "They arrive at class dripping wet. But Ameer doesn't care. Mistress Creola announces they are learning addition, and Ameer cheers!",
        },
        {
            imageSrc: quest4Scene4,
            speaker: 'mistress-creola',
            narrationText: "Mistress Creola gives them a challenge: 'Go outside and pick zero flowers for me!' The class is very confused. How do you pick zero flowers?",
        },
        {
            imageSrc: quest4Scene5,
            speaker: 'ameerah',
            narrationText: "Ameerah leaves to change into dry clothes, but Ameer stays perfectly still. He refuses to miss a single second of his math lesson!",
        }
    ];

    return (
        <StorySceneViewer
            scenes={storyScenes}
            onComplete={onComplete}
            title="📖 The Big Splash"
        />
    );
}
