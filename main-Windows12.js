const fs = require("fs").promises;
//const { type } = require("os");
const path = require("path");
const vscode = require("vscode");

async function getFile(nombreArchivo) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]; // Obtiene la primera carpeta del workspace

    if (!workspaceFolder) {
        vscode.window.showErrorMessage("❌ No hay un workspace abierto.");
        return "";
    }

    const filePath = path.join(workspaceFolder.uri.fsPath, nombreArchivo); // Une la carpeta con el nombre del archivo

    try {
        const data = await fs.readFile(filePath, "utf-8"); // Usa `fs.promises.readFile()`
        return data;
    } catch (err) {
        vscode.window.showErrorMessage(`❌ Error al leer el archivo: ${err.message}`);
        return "# not found";
    }
}

async function get_filee(filename) {
    let depget = await getFile("dependences/" + filename);
    
    if (depget === "# not found") {
        depget = await getFile(filename);
    }

    return depget !== "# not found" ? depget : ""; // Evita devolver un error como contenido
}

async function replace_files_in_text(text) {
    let result = String(text).replaceAll("\r", ""); // Reemplaza todos los saltos de línea
    const archivos = await vscode.workspace.findFiles("**/*"); // Busca todos los archivos en el workspace

    if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage("❌ No hay workspace abierto.");
    return;
    }
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || ""; // Obtiene la ruta del workspace

    for (const archivo of archivos) {
        try {
            let f = archivo.fsPath.replace(workspaceFolder, "").replaceAll("\\", "/").trim();
            const fileContent = await fs.readFile(archivo.fsPath, "utf-8"); // Usa `await`

            if (fileContent) {
                result = result.replaceAll(`import\n${f}\n;`, fileContent);
            }
        } catch {
            vscode.window.showWarningMessage(`⚠️ No se pudo leer el archivo: ${archivo.fsPath} - ${err.message}`);
        }
    }

    return result;
}



function makelima_syntax(s) {
    if (
        String(s).startsWith("\"")
    )
    {
        return String(s).substring(1, String(s).length - 2);
    }

    return s;
}

async function debug_makelima() {
    const archivos = await vscode.workspace.findFiles("**/makelima.mkl");
    if (archivos.length > 0) {
        const filePath = archivos[0].fsPath;
        vscode.window.showInformationMessage(`📂 Archivo encontrado: ${filePath}`);

        // Leer el contenido del archivo
        fs.readFile(filePath, "utf-8", (err, data) => {
            if (err) {
                vscode.window.showErrorMessage(`❌ Error al leer el archivo: ${err.message}`);
            } else {

            }
        });

        return filePath;
    } else {
        vscode.window.showErrorMessage("❌ No se encontró el archivo makelima.mkl");
        return null;
    }
}

function activate(context) {
        const hoverProvider = vscode.languages.registerHoverProvider("lima_rebuilded", {
        provideHover(document, position) {
            const wordRange = document.getWordRangeAtPosition(position);
            const word = document.getText(wordRange);

            if (word === "__stop__") {
                return new vscode.Hover("(**instruction**) " + word);
            }

            if (word === "ScratchVar") {
                return new vscode.Hover("represents a intersegmental variable");
            }

            if (word === "intersegmental" || word == "globalize") {
                return new vscode.Hover("represents a instance of a global variable or a intersegmental system call");
            }

            if (word === "eax") {
                return new vscode.Hover("represents the command to send to the interpreter and be process by that");
            }

            if (word === "ax") {
                return new vscode.Hover("represents the status of the system call");
            }

            if (word === "bx") {
                return new vscode.Hover("represemts the data to send to the interpreter");
            }

            if (word === "cnd") {
                return new vscode.Hover("represents the conditional variable to jt and jf jump instructions");
            }

            if (word === "returned") {
                return new vscode.Hover("represents the result of a operation of the interpreter or of the thridy party calls");
            }

            if (word === "%^\"!p\"") {
                return new vscode.Hover("represents a interpreter call");
            }

            if (word === "mov") {
                return new vscode.Hover("the indtruction for move a value to a global variable");
            }

            return null;
        }
    });

    
    const startDebugging = vscode.commands.registerCommand("lima.startDebug", async () => {
            var e = await getFile("main.lima");

            vscode.window.showInformationMessage(getFile("/DIRECTO.jsonl"));
    });

    context.subscriptions.push(startDebugging);


    const commentSnippet = vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        provideCompletionItems(document, position) {
            const completion = new vscode.CompletionItem("Docummentation 1");
            completion.insertText = new vscode.SnippetString(
                "# MyFunction\n" +
                "# \n" +
                "# Summary:\n" +
                "# \t...\n" +
                "# \n" +
                "# Params:\n" +
                "# \t...\n" +
                "# \n" 
            );
            completion.documentation = new vscode.MarkdownString("Genera un comentario bien estructurado en Lima.");
            return [completion];
        }
    });
    
    const tumama = vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        provideCompletionItems(document, position) {
            const completion = new vscode.CompletionItem("Typedef");
            completion.insertText = new vscode.SnippetString(
                "typedef\n" +
                "\tvar\n" +
                "\tMyTypedef\n"
                );
            completion.documentation = new vscode.MarkdownString("Genera un comentario bien estructurado en Lima.");
            return [completion];
        }
    });

    const larouse = vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        provideCompletionItems(document, position) {
            const completion = new vscode.CompletionItem("Comment Section");
            completion.insertText = new vscode.SnippetString(
                "######!\n" +
                "######!\n" +
                "######!\n" +
                "######!\n" +
                "######!\n" +
                "######!\n" +
                "######! your section name here\n" +
                "######!\n" +
                "######!\n" +
                "######!\n" +
                "######!\n" +
                "######!\n" +
                "######!\n"
                );
            completion.documentation = new vscode.MarkdownString("Genera un comentario bien estructurado en Lima.");
            return [completion];
        }
    });

    const la_abja_maya = vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        provideCompletionItems(document, position) {
            const completion = new vscode.CompletionItem("puro miope hace esto");
            completion.insertText = new vscode.SnippetString(
                "### !\n" +
                "### ! A NEW SECTION WILL BE START SOON\n" +
                "### !\n"+
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "\n" +
                "### !\n" +
                "### !\n" +
                "### !\n" +
                "### !\n"
            );
            completion.documentation = new vscode.MarkdownString("Genera un comentario bien estructurado en Lima.");
            return [completion];
        }
    });

    context.subscriptions.push(commentSnippet);
}

exports.activate = activate;