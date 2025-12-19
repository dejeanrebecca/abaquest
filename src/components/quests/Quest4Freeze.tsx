// Quest 4 wrapper - uses existing FreezeAddition screen with Quest framework
import { FreezeAddition } from '../screens/FreezeAddition';

interface Quest4FreezeProps {
  onComplete: () => void;
}

export function Quest4Freeze({ onComplete }: Quest4FreezeProps) {
  return <FreezeAddition onNext={(coins) => onComplete()} />;
}
