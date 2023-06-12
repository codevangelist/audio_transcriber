
async function AssemblyAITranscript(audioFile: any) => {
    const url = 'https://api.assemblyai.com/v2/transcript';
    const data = {
        "audio_url" : audioFile
    };
    const params = {
        headers:{
            "authorization": process.env.ASSEMBLYAI_API_KEY,
            "content-type": "application/json",
        },
        body: JSON.stringify(data),
        method: "POST"
    };
    fetch(url, params)
       .then(response => response.json())
       .then(data => {
           console.log('Success:', data);
           console.log('ID:', data['id']);
       })
       .catch((error) => {
           console.error('Error:', error);
       });
}

class AudioTranscript {
    constructor() {
        
    }

    async AssemblyAI(audioFile: any) => {
        const upload = () => {
            const data = {
                "audio_url" : audioFile
            };
            const params = {
                headers:{
                    "authorization": process.env.ASSEMBLYAI_API_KEY,
                    "content-type": "application/json",
                },
                body: JSON.stringify(data),
                method: "POST"
            };
            fetch(url, params)
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    return data['id'];
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }

        const download = (id: string) => {
            const url = `https://api.assemblyai.com/v2/transcript/${id}`;
            const params = {
                headers: {
                  "authorization": process.env.ASSEMBLYAI_API_KEY,
                  "content-type": "application/json",
                }, 
                method: "GET"
            };

            fetch(url, params)
                .then(response => response.json())
                .then(data => {
                    print(data);
                })
                .catch((error) => {
                    console.error(`Error: ${error}`);
                });
        }
    }

    private print(data: any) {
        switch (data.status) {
            case 'queued':
            case 'processing':
              console.log('AssemblyAI is still transcribing your audio, please try again in a few minutes!');
              break;
            case 'completed':
              console.log(`Success: ${data}`);
              console.log(`Text: ${data.text}`);
              break;
            default:
              console.log(`Something went wrong :-( : ${data.status}`);
              break;
        }
    }
}

async function AssemblyAITranscript(audioFile: any) => {
    
}

async function AssemblyAITranscript(audioFile: any) => {
    
}