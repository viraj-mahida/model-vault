import readline from 'readline';

const API_ENDPOINT = "http://localhost:8000";

class MiniVaultCLI {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async handleStreamingResponse(prompt) {
        try {
            const response = await fetch(`${API_ENDPOINT}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value);
                process.stdout.write(chunk);
            }

            console.log(''); // Add newline after streaming

        } catch (error) {
            console.error('Streaming error:', error.message);
        }
    }

    async start() {
        console.log('-----Mini Vault CLI (Streaming)-----');
        console.log('Type "exit" to quit.\n');

        const askPrompt = () => {
            this.rl.question('> prompt: ', async (input) => {
                const trimmedInput = input.trim();
                
                if (trimmedInput === 'exit') {
                    this.rl.close();
                    return;
                }

                if (trimmedInput === '') {
                    askPrompt();
                    return;
                }

                try {
                    console.log('> response:');
                    await this.handleStreamingResponse(trimmedInput);
                } catch (error) {
                    console.log('> response: Error:', error.message);
                }

                console.log('');
                askPrompt();
            });
        };

        askPrompt();
    }

    close() {
        this.rl.close();
    }
}

process.on('SIGINT', () => {
    process.exit(0);
});

const cli = new MiniVaultCLI();
cli.start();