import { useRef, useState } from 'react';
import { api } from '../api/client';
import { LANGUAGES } from '../config';

// Muestra un texto con las acciones "traducir" (Translate) y "escuchar" (Polly).
export default function TextTools({ text }) {
  const audioRef = useRef(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translation, setTranslation] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    setIsBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  const translate = () => run(async () => {
    setTranslation(await api.translate(text, targetLanguage));
  });

  // Escucha el texto que se esta mostrando: el traducido o el original.
  const listen = () => run(async () => {
    const shownText = translation ? translation.translatedText : text;
    const { audioUrl } = await api.speech(shownText, translation?.targetLanguage);
    audioRef.current.src = audioUrl;
    await audioRef.current.play();
  });

  return (
    <div className="text-tools">
      <p className="text">{translation ? translation.translatedText : text}</p>
      <div className="row small">
        <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} disabled={isBusy}>
          {LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>{language.name}</option>
          ))}
        </select>
        <button type="button" className="link" onClick={translate} disabled={isBusy}>Traducir</button>
        {translation && (
          <button type="button" className="link" onClick={() => setTranslation(null)}>Ver original</button>
        )}
        <button type="button" className="link" onClick={listen} disabled={isBusy}>Escuchar</button>
      </div>
      <audio ref={audioRef} hidden />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
