# copilot mine

Mines copilot.

For version: `1.257.0`

## Install

1. Install the Github Copilot extension in VSCode
2. Clone repo and open the `copilotmine` directory in VSCode
3. Install Python and Java. This extensions switches the language setting if necessary and this can cause errors.
4. Use F5 to run the extension. It should open a new window. 
    - If this doesn't work you'll need to ensure you're in the correct directory, use `code copilotmine`. If the code command doesn't work you will need to use the command palette to install the `code` shell command in PATH.
5. With the extension open, create an empty file, close any other windows and ensure your cursor is in the empty file. I don't bother trying to setup the empty environment programmatically.
6. Wait for VSCode setup to finish in the left hand bottom corner, if you run while setting up you will encounter an error in the debug console. 
7. Use the command palette to select the command 'Mine', which will begin the process.

VSCode appears to have issues switching editors between the co-pilot window and the open document if you try to run this in the background (You will get errors about trying to open a document). I just ran it on my computer over night so I could leave it untouched.

## Info

Originally the suggestions panel was a text editor you could just access, but now it's a WebView panel I can't. Instead, the extension uses the copilot logs to get the suggestions.

You might experience some issues with the algorithm to find the latest log. I just presume the debug window is the newest window in the newest 'session'. Try closing all VSCode editors and re-opening. 