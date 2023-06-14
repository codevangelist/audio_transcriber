class AudioTranscript {
    async assembly_ai_transcribe(audioFile: any) {
      const uploadUrl = 'https://api.assemblyai.com/v2/transcript';
      const uploadParams = {
        headers: {
          'authorization': process.env.ASSEMBLYAI_API_KEY ? process.env.ASSEMBLYAI_API_KEY : '',
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
            'authorization': process.env.ASSEMBLYAI_API_KEY ? process.env.ASSEMBLYAI_API_KEY : '',
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
              break;
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
      
    }

    async deepgram_transcribe(audioFile: any) {
      
    }
}

export default AudioTranscript