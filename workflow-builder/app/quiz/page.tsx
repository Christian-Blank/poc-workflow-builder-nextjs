"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  questions,
  calculateResults,
  type Answers,
  type QuizResult,
} from "./quiz-data";
import styles from "./quiz.module.css";

function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [shuffleSeed] = useState(() => Math.floor(Math.random() * 100000));

  const shuffledQuestions = useMemo(
    () => shuffleArray(questions, shuffleSeed),
    [shuffleSeed]
  );

  const totalQuestions = shuffledQuestions.length;
  const currentQuestion = shuffledQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswer = useCallback(
    (value: number) => {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    },
    [currentQuestion]
  );

  const goNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, totalQuestions]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(() => {
    setResult(calculateResults(answers));
  }, [answers]);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  }, []);

  if (result) {
    return <Results result={result} onRetake={handleRetake} />;
  }

  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Workflow Builder
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Enneagram Quiz</h1>
        <p className={styles.subtitle}>
          Rate how much each statement resonates with you.
          <br />
          Answer honestly — there are no right or wrong answers.
        </p>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={styles.progressText}>
        {answeredCount} of {totalQuestions} answered
      </div>

      <div className={styles.questionCard}>
        <div className={styles.questionNumber}>
          Question {currentIndex + 1} of {totalQuestions}
        </div>
        <p className={styles.questionText}>{currentQuestion.text}</p>

        <div className={styles.scaleContainer}>
          <div className={styles.scaleLabels}>
            <span>Strongly disagree</span>
            <span>Strongly agree</span>
          </div>
          <div className={styles.scaleOptions}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                className={`${styles.scaleOption} ${
                  currentAnswer === value ? styles.scaleOptionSelected : ""
                }`}
                onClick={() => handleAnswer(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.navigation}>
        {currentIndex > 0 ? (
          <button
            className={`${styles.navButton} ${styles.navButtonBack}`}
            onClick={goBack}
          >
            Back
          </button>
        ) : (
          <div className={styles.spacer} />
        )}

        {isLastQuestion ? (
          <button
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            See Results
          </button>
        ) : (
          <button
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={goNext}
            disabled={currentAnswer === undefined}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

function Results({
  result,
  onRetake,
}: {
  result: QuizResult;
  onRetake: () => void;
}) {
  const { primaryType, scores } = result;

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Workflow Builder
      </Link>

      <div className={styles.resultsSection}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Result</h1>
        </div>

        <div
          className={styles.primaryResult}
          style={{
            borderColor: primaryType.color,
            background: `${primaryType.color}0a`,
          }}
        >
          <div
            className={styles.primaryNumber}
            style={{ color: primaryType.color }}
          >
            {primaryType.number}
          </div>
          <div className={styles.primaryName}>{primaryType.name}</div>
          <div className={styles.primaryAlias}>{primaryType.alias}</div>
          <p className={styles.primarySummary}>{primaryType.summary}</p>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <div className={styles.detailTitle}>Strengths</div>
            <ul className={styles.detailList}>
              {primaryType.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.detailTitle}>Challenges</div>
            <ul className={styles.detailList}>
              {primaryType.challenges.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className={`${styles.detailCard} ${styles.growthCard}`}>
            <div className={styles.detailTitle}>Path to Growth</div>
            <p className={styles.growthText}>{primaryType.growth}</p>
          </div>
        </div>

        <div className={styles.scoresSection}>
          <h2 className={styles.scoresTitle}>Full Breakdown</h2>
          {scores.map(({ type, percentage }) => (
            <div key={type.number} className={styles.scoreRow}>
              <div className={styles.scoreLabel}>
                {type.number}. {type.name}
              </div>
              <div className={styles.scoreBarContainer}>
                <div
                  className={styles.scoreBarFill}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: type.color,
                  }}
                />
              </div>
              <div className={styles.scorePercent}>{percentage}%</div>
            </div>
          ))}
        </div>

        <button className={styles.retakeButton} onClick={onRetake}>
          Retake Quiz
        </button>
      </div>
    </div>
  );
}
