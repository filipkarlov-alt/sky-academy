import { describe, it, expect } from 'vitest';
import { TOPICS, isKs2 } from '../../src/curriculum';
import { cardBudgetProblem, promptLines, CARD_TEXT_WIDTH_390, PROMPT_FS_PHONE, PROMPT_FS_SHORT } from './helpers/card-budget';

// Same mulberry32 the other KS2 sweeps use.
function rng(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const DRAWS = 150;

describe('KS2 card budget (#1051): a prompt fits the card on a phone, and a long one is spoken from its own line', () => {
  it('every KS2 registry row draws 150 questions at each difficulty within the budget', () => {
    const ks2 = TOPICS.filter(t => isKs2(t.year));
    expect(ks2.length, 'the sweep must have at least one real KS2 topic').toBeGreaterThan(0);
    for (const t of ks2) {
      for (const d of [1, 2, 3] as const) {
        const r = rng(1051_000 + d);
        for (let i = 0; i < DRAWS; i++) {
          const problem = cardBudgetProblem(t.gen(d, r));
          expect(problem, `${t.id} d${d} draw ${i}`).toBeNull();
        }
      }
    }
  });

  describe('fixtures', () => {
    const three = 'Mia has 348 stickers and gives away 129 of them to her friends at school?';
    const four = 'Mia has 348 stickers and gives away 129 of them to her friends at school today?';

    it('a 3-line prompt passes at both sizes', () => {
      for (const fs of [PROMPT_FS_PHONE, PROMPT_FS_SHORT]) expect(promptLines(three, fs, CARD_TEXT_WIDTH_390)).toBe(3);
      expect(cardBudgetProblem({ prompt: three, say: 'Mia has three hundred and forty-eight stickers…' })).toBeNull();
    });

    it('a 4-line prompt fails, naming the prompt and its line count', () => {
      expect(promptLines(four, PROMPT_FS_PHONE, CARD_TEXT_WIDTH_390)).toBe(4);
      expect(cardBudgetProblem({ prompt: four, say: 'x' })).toMatch(/Mia has 348.*wraps to 4 lines at 28px/);
    });

    it('a 61-character prompt without a `say` fails; with a different one it passes', () => {
      const p61 = '1234 + 5678 + 9101 + 2345 + 6789 + 1011 + 1213 + 1415 = ?'.padEnd(61, '?').slice(0, 61);
      expect(p61).toHaveLength(61);
      expect(cardBudgetProblem({ prompt: p61 })).toMatch(/sets no `say`/);
      expect(cardBudgetProblem({ prompt: p61, say: p61 })).toMatch(/sets no `say`/);
      expect(cardBudgetProblem({ prompt: p61, say: 'a spoken form' })).toBeNull();
    });

    it('a 60-character prompt needs no `say`', () => {
      const p60 = 'Mia has 348 stickers and gives away 129 of them to a friend?';
      expect(p60).toHaveLength(60);
      expect(cardBudgetProblem({ prompt: p60 })).toBeNull();
    });

    it('an unbreakable word wider than the card counts as the lines it takes to break', () => {
      expect(promptLines('W'.repeat(60), PROMPT_FS_PHONE, CARD_TEXT_WIDTH_390)).toBeGreaterThan(3);
    });

    it('throws on a character missing from the advance table rather than counting it as zero width', () => {
      expect(() => promptLines('café', PROMPT_FS_PHONE, CARD_TEXT_WIDTH_390)).toThrow(/no entry for/);
    });
  });
});
