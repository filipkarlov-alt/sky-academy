```typescript
import { trophyFor, progress } from '../game/trophies';
import { parentSummary } from '../game/parents';

function getUnTrophyedTopics(best, year) {
    return parentSummary(best, year).map(topic => ({
        topic: topic.id,
        hasTrophy: !!trophyFor(topic.best, year)
    })).filter(item => !item.hasTrophy).map(item => item.topic);
}

export { getUnTrophyedTopics };
```