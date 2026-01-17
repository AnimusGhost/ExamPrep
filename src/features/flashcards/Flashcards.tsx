import { useMemo, useState } from 'react';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import { getQuestionBank } from '../../data/questionBank';
import { correctAnswerLabel } from '../../lib/questions';
import { loadFlashcards, updateFlashcard } from '../../lib/flashcards';
import { useSettings } from '../../lib/settings';
import { useToast } from '../../lib/toast';

const Flashcards = () => {
  const { settings } = useSettings();
  const { push } = useToast();
  const [showBack, setShowBack] = useState(false);
  const [index, setIndex] = useState(0);
  const [schedule, setSchedule] = useState(loadFlashcards());
  const cards = useMemo(() => {
    const bank = getQuestionBank();
    const now = new Date().toISOString();
    return bank.filter((question) => !schedule[question.id] || schedule[question.id].nextDue <= now);
  }, [schedule]);

  const current = cards[index % Math.max(cards.length, 1)];

  const recordConfidence = (confidence: 'low' | 'medium' | 'high') => {
    if (!current) return;
    const next = updateFlashcard(current.id, confidence);
    setSchedule(next);
    setShowBack(false);
    setIndex((prev) => prev + 1);
    if (settings.funMode) push('Flashcard logged. Keep the rhythm.');
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Flashcards</p>
            <h2 className="text-2xl font-semibold text-ink-900">Recall and reinforce</h2>
            <p className="text-sm text-slate-600">Flip cards, rate confidence, and let the scheduler guide you.</p>
          </div>
          <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            Due now: {cards.length}
          </div>
        </div>
      </Panel>

      {current ? (
        <Panel>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Card {index + 1}</p>
            <h3 className="mt-4 text-lg font-semibold text-ink-900">{current.prompt}</h3>
            {showBack && (
              <div className="mt-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Answer: {correctAnswerLabel(current)}</p>
                <p className="mt-2">{current.explanation}</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!showBack ? (
              <Button variant="primary" onClick={() => setShowBack(true)}>
                Reveal answer
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => recordConfidence('low')}>
                  Needs review
                </Button>
                <Button variant="secondary" onClick={() => recordConfidence('medium')}>
                  Almost there
                </Button>
                <Button variant="primary" onClick={() => recordConfidence('high')}>
                  Confident
                </Button>
              </>
            )}
          </div>
        </Panel>
      ) : (
        <Panel>
          <h3 className="text-lg font-semibold text-ink-900">All caught up!</h3>
          <p className="mt-2 text-sm text-slate-500">No cards due now. Check back later or reset your schedule.</p>
          <Button className="mt-4" variant="secondary" onClick={() => setSchedule({})}>
            Reset schedule
          </Button>
        </Panel>
      )}
    </div>
  );
};

export default Flashcards;
