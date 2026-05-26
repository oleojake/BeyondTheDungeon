import { useCallback, useMemo, useState } from "react";

const QUESTIONS = [
  { q: "¿Cuánto es 3 + 7?", a: "10" },
  { q: "¿Cuántos lados tiene un dado d20?", a: "20" },
  { q: "¿Cuánto es 12 - 5?", a: "7" },
  { q: "Escribe 'dragón' al revés", a: "nógard" },
  { q: "¿Cuánto es 5 × 3?", a: "15" },
  { q: "Escribe el número: veinticuatro", a: "24" },
  { q: "¿Cuánto es 100 ÷ 10?", a: "10" },
  { q: "¿Cuántas caras tiene un d6?", a: "6" },
  { q: "¿Cuánto es 8 + 11?", a: "19" },
  { q: "Escribe 'mago' al revés", a: "ogam" },
];

function getRandomQuestion() {
  const idx = Math.floor(Math.random() * QUESTIONS.length);
  return { ...QUESTIONS[idx], index: idx };
}

export function useCaptcha() {
  const [question, setQuestion] = useState(getRandomQuestion);
  const [value, setValue] = useState("");

  const valid = useMemo(
    () => value.trim().toLowerCase() === question.a.toLowerCase(),
    [value, question.a],
  );

  const refresh = useCallback(() => {
    setQuestion(getRandomQuestion());
    setValue("");
  }, []);

  return { question: question.q, value, setValue, valid, refresh };
}
