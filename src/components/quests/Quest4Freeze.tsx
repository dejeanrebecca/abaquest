// Quest 4 wrapper - uses existing FreezeAddition screen with Quest framework
import { FreezeAddition } from '../screens/FreezeAddition';

interface Quest4FreezeProps {
  onComplete: (results?: { pre: number; post: number }) => void;
}


export function Quest4Freeze({ onComplete }: Quest4FreezeProps) {
  return <FreezeAddition onNext={(coins) => onComplete({ pre: 100, post: 100 })} />;
}

