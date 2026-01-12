import * as vscode from 'vscode';
import { execSync } from 'child_process';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    // Create an output channel to log errors and status
    outputChannel = vscode.window.createOutputChannel("Groq Commit");
    context.subscriptions.push(outputChannel);

    const generateCommit = vscode.commands.registerCommand("groqCommit.generate", async () => {
        try {
            // Get configuration
            const config = vscode.workspace.getConfiguration("groqCommit");
            
            // Check API Key
            let apiKey = config.get<string>("apiKey");
            if (!apiKey || apiKey.trim() === "") {
                apiKey = await vscode.window.showInputBox({
                    prompt: "Enter your Groq API Key",
                    placeHolder: "gsk_...",
                    ignoreFocusOut: true,
                    password: true
                });

                if (!apiKey) {
                    vscode.window.showErrorMessage("Groq API Key is required.");
                    return;
                }
                // Save the key globally
                await config.update("apiKey", apiKey, vscode.ConfigurationTarget.Global);
            }

            const language = config.get<string>("language") || "English";
            const model = config.get<string>("model") || "llama-3.3-70b-versatile";

            // Get Git API
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            const gitApi = gitExtension?.exports.getAPI(1);
            const repo = gitApi?.repositories[0];

            if (!repo) {
                vscode.window.showErrorMessage("No Git repository found.");
                return;
            }

            // Check for staged changes
            const stagedChanges = repo.state.indexChanges;
            if (stagedChanges.length === 0) {
                vscode.window.showErrorMessage("No staged changes found. Use 'git add' first.");
                return;
            }

            // Generate message with Progress UI
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Groq AI: Generating commit in ${language}...`,
                cancellable: true
            }, async (progress, token) => {
                
                // Get the diff of staged changes
                const diff = execSync("git diff --cached", { 
                    cwd: repo.rootUri.fsPath, 
                    encoding: "utf8" 
                });

                if (!diff) {
                    vscode.window.showErrorMessage("Could not retrieve git diff.");
                    return;
                }

                const MAX_DIFF_LENGTH = 15000;

                if (diff.length > MAX_DIFF_LENGTH) {
                    vscode.window.showErrorMessage("The length of the diff is too large.");
                    return;
                }

                const commitMessage = await callGroqAPI(apiKey!, diff, language, model, token);
                
                if (commitMessage) {
                    repo.inputBox.value = commitMessage;
                }
            });

        } catch (error: any) {
            vscode.window.showErrorMessage(`Groq Commit Error: ${error.message}`);
        }
    });

    context.subscriptions.push(generateCommit);
}

async function callGroqAPI(
    apiKey: string, 
    diff: string, 
    language: string, 
    model: string, 
    token: vscode.CancellationToken
): Promise<string | null> {
    
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: 
                        `You are an expert git commit assistant. 
                        Your task is to generate a commit message strictly in ${language} using this EXACT structure:
                        
                        1. A subject line: <type>: <short summary>
                        2. A BLANK LINE (mandatory).
                        3. A short, concise description of changes (max 10 lines).

                        Rules:
                        - Types: feat, fix, chore, docs, test, style, refactor.
                        - Summary: Maximum 50 characters.
                        - Description: Use bullet points for multiple changes. Focus on "what" and "why".
                        - IMPORTANT: You must include a double newline between the subject line and the description.`
                    },
                    {
                        role: "user",
                        content: `Generate a commit message for this diff:\n\n${diff}`
                    }
                ],
                temperature: 0.2
            })
        });

        if (token.isCancellationRequested) return null;

        if (!response.ok) {
            const errorData: any = await response.json();
            throw new Error(errorData.error?.message || `API Error ${response.status}`);
        }

        const data: any = await response.json();
        return data.choices[0]?.message?.content?.trim() || null;

    } catch (error: any) {
        outputChannel.appendLine(`❌ Fetch Error: ${error.message}`);
        throw error;
    }
}

export function deactivate() {}