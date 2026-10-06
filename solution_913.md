```typescript
import { trophyFor } from '../game/trophies';
import { parentSummary } from '../game/parents';

function getUnearnedTrophies(topics: any[]): string[] {
    const unearnedTrophies: string[] = [];

    parentSummary(topics).forEach(topic => {
        if (!trophyFor(topic.best, topic.year)) {
            unearnedTrophies.push(topic.id);
        }
    });

    return unearnedTrophies;
}

// Example usage:
// const topics = [{ id: 'number-bonds', best: 0, year: 2023, ... }];
// const unearned = getUnearnedTrophies(topics);
// console.log(unearned);
```