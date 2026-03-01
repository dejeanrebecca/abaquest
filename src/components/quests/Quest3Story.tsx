import { StorySceneViewer, StorySceneData } from '../common/StorySceneViewer';
import quest3Scene0 from '@/docs/Quest-3_Image1.png';
import quest3Scene1 from '@/docs/Quest-3_Image2.png';
import quest3Scene2 from '@/docs/zero.png';
import quest3Scene2b from '@/docs/One.png';
import quest3Scene2c from '@/docs/five.png';
import quest3Scene3 from '@/docs/Nine.png';
import quest3Scene4 from '@/docs/AfterClass.png';
import quest3Scene5 from '@/docs/Quest-3Bye.png';

interface Quest3StoryProps {
    onComplete: () => void;
}

export function Quest3Story({ onComplete }: Quest3StoryProps) {
    const storyScenes: StorySceneData[] = [
        {
            imageSrc: quest3Scene0,
            speaker: 'narrator',
            narrationText: "Its a new day at the school of Mental Math. Ameer feels nervous and Ameerah is curious about what they will learn",
        },
        {
            imageSrc: quest3Scene1,
            speaker: 'narrator',
            narrationText: "The next day, Mistress Creola starts asking questions. Ameer and Ameerah are too scared to ask for help, so they pretend they are sick!",
        },
        {
            imageSrc: quest3Scene2,
            speaker: 'mistress-creola',
            narrationText: "While the twins are in the nurse's office, Mistress Creola teaches the class. 'Zero means no beads are touching the Answer Rod!' she says.",
        },
        {
            imageSrc: quest3Scene2b,
            speaker: 'mistress-creola',
            narrationText: "Then she shows the next number. 'One means ONE lower bead is touching the Answer Rod!' she adds.",
        },
        {
            imageSrc: quest3Scene2c,
            speaker: 'mistress-creola',
            narrationText: "She continues teaching. 'Five is special! It means ONE upper bead is touching the Answer Rod!' she explains.",
        },
        {
            imageSrc: quest3Scene3,
            speaker: 'narrator',
            narrationText: "Mistress Creola draws a big smile on the board to show 9, because she is so proud! But the twins return feeling ashamed.",
        },
        {
            imageSrc: quest3Scene4,
            speaker: 'narrator',
            narrationText: "After Class when all the other students left, Mistress Creola spoke to Twins: I am very disappointed that you pretended to be sick, Ameer and Ameerah looked at the ground!! Ameerah takes a deep breath. Replies: 'We aren't really sick,' she whispers. 'We just didn't know the answers and wanted to look like good students.'",
        },
        {
            imageSrc: quest3Scene5,
            speaker: 'mistress-creola',
            narrationText: "Mistress Creola kneels down. 'The best students aren't the ones who know everything right away! The best students are the ones who ask questions!' Twins were relieved that their issue was resolved. In future they would never pretend to be sick again!!",
        }
    ];

    return (
        <StorySceneViewer
            scenes={storyScenes}
            onComplete={onComplete}
            title="📖 The Fear of Asking"
        />
    );
}
