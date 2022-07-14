// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
var copilot =  vscode.extensions.getExtension('Github.copilot');
const TIMEOUT = 20000;

/**
 * Given a comment or query, formats a partial Python snippet for inserting in the format:
 * 	#{comment}
 * 	def
 * @param {string} comment The comment or query string to use.
 * @returns {string} The formatted snippet.
 */
function formatPythonSnippet(comment){
	var snippet = "# " + comment + "\n";
	snippet+="def";
	return snippet;
}

/**
 * Given a comment or query, formats a partial Java snippet for inserting in the format:
 * 	// {comment}
 * 	public class Clazz{
 * 		public
 * @param {string} comment The comment or query string to use.
 * @returns {string} The formatted snippet.
 */
 function formatJavaSnippet(comment){
	var snippet = "//" + comment + "\n";
	snippet+="public class Clazz{\n";
	snippet+="\tpublic\n";
	return snippet;
}

var currentLang = undefined;

/**
 * Returns the absolute path to a file located in our data folder.
 *
 * @param file The base file name.
 * @param context The context of this extension to get its path regardless where it is installed.
 */
function getDataPath(file, context){
	return context.asAbsolutePath(path.join('data', file));
}

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
		//tab seperated querys
		var dataPath = getDataPath("all_queries.csv", context);
		var file = fs.readFileSync(dataPath, 'utf8');
		var lines = file.split("\n")
		var row = 0;
		var queries = [];
		var start = 1;
		// var end = start + 10;
		for(var l of lines){
			if(row < start){
				row++;
				continue;
			}
			// //do first 10
			// if(row >= end){
			// 	break;
			// }
			l = l.trim()
			var columns = l.split("\t");
			var query = {
				id: columns[0],
				source: columns[1],
				language: columns[2],
				query: columns[3],
				snippets: []
			}
			// 	row++;
			// 	continue;
			// }
			queries.push(query);
			row++;
		}

		/**
		 * Gets range of entire text in a editor.
		 * @param {vscode.TextEditor} editor Editor to get range from.
		 * @returns {vscode.Range} The range of the entire text.
		 */
		function getRangeOfAll(editor){
			var firstLine = editor.document.lineAt(0);
			var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
			var textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
			return textRange;
		}

		/**
		* Helper function to call commands from other extensions.
		* It only accepts a range argument because that's all I use it for.
		* @param {string} command The command to call.
		* @param {vscode.Range} range Range to use for the command.
		* @returns 
		*/
		function callCommand(command, range){
			if( copilot.isActive == false ){
				copilot.activate().then(
					function(){
						console.log( "Extension activated");
						return vscode.commands.executeCommand(command, range);
					},
					function(){
						console.log( "Extension activation failed");
					}
				);   
			} else {
				return vscode.commands.executeCommand(command);
			}
		}

		function focusNonPilot(){
			var editors = vscode.window.visibleTextEditors;
			var textEditor = undefined

			for(var e of editors){
				if(e.document.fileName !== 'GitHub Copilot'){
					textEditor = e;
					break;
				}
			}

			//focus the text editor again
			return vscode.window.showTextDocument(textEditor.document, { preview: false, viewColumn: textEditor.viewColumn})
		}

		function getSnippets(query, lang){

			//get active editor
			var editor = vscode.window.activeTextEditor;
			if(!editor){
				vscode.window.showErrorMessage("Editor does not exist!");
				return;
			}
			if(editor.document.fileName === "GitHub Copilot"){
				console.log("bad things happened")
				focusNonPilot();
				editor = vscode.window.activeTextEditor;
			}

			var snippet;
			return new Promise(function(resolve, reject) {
				// the langauge info does actually matter, otherwise we get odd results
				vscode.languages.setTextDocumentLanguage(editor.document, lang).then(()=>{
					if(lang === "python")
						snippet = formatPythonSnippet(query);
					else{
						snippet = formatJavaSnippet(query);
					}
					editor.edit(editBuilder => {
						var range = getRangeOfAll(editor);
						editBuilder.replace(range, snippet);
					}).then(function(){
						var range = getRangeOfAll(editor);
						callCommand('github.copilot.openPanelForRange', range).then(()=>{
							//wait some time to get results
							return setTimeout(function(){
								var editors = vscode.window.visibleTextEditors;
								for(var e of editors){
									if(e.document.fileName == 'GitHub Copilot'){
										var results = e.document.getText();
										results = results.split("\n=======\n\n");
									}
								}
								focusNonPilot().then(()=>{
									resolve(results);
								})
								
							}, TIMEOUT);
						})
					// 	//this catches errors in other parts of the program :/
					// 	.then(undefined, err => {
					// 		console.log(err);
					// 	})
					});
				});
			});
        }

		var snippetPath = getDataPath("snippets.json", context);
		if(!fs.existsSync(snippetPath)){
			fs.writeFileSync(snippetPath, "[\n");
		}

		function doQuery(i){
			var q = queries[i]
			console.log(q.id);
			var text = q.query;
			var lang = q.language;
			getSnippets(text, lang).then(snippets => {
				var number =snippets[0];
				number = number.split("Synthesizing ")[1]
				number = parseInt(number.split("/")[0])

				snippets = snippets.slice(1, snippets.length)
				q.snippets = snippets;
				q.results = number;
				fs.appendFileSync(snippetPath, JSON.stringify(q, undefined, 4) + ",");
				if(i < queries.length - 1){
					doQuery(i+1);
				}
			})
		}

		doQuery(0);

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}



module.exports = {
	activate,
	deactivate
}
