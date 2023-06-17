import recognizer from './sr'
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

      const DEEPGRAM_API_ENDPOINT = 'https://api.deepgram.com/v1/listen';
      const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_SECRET ?? '';

      const response = await fetch(DEEPGRAM_API_ENDPOINT, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        },
        method: "POST",
        body: audioFile,
      });

      const res = await response.json()
      return res.results.reduce((transcript: string, result: any) => {
        console.log(`Transcript: ${transcript + result.alternatives[0].transcript}`)
        return transcript + result.alternatives[0].transcript;
      }, '');
    }

    async default_transcribe(audioFile: File) : Promise<string> {
      return new Promise((resolve, reject) => {
        const rg = recognizer.recognizer;
        rg.onerror = (event: { error: any; }) => {
          reject(event.error);
        };

        rg.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };
    
        rg.onend = () => {
          reject(new Error('No speech detected.'));
        };

        const reader = new FileReader();
        reader.onload = () => {
          const audioData = reader.result as ArrayBuffer;
          const audioContext = new AudioContext();
          audioContext.decodeAudioData(audioData).then((audioBuffer) => {
            const audioSource = audioContext.createBufferSource();

            audioSource.buffer = audioBuffer;
            const mediaStreamDestination = audioContext.createMediaStreamDestination();
            const mediaElement = new Audio();

            mediaElement.srcObject = mediaStreamDestination.stream;
            audioSource.connect(mediaStreamDestination);
            audioSource.start();
            rg.start();
            rg.onend = () => rg.stop();

            rg.addEventListener('end', rg.stop);
            rg.addEventListener('audiostart', () => console.log('Audio started'));
            rg.addEventListener('result', (event: any) => {
              const transcript = event.results[0][0].transcript;
              console.log('Transcript:', transcript);
            });
            rg.addEventListener('audioend', () => console.log('Audio ended'));

            rg.addEventListener('error', (event: any) => console.error(event.error));

            rg.addEventListener('result', (event: any) => {
              const transcript = event.results[0][0].transcript;
              console.log('Transcript:', transcript);
            });
          });
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsArrayBuffer(audioFile);
      })
    }

   
}

export default AudioTranscript;