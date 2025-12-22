// Quest 3 wrapper - uses existing PositionNumbers screen with Quest framework
import { PositionNumbers } from '../screens/PositionNumbers';

interface Quest3PositioningProps {
  onComplete: (results?: { pre: number; post: number }) => void;
}


export function Quest3Positioning({ onComplete }: Quest3PositioningProps) {
  return <PositionNumbers onNext={onComplete} />;
}
