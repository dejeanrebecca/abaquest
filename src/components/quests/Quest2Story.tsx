import { StorySceneViewer, StorySceneData } from '../common/StorySceneViewer';
import beadsLearningImg from '@/docs/Beads_Learning.png';
import beadSlipImg from '@/docs/Bead_Slip.png';
import findingCounterImg from '@/docs/Finding_Counter.png';
import counterFoundImg from '@/docs/Counter_Found.png';
import reachedSchoolImg from '@/docs/Reached_School.png';

interface Quest2StoryProps {
    onComplete: () => void;
}

export function Quest2Story({ onComplete }: Quest2StoryProps) {
    const storyScenes: StorySceneData[] = [
        {
            imageSrc: beadsLearningImg,
            speaker: 'narrator',
            narrationText: "Ameer wakes up happy! Today, Mom and Dad are coming to see what he's learned. He can't wait to show them his Junior Counter!",
            audioKey: "q2_story_1",
        },
        {
            imageSrc: beadSlipImg,
            speaker: 'narrator',
            narrationText: "Ameer and Ameerah eat Breakfast fast. Ameer says I want to get to school early to practice the parts of my junior Counter! The twins hop in their boat. But—oh no! The boat rocks, and the Junior Counter slips from Ameer's hands and falls into the water!",
            audioKey: "q2_story_2",
        },
        {
            imageSrc: findingCounterImg,
            speaker: 'ameerah',
            narrationText: "Ameer's heart beats fast. He feels scared. But Ameerah takes a deep breath and says, 'I'll use the anchor to pull it up! Let's find your junior counter together!'",
            audioKey: "q2_story_3",
        },
        {
            imageSrc: counterFoundImg,
            speaker: 'ameer',
            narrationText: "Got it! Ameer checks to make sure his Junior Counter is safe: 'This is my top bead—the upper bead. These are the lower beads at the bottom. And this is the answer rod!'",
            audioKey: "q2_story_4",
        },
        {
            imageSrc: reachedSchoolImg,
            speaker: 'mistress-creola',
            narrationText: "When they arrive, Mistress Creola waves from the door. 'Sorry, class is closed today! I have to go to the dentist.' Ameer feels a little sad, but also proud. He worked hard and learned so much on the boat! Sometimes our plans change and thats okay!! Learning never stops, even when school is closed!!",
            audioKey: "q2_story_5",
        }
    ];

    return (
        <StorySceneViewer
            scenes={storyScenes}
            onComplete={onComplete}
            title="📖 First-Day Feelings"
        />
    );
}
