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

    async handleStatusRequest() {
        try {
            const response = await fetch(`${API_ENDPOINT}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const statusData = await response.json();
            
            console.log('> response:');
            console.log('=== SYSTEM STATUS ===');
            console.log(`Timestamp: ${statusData.timestamp}`);
            console.log(`Server Status: ${statusData.server.status} (Port: ${statusData.server.port})`);
            console.log('');
            
            console.log('📊 MEMORY USAGE:');
            console.log(`  RSS: ${statusData.memory.rss}`);
            console.log(`  Heap Total: ${statusData.memory.heapTotal}`);
            console.log(`  Heap Used: ${statusData.memory.heapUsed}`);
            console.log(`  External: ${statusData.memory.external}`);
            console.log('');
            
            console.log('⏱️  UPTIME:');
            console.log(`  Duration: ${statusData.uptime.formatted}`);
            console.log(`  Seconds: ${statusData.uptime.seconds}`);
            console.log('');
            
            console.log('💻 PROCESS INFO:');
            console.log(`  PID: ${statusData.process.pid}`);
            console.log(`  Platform: ${statusData.process.platform}`);
            console.log(`  Node Version: ${statusData.process.nodeVersion}`);
            console.log(`  CPU User Time: ${statusData.process.cpuUsage.user}μs`);
            console.log(`  CPU System Time: ${statusData.process.cpuUsage.system}μs`);

        } catch (error) {
            console.error('Status error:', error.message);
        }
    }

    async start() {
        console.log('*Mini Vault CLI*');
        console.log('Type "exit" to quit, "status" to check system status.\n');

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

                if (trimmedInput === 'status') {
                    try {
                        await this.handleStatusRequest();
                    } catch (error) {
                        console.log('> response: Error:', error.message);
                    }
                    console.log('');
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