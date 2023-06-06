import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [convertedText, setConvertedText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
     
      const data = new FormData();
      data.append("file", file);
      data.append("model", "whisper-1");
      data.append("language", "en");
      setFormData(data);

      // check if the size is less than 25MB
      if (file.size > 25 * 1024 * 1024) {
        alert("Please upload an audio file less than 25MB");
        return;
      }
    }
  };
  const sendAudio = async () => {
    setLoading(true);
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ""}`,
      },
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    setConvertedText(data.text);

};
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Audio Transcriber
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            
          </a>
        </div>
      </div>

      <div>
        <div>
            <input
              type="file"
              accept="audio/*"
            />
        </div>

        <div>
          <button onClick={sendAudio} >
            Send Audio
          </button>
        </div>

        <div>
          <TextWriter text={convertedText} delay={10} />
        </div>
      </div>
    </main>
  )
};

const TextWriter = ({ text, delay }: TextWriterProps) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentChar = text.charAt(index);
      const nextChar = text.charAt(index + 1);
      setDisplayText((prevDisplayText) => {
        if (currentChar === "." && nextChar !== " ") {
          return prevDisplayText + currentChar + " ";
        }
        return prevDisplayText + currentChar;
      });
      setIndex((prevIndex) => prevIndex + 1);
    }, delay);

    return () => clearInterval(timer);
  }, [text, delay, index]);

  return <div>{displayText}</div>;
};
