import {Deepgram} from '@deepgram/sdk'
import ffmpegStatic from 'ffmpeg-static'
class AudioTranscript {
    async assembly_ai_transcribe(audioFile: any) {
      const uploadUrl = 'https://api.assemblyai.com/v2/transcript';
      const uploadParams = {
        headers: {
          'authorization': process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY ?? '',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ 'audio_url': audioFile }),
        method: 'POST',
      };
  
      try {
        const uploadResponse = await fetch(uploadUrl, uploadParams);
        const uploadData = await uploadResponse.json();
        const transcriptId = uploadData['id'];
  
        const transcriptUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
        const transcriptParams = {
          headers: {
            'authorization': process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY ??  '',
            'content-type': 'application/json',
          },
          method: 'GET',
        };
  
        let isTranscribing = true;
        while (isTranscribing) {
          const transcriptResponse = await fetch(transcriptUrl, transcriptParams);
          const transcriptData = await transcriptResponse.json();
  
          switch (transcriptData.status) {
            case 'queued':
            case 'processing':
              console.log('AssemblyAI is still transcribing your audio, please try again in a few minutes!');
              await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
              break;
            case 'completed':
              console.log(`Success: ${JSON.stringify(transcriptData)}`);
              console.log(`Text: ${transcriptData.text}`);
              isTranscribing = false;
              return transcriptData.text
            default:
              console.log(`Something went wrong :-( : ${transcriptData.status}`);
              isTranscribing = false;
              break;
          }
        }
      } catch (error) {
        console.error(`Error: ${error}`);
      }
    }

    
    async function ffmpeg(command) {
      return new Promise((resolve, reject) => {
        exec(`${ffmpegStatic} ${command}`, (err, stderr, stdout) => {
          if (err) reject(err)
          resolve(stdout)
        })
      })
    }

    async whisper_ai_transcribe(audioFile: any) {
      const data = new FormData();
      data.append("file", audioFile);
      data.append("model", "whisper-1");
      data.append("language", "en");


      const url = "https://api.openai.com/v1/audio/transcriptions"
      const params = {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ""}`,
        },
        method: "POST",
        body: data,
      }

      try {
        const txRes = await fetch(url,params)
        const data = await txRes.json();
        return data.text
      } catch (error) {
        return error
      }
    }

    async deepgram_transcribe(audioFile: any) {
      const deepgram = new Deepgram(process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "")
    }

    async default_transcribe(audioFile: any) {
      return new Promise((resolve, reject) => {
        const recognizer = new webkitSpeechRecognition();
        recognizer.onerror = (event) => {
          reject(event.error);
        };

        recognizer.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        recognizer.onend = () => {
          reject(new Error('No speech detected.'));
        };

        recognizer.continuous = true;
        recognizer.interimResults = true;

        const reader = new FileReader();
        reader.onload = () => {
          const audioData = reader.result as ArrayBuffer;
          const audioContext = new AudioContext();
          audioContext.decodeAudioData(audioData).then((audioBuffer) => {
            recognizer.start();
            recognizer.onend = () => recognizer.stop();
            recognizer.addEventListener('end', recognizer.stop);
            recognizer.addEventListener('audiostart', () => console.log('Audio started'));
            recognizer.addEventListener('audioend', () => console.log('Audio ended'));
            recognizer.addEventListener('error', (event) => console.error(event.error));
            recognizer.addEventListener('result', (event) => {
              const transcript = event.results[0][0].transcript;
              console.log('Transcript:', transcript);
            });
            recognizer.postMessage({ command: 'process', buffer: audioBuffer });
          });
        }

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsArrayBuffer(audioFile);
      }
    }

   
}

export default AudioTranscript