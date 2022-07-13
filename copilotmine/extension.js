// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var copilot =  vscode.extensions.getExtension('Github.copilot')


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('copilotmine.mine', function () {
		var snippet = "#print a\ndef"

		function callCommand(command, range){
			if( copilot.isActive == false ){
				copilot.activate().then(
					function(){
						console.log( "Extension activated");
						vscode.commands.executeCommand(command, range);
						// // comment next line out for release
						// vscode.commands.getCommands(false).then( function(commands){
						// 	console.log(commands)}
						// );
					},
					function(){
						console.log( "Extension activation failed");
					}
				);   
			} else {
				vscode.commands.executeCommand(command);
			}
		}

		//get active editor
		const editor = vscode.window.activeTextEditor;
		if(!editor){
            vscode.window.showErrorMessage("Editor does not exist!");
            return;
        }

		if (editor.selection.isEmpty) {
            const position = editor.selection.active;
			editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(0,0,0,0), snippet);
			}).then(function(){
				callCommand('github.copilot.openPanelForRange', new vscode.Range(0,0,0,0));
			});
            
			editors = vscode.window.visibleTextEditors;

        }
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}



module.exports = {
	activate,
	deactivate
}
