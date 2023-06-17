"use client"
import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react';
import AudioTranscript from './helper';


export default function Home() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [convertedText, setConvertedText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [af, setAf] = useState<File>();
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [transcriptionText, setTranscriptionText] = useState<TextWriterProps>();

  const handleFileInputChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAf(file);
    }
  };

  const tx = async() => {
    setLoading(true)
    const at = new AudioTranscript
    af != undefined ? await at.deepgram_transcribe(af) : alert("please choose an audio file!");
    const txt = await at.deepgram_transcribe(af);
    setLoading(false)
    return setTranscriptionText({
      text: txt,
      delay: 10,
    })
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

      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Audio Transcription</h1>

        <div className="mb-4">
          <label htmlFor="fileInput" className="block font-medium">
            Upload Audio File
          </label>
          <input
            id="fileInput"
            type="file"
            accept="audio/*"
            onChange={handleFileInputChange}
            className="py-2 px-4 mt-1 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          className="py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          // Add onClick handler for transcription start
          onClick={loading ? ()=>{} : tx }
        >
          {loading ? `Please wait...`: `Start Transcription`}
        </button>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Transcribed Text</h2>
        <div className="bg-gray-100 p-4 rounded-md text-black h-60">{transcriptionText ? transcriptionText.text : `Choose an audio file and click the Start Transcription button` }</div>
        </div>

        <div className='mt-4'>
        <button
          className="py-2 px-4 mx-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          // Add onClick handler for transcription start
        >
          Copy
        </button>
        <button
          className="py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          // Add onClick handler for transcription start
        >
          Share
        </button>
        </div>
      </div>
    </main>
  )
};

