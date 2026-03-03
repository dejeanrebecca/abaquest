import { StorySceneViewer, StorySceneData } from '../common/StorySceneViewer';
import quest4Scene1 from '@/docs/Quest-4_Image1.png';
import quest4Scene2 from '@/docs/Quest-4_Image2.png';
import quest4Scene3 from '@/docs/Quest-4_Image3.png';
import quest4Scene4 from '@/docs/Quest-4_Image4.png';
import quest4Scene6 from '@/docs/Quest-4_Image6.png';
import quest4Scene7 from '@/docs/Quest-4_Image7.png';
import quest4Scene8 from '@/docs/Quest-4_Image8.png';
import quest4Scene9 from '@/docs/Quest-4_Image9.png';
import quest4Scene10 from '@/docs/Quest-4_Image10.png';
import quest4Scene11 from '@/docs/Quest-4_Image11.png';

interface Quest4StoryProps {
    onComplete: () => void;
}

export function Quest4Story({ onComplete }: Quest4StoryProps) {
    const storyScenes: StorySceneData[] = [
        {
            imageSrc: quest4Scene1,
            speaker: 'narrator',
            narrationText: "It’s a new day at schools at Mistress Creola’s School of Mental math!! Ameerah jumped out of bed. Ameer moved slowly. Ameerah ran out back and jumped into the boat. Ameer came slowly. Ameerah started the engine and pulled the anchor up. Ameer climbed onto the boat slowly and sat there sulking.",
        },
        {
            imageSrc: quest4Scene2,
            speaker: 'ameerah',
            narrationText: "“It’s Friday! Funday Friday!” Ameerah steered the boat. She waved at Mama Obama in her Ameer still looked sad, so Ameerah made the boat zig-zag to try and cheer him up. But she zigged and zagged too hard. A huge wave of water whooshed up and soaked them both.",
        },
        {
            imageSrc: quest4Scene3,
            speaker: 'ameer',
            narrationText: "Very good class, Mistress Creola praised them. Ameer huffed. Since you all have done such a great job with your positions today, we will begin adding. Ameer lifted his head, his eyes wide open with excitement. But he couldn’t help saying, Math finally math! in a low whisper voice to Adam. ",
        },
        {
            imageSrc: quest4Scene4,
            speaker: 'mistress-creola',
            narrationText: " First, let’s talk about adding with zero, continued Mistress Creola. Can you really add zero? asked a student. Great question, smiled Mistress Creola. We can’t really add a zero, but we have to know what to do with it. Class, go outside and bring me zero flowers. Everyone looked at each other, feeling very confused.",
        },
        {
            imageSrc: quest4Scene6,
            speaker: 'ameerah',
            narrationText: " Ameerah’s wet clothes were now cold and uncomfortable. So, she raised her hand and asked if she could go see if Nurse Crumpler had dry clothes she could wear. Ameer was also cold and uncomfortable, but he didn’t want to miss a second of the lesson. He’d been waiting so long for math. Two whole weeks!",
        },
        {
            imageSrc: quest4Scene7,
            speaker: 'mistress-creola',
            narrationText: "Mistress Creola explains that to add 0 + 1, we start with zero. “Zero means nothing is moved,” she says gently. “All the beads are resting.” She taps the board lightly. “Now we add one. To add one, we lift one lower bead.” She slowly slides one of the lower beads up on her super smart board. Ameer is amazed and says: “wow!” “Did zero change our number?” she asks. The students shake their heads- no. Ameer shock his head very, very fast. “No,” she smiles. “Zero doesn’t change the number. It just lets us add.” “So zero plus one equals one.” She pauses so the children can move one bead on their own counters. “One bead up. That’s one.” Ameer was shivering, excited. He got the correct answer!",
        },
        {
            imageSrc: quest4Scene8,
            speaker: 'mistress-creola',
            narrationText: "Then, Mistress Creola explained that to add 0 + 3, we still begin with zero. “Zero means we start with nothing,” she reminds them. She points to the lower beads. “To add three, we lift three lower beads. Let’s count together.” “One… two… three.” The beads slide up one at a time. “Did we need the top bead?” she asks. “No,” the students say. Ameer screamed ‘no’ with all his excitement. “That’s right. We only use the lower beads.” “So zero plus three equals three.” She nods proudly. “Three beads up. That’s three.” “I got it right,” screamed Ameer.",
        },
        {
            imageSrc: quest4Scene9,
            speaker: 'mistress-creola',
            narrationText: "Mistress Creola explains that to add 0 + 5, we start with zero again. “Zero means nothing is moved,” she says. Then she lifts the top bead down with care. “This top bead is worth five all by itself.” She looks at the class. “Instead of counting one, two, three, four, five… we can use the five bead.” She smiles. “Zero does not change five.” “So zero plus five equals five.” “One top bead down. That makes five.” The students loved the way the beads floated on her super smart board.",
        },
        {
            imageSrc: quest4Scene10,
            speaker: 'mistress-creola',
            narrationText: "Mistress Creola explains that to add 0 + 9, we build nine step by step. “Zero means we begin with nothing,” she says softly. First, she moves the top bead down. “That’s five.” Then she lifts four lower beads. “Six… seven… eight… nine.” The beads float almost like they are teleporting. She turns back to the class. “Did zero change our number?” “No!” Shouted Ameerah before any of his classmates could answer. Everyone including Mistress Creola turned and looked at him. “That’s right. Zero keeps the number the same. So zero plus nine equals nine. One five bead and four ones. That makes nine.” Mistress Creola looked at Ameer’s junior counter and said, “great job today Ameer!”",
        },
        {
            imageSrc: quest4Scene11,
            speaker: 'mistress-creola',
            narrationText: "“Now, children,” Mistress Creola said gently, “we have reached our final lesson for today.” Ameer leaned forward. He had been waiting for something bigger. “But before we add large numbers,” she continued, “we must understand how small numbers behave.” She turned to Ameer. “Ameer, what happens when we add zero to a number?” Ameer thought for a moment, then smiled. “The number stays the same!” “Excellent,” said Mistress Creola. “So what is zero plus one?” “One,” Ameer answered confidently. “And zero plus three?” “Three!” “And zero plus five?” “Five!” “And zero plus nine?” “Nine!” Mistress Creola nodded proudly. “You see? Zero does not change the number. Zero keeps the number just the way it is.” Ameer sat a little taller in his seat. “You are thinking like true mathematicians,” she said warmly. “And when you understand zero… you are ready for even greater number magic.” “Excellent work today.”",
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
