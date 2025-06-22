///
/// Lima vscode
///
/// erick craft studios
///

///
/// lima vscode provides a autocompletion and experience for the lima developers
///

//
// include the dependences
//

//
// fs is not used now but are very fundamental for the makelima actions, well , makelima is a extern complement
// on Lim22 and for technical limitations , well is not necesary
//
const fs = require("fs");

//
// too
//
const path = require("path");

//
// the vscode tools for the extension
//
const vscode = require("vscode");

//
// *Out/Outpud
//
// the outpud channel
//
let developOut;
let DebugOutpud;
let StdErrOutpud;

//
// isUpdating
//
// if the screen is updating
//
let isUpdating = false;

//
// search_dependence
//
// search the dependence in the project (search firs in /dependences and before if dont find it in the project root)
//
// voy a ser honesto , la ia me ayudo por que soy medio distraido para hacer este tipo de funciones
//
async function search_dependence(dependence_name) {
    //
    // configure vars
    //
    var extension_like = ".lima";
    const projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const dependences_dir = path.join(projectPath, "dependences");

    //
    // action
    //

    var dep_file = path.join(dependences_dir, dependence_name + extension_like);
    var root_file = path.join(projectPath, dependence_name + extension_like);

    //
    // logit
    //

    developOut.appendLine(dep_file);
    developOut.appendLine(root_file);

    var returned = "";

    //
    // find the file
    //

    try {
        returned = await fs.promises.readFile(dep_file, 'utf8');
    } catch (err) {
        try {
            returned = await fs.promises.readFile(root_file, 'utf8');
        } catch (err) {

            returned = "# not founded";
        }
    }

    return returned;
}


//
// mklEnbeded_ParseFile
//
// the makelima function to parse a file, only for this time i ported part of the lim22 code to js
// well, i cant make it again, or idk
//
async function mklEnbeded_ParseFile(
    content
)
{
    //
    // configure vars
    //

    var result = "";

    result = content;

    result = result.replaceAll("\r","");
    var lines = result.split("\n");

    //
    // solve the string
    //
    for (let index = 0; index < lines.length; index++) {
        if (
            lines[index].trim() == "import"
        )
        {
            result = result.replaceAll("import\n" + lines[index + 1] + "\n;", "# module_start:" + lines[index + 1] + "\n" + (await mklEnbeded_ParseFile(await search_dependence(lines[index + 1].trim().trimEnd()))));
        }

    }

    //developOut.appendLine(result);
    return result;
}

function GetStruct(
    script,
    struct
)
{
    //
    // configure vars
    //

    let result = "";

    let line = 0;
    let lines = script.replaceAll("\r","").split("\n");

    let in_struct = false;

    //
    // check it
    //

    for (let index = 0; index < lines.length; index++) {
        let element = lines[index];
        
        if (
            element.trim() == "@structure"
        )
        {
            in_struct = true 
        }
        else if (
            element.trim() == "}" && in_struct == true
        )
        {
            in_struct = false;

            DebugOutpud.appendLine(lines[index + 1].trim());
            if (
                lines[index + 1].trim() == struct.trim()
            )
            {
                return result;
            }
            else {
                result = "";
            }
        }
        else if (
            in_struct == true
        )
        {
            result += element + "\n";
        }
    }

    return "";
}

function GetClass(script, name) {
    let lines = script.replaceAll("\r", "").split("\n");
    let in_class = false;
    let blocks = 0;
    let class_body = "";

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index].trim();

        if (!in_class && line === "collection<class " + name + ">") {
            in_class = true;
            continue; // saltar esta línea
        }

        if (in_class) {
            if (line === "{") {
                blocks++;
                continue; // evitar agregar la llave a class_body
            }

            if (line === "}") {
                blocks--;
                if (blocks === 0) {
                    break; // cerró la clase
                }
            }

            if (blocks > 0) {
                if (line.startsWith("expand class ")) {
                    const base = line.substring(13).trim();
                    class_body += GetClass(script, base) + "\n";
                } else {
                    class_body += lines[index] + "\n";
                }
            }
        }
    }

    return class_body;
}

///
/// the lima activation string
///
async function activate(context) {

    developOut = vscode.window.createOutputChannel("Lima/Lima++ internal logs");
    DebugOutpud = vscode.window.createOutputChannel("Lima/Lima++ debug");
    StdErrOutpud = vscode.window.createOutputChannel("Lima/Lima++ stderr");

    //
    // snipped_count
    //
    // represents the count of the snippeds
    //
    var snipped_count = 9999999999;

    //
    // harotooltip
    //
    // represents the haro tooltip from the odd MK Code Studio ide but better and with support for
    // Lima++
    //
    const harotooltip = await vscode.languages.registerHoverProvider("lima_rebuilded", {
        // providing tool
        async provideHover(document, position) {

            //
            // declare vars
            //

            const wordRange = document.getWordRangeAtPosition(position);
            const word = document.getText(wordRange);

            //
            // instructions
            //

            // __stop__
            if (word === "__stop__") {
                return new vscode.Hover("(**instruction**) " + word);
            }

            // ScratchVar
            if (word === "ScratchVar") {
                return new vscode.Hover("represents a intersegmental variable");
            }

            // intersegmental and globalize words
            if (word === "intersegmental" || word == "globalize") {
                return new vscode.Hover("represents a instance of a global variable or a intersegmental system call");
            }

            //
            // global variables
            //

            // the comander action
            if (word === "eax") {
                return new vscode.Hover("``@eax`` represents the command to send to the interpreter and be process by that");
            }

            // the status of the operation
            if (word === "ax") {
                return new vscode.Hover("``@ax`` represents the status of the system call");
            }

            // the data to send
            if (word === "bx") {
                return new vscode.Hover("```@bx`` represemts the data to send to the interpreter");
            }

            //
            // system variables
            //

            // the comparator/conditional variable
            if (word === "cnd") {
                return new vscode.Hover("``.cnd`` represents the conditional variable to jt and jf jump instructions");
            }

            // the returned value of a operation
            if (word === "returned") {
                return new vscode.Hover("represents the result of a operation of the interpreter or of the thridy party calls");
            }

            //
            // technical
            //

            // the CMFP
            if (word === "%^\"!p\"") {
                return new vscode.Hover("represents a interpreter call");
            }

            // 
            // get the documment solved
            //

            var rtpos1 = new vscode.Position(0,0);
            var rtpos2 = new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1));

            var posxd = new vscode.Range(
                rtpos1,
                rtpos2
            )

            var actual_text = document.getText(posxd);

            var documment_converted = await mklEnbeded_ParseFile(actual_text);

            var rt_doc = documment_converted.split("\n");

            var module_check = "Main.lima"

            for (let index = 0; index < rt_doc.length; index++) {

                let element = rt_doc[index].trim();
                let element2 = rt_doc[index + 1].trim();
                let element3 = rt_doc[index + 2].trim();

                if (
                    rt_doc[index].trim().startsWith("# module_start:")
                )
                {
                    var module_name = rt_doc[index].trim().substring(15,rt_doc[index].trim().length)

                    module_check = module_name;
                }
                else if (
                    element == "var"
                )
                {
                    if (
                        element2 == word
                    )
                    {
                        return new vscode.Hover("(**variable**) " + word + "\n\rlocated in module:" ,module_check);
                    }
                }
                else if (
                    element == "ustruct"
                )
                {
                    if (
                        element2 === word
                    )
                    {
                        return new vscode.Hover("(**structure instance**) " + word + "\n\rof the structure: " + element3 + "\n\rlocated in module:" ,module_check);
                    }
                }

            }
            return null;
        }
    });

    //
    // documentation_completion
    //
    // represents a documentation template for the functions and make documentation faster
    //
    const documentation_completion = await vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        //
        // provides the completion
        //
        provideCompletionItems(document, position) {
            snipped_count = 9999999999
            //
            // declare vars
            //
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
            completion.documentation = new vscode.MarkdownString("Lima: function, variable, method, structure documentation");
            return [completion];
        }
    });
    
    //
    // tools_completions
    //
    // miscelianus and/or utilities of the languaje
    //
    const tools_completions = await vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        provideCompletionItems(document, position) {
            //
            // conditional_var
            //
            // represents the variable of the conditional not-if things
            //
            const conditional_var = new vscode.CompletionItem("conditional variable", vscode.CompletionItemKind.Enum);
            conditional_var.insertText = new vscode.SnippetString(".cnd");
            conditional_var.documentation = new vscode.MarkdownString("Lima/Lima++: conditional variable for jt , jf and other conditional things");
            conditional_var.sortText = snipped_count.toString();

            snipped_count--;

            //
            // CMFP_Command
            //
            // represents the data1 of a interpreter command send
            //
            const CMFP_Command = new vscode.CompletionItem("CMFP Command", vscode.CompletionItemKind.Enum);
            CMFP_Command.insertText = new vscode.SnippetString("@eax");
            CMFP_Command.documentation = new vscode.MarkdownString("Lima: the CMFP (Command magiccer for pros) command global variable for send");
            CMFP_Command.sortText = snipped_count.toString();

            snipped_count--;

            //
            // CMFP_Param
            //
            // represents the data2 of a interpreter command send
            //
            const CMFP_Param = new vscode.CompletionItem("CMFP Param", vscode.CompletionItemKind.Enum);
            CMFP_Param.insertText = new vscode.SnippetString("@bx");
            CMFP_Param.documentation = new vscode.MarkdownString("Lima: the CMFP (Command magiccer for pros) command data global variable for send");
            CMFP_Param.sortText = snipped_count.toString();

            snipped_count--;

            //
            // returned_var
            //
            // represents the variable of the return value of all operations of the interpreter or other actions
            //
            const returned_var = new vscode.CompletionItem("return value", vscode.CompletionItemKind.Enum);
            returned_var.insertText = new vscode.SnippetString("_returned");
            returned_var.documentation = new vscode.MarkdownString("Lima/Lima++: the return value of a interpreter or for script function");
            returned_var.sortText = snipped_count.toString();

            snipped_count--;

            //
            // ring_zero
            //
            // represents a action to put the code in the segment 0 (perfect to operating systems or firmware)
            //
            const ring_zero = new vscode.CompletionItem("ring 0", vscode.CompletionItemKind.Enum);
            ring_zero.insertText = new vscode.SnippetString("org\n0\n");
            ring_zero.documentation = new vscode.MarkdownString("Lima: action to save the code in the segment '0' of the memory\n\r(perfect for make OS and Firmwares)");
            ring_zero.sortText = snipped_count.toString();

            snipped_count--;

            return [conditional_var, CMFP_Command, CMFP_Param,returned_var,ring_zero]; // Devuelve múltiples opciones
        }
    });

    //
    // typedef_completion
    //
    // represents the template of a macro
    //
    const typedef_completion = await vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        
        // provides the completion
        provideCompletionItems(document, position) {
            //
            // declare vars
            //
            const completion = new vscode.CompletionItem("Typedef",vscode.CompletionItemKind.Keyword);
            completion.insertText = new vscode.SnippetString(
                "typedef\n" +
                "\tvar\n" +
                "\tMyTypedef\n"
                );
            completion.documentation = new vscode.MarkdownString("Lima: macro definition");
            return [completion];
        }
    });

    //
    // class_snipped
    //
    // the class template
    //
    const class_snipped = await vscode.languages.registerCompletionItemProvider("lima_rebuilded", {

        //
        // provides the completion
        //
        provideCompletionItems(document, position) {
            //
            // configure completion item
            //
            const completion = new vscode.CompletionItem("Class Template",vscode.CompletionItemKind.Class);

            completion.sortText = snipped_count.toString()
            snipped_count--;
            completion.insertText = new vscode.SnippetString(
                "///! ![enable Lima++]\r\ncollection<class MyClass>\r\n{\r\n    # __value\r\n    # \r\n    # Summary:\r\n    # \tthe value that is called when you try to call the class\r\n    # \r\n    collection<children var __value>\r\n\r\n    # Function1\r\n    # \r\n    # Summary:\r\n    # \t...\r\n    # \r\n    # Params:\r\n    # \t...\r\n    # \r\n    collection<function Function1>\r\n    (\r\n        collection<param MyParam1>\r\n        collection<param MyParam2>\r\n    )\r\n    \r\n        echo collection<param MyParam1>\r\n        echo collection<param MyParam2>\r\n\r\n        collection<return 0>\r\n\r\n    collection<end function>\r\n\r\n    # Function2\r\n    # \r\n    # Summary:\r\n    # \t...\r\n    # \r\n    # Params:\r\n    # \t...\r\n    # \r\n    collection<function Function2>\r\n    (\r\n        collection<param MyParam1>\r\n        collection<param MyParam2>\r\n    )\r\n    \r\n        echo collection<param MyParam1>\r\n        echo collection<param MyParam2>\r\n\r\n        collection<return 0>\r\n\r\n    collection<end function>\r\n\r\n    # Function3\r\n    # \r\n    # Summary:\r\n    # \t...\r\n    # \r\n    # Params:\r\n    # \t...\r\n    # \r\n    collection<function Function3>\r\n    (\r\n        collection<param MyParam1>\r\n        collection<param MyParam2>\r\n    )\r\n    \r\n        echo collection<param MyParam1>\r\n        echo collection<param MyParam2>\r\n\r\n        collection<return 0>\r\n\r\n    collection<end function>\r\n\r\n}\r\n///! ![disable Lima++]"
            );
            completion.documentation = new vscode.MarkdownString("Lima++: a template of a class using collections<class>");
            return [completion];
        }
    });

    //
    // class_searcher
    //
    // provides a class snipped from dont remember the class name every time
    //
    const class_searcher = await vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        //
        // provides completions
        //
        async provideCompletionItems(document, position) {
            // 
            // get the documment solved
            //

            var rtpos1 = new vscode.Position(0,0);
            var rtpos2 = new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1));

            var posxd = new vscode.Range(
                rtpos1,
                rtpos2
            )

            var actual_text = document.getText(posxd);

            var documment_converted = await mklEnbeded_ParseFile(actual_text);

            var rt_doc = documment_converted.split("\n");

            //
            // declare variables
            //
            let completions = [];

            //
            // loop for search every clases
            //
            for (let i = 0; i < rt_doc.length - 1; i++) {
                //
                // get the line documment
                //
                let lineText = rt_doc[i].trim();

                //
                // if is a class or, well, i suppused that by the starting text
                //
                if (lineText.trim().startsWith("collection<class ")) {
                    //
                    // get the class name
                    //
                    let className = lineText.substring(17, lineText.length - 1);
                    
                    var class_documentation = "";

                    if (
                        rt_doc[i - 1].trim() == "**/"
                    )
                    {
                        let PopIndex = i;

                        i -= 2;

                        while (rt_doc[i].trim() != "/**")
                        {
                            class_documentation = rt_doc[i].trim().replaceAll("*","") + "\n\r" + class_documentation
                            i--;
                        }

                        i = PopIndex;

                        class_documentation = "" + class_documentation + ""
                    }

                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(className, vscode.CompletionItemKind.Class);
                    completion.insertText = new vscode.SnippetString(className);
                    completion.documentation = new vscode.MarkdownString((class_documentation == "" ? ("Lima++: class " + className) : "") + class_documentation);

                    //
                    // the class check
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the class is not repeated?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }

                }
            }

            //
            // return all completions
            //
            return completions;
        }
    });

    //
    // functions_searcher
    //
    // provides completions items for functions in the code
    //
    const functions_searcher = await vscode.languages.registerCompletionItemProvider("lima_rebuilded", {

        //
        // provides the completion item
        //
        async provideCompletionItems(document, position) {
            // 
            // get the documment solved
            //

            var rtpos1 = new vscode.Position(0,0);
            var rtpos2 = new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1));

            var posxd = new vscode.Range(
                rtpos1,
                rtpos2
            )

            var actual_text = document.getText(posxd);

            var documment_converted = await mklEnbeded_ParseFile(actual_text);

            var rt_doc = documment_converted.split("\n");

            let in_msg = false;
            let in_class = false;
            let in_function = false;
            let in_struct = false;
            let in_section = false;

            //
            // the array of the clases
            //
            let completions = [];

            //
            // search in code from a class
            //
            for (let i = 0; i < rt_doc.length - 1; i++) {
                //
                // declare the lines
                //
                let lineText = rt_doc[i].trim();
                let lineText2 = rt_doc[i +1].trim();

                
                let adecuate = (
                    in_msg == false &&
                    in_class == false &&
                    in_function == false &&
                    in_struct == false
                );

                //
                // is a section starting (a function)
                //
                if (lineText.trim() == "section" && adecuate) {
                    //
                    // get the name
                    //
                    let sectionName = rt_doc[i + 1].trim();
                    
                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(sectionName, vscode.CompletionItemKind.Function);
                    completion.insertText = new vscode.SnippetString(sectionName);
                    completion.documentation = new vscode.MarkdownString("Lima: label " + sectionName);

                    //
                    // aline the text
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the completion item is not repited?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }
                }
                else if (
                    lineText.trim().startsWith("message ")
                )
                {
                    in_msg = true;

                    var class_documentation = "";

                    if (
                        rt_doc[i - 2].trim() == "**/"
                    )
                    {
                        let PopIndex = i;

                        i -= 3;

                        while (rt_doc[i].trim() != "/**")
                        {
                            class_documentation = rt_doc[i].trim().replaceAll("*","") + "\n\r" + class_documentation
                            i--;
                        }

                        i = PopIndex;

                        class_documentation = "" + class_documentation + ""
                    }

                    //
                    // get the name
                    //
                    let sectionName = lineText.trim().substring(8,lineText.length);
                    
                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(sectionName, vscode.CompletionItemKind.Function);
                    completion.insertText = new vscode.SnippetString("sendmw "+ sectionName);
                    completion.documentation = new vscode.MarkdownString(( class_documentation == "" ?("Lima: message " + sectionName) : "") + class_documentation + "\n\r(autocomplete to insert a call to the message)");

                    //
                    // aline the text
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the completion item is not repited?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }
                }
                
                else if (
                    lineText.trim().startsWith("collection<class ")
                )
                {
                    in_class = true;
                }
                else if 
                (
                    lineText.trim() == "section"
                )
                {
                    in_section = true;
                }
                else if (
                    lineText.trim() == "popback"
                )
                {
                    in_section = false;
                }
                else if (
                    lineText == "collection<end function>"
                )
                {
                    in_function = false;
                }
                else if (
                    lineText == "@structure"
                )
                {
                    in_struct = true;
                }
                else if (
                    lineText == "[endmsg]"
                )
                {
                    in_msg = false;
                }
                else if (
                    lineText == "}"
                )
                {
                    if (
                        in_struct
                    )
                    {
                        in_struct = false;
                    }
                    else if (
                        in_class
                    )
                    {
                        in_class = false;
                    }
                }
            }

            //
            // return all completions
            //
            return completions;
        }
    });

    //
    // structs_searcher
    //
    // provides completions items for the structs
    //
    const structs_searcher = await vscode.languages.registerCompletionItemProvider("lima_rebuilded", {

        //
        // provides the completion item
        //
        async provideCompletionItems(document, position) {
            // 
            // get the documment solved
            //

            var rtpos1 = new vscode.Position(0,0);
            var rtpos2 = new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1));

            var posxd = new vscode.Range(
                rtpos1,
                rtpos2
            )

            var actual_text = document.getText(posxd);

            var documment_converted = await mklEnbeded_ParseFile(actual_text);

            var rt_doc = documment_converted.split("\n");

            //
            // the array of the clases
            //
            let completions = [];

            //
            // search in code from a class
            //
            for (let i = 0; i < rt_doc.length - 1; i++) {
                //
                // declare the lines
                //
                let lineText = rt_doc[i].trim();
                let lineText2 = rt_doc[i +1].trim();

                //
                // is a section starting (a function)
                //
                if (lineText.trim() == "@structure" && rt_doc[i + 1].trim() == "{") {
                    i += 2;
                    while (rt_doc[i].trim() != "}") {
                        i++;
                    }

                    //
                    // get the name
                    //
                    let sectionName = rt_doc[i + 1].trim();
                    
                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(sectionName, vscode.CompletionItemKind.Struct);
                    completion.insertText = new vscode.SnippetString(sectionName);
                    completion.documentation = new vscode.MarkdownString("Lima: structure " + sectionName);

                    //
                    // aline the text
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the completion item is not repited?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }
                }
            }

            //
            // return all completions
            //
            return completions;
        }
    });

    //
    // variables_searcher
    //
    // the variables segguestion in the code
    //
    const variables_searcher = await vscode.languages.registerCompletionItemProvider("lima_rebuilded", {
        //
        // provides the completions item
        //
        async provideCompletionItems(document, position) {
            // 
            // get the documment solved
            //

            var rtpos1 = new vscode.Position(0,0);
            var rtpos2 = new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1));

            var posxd = new vscode.Range(
                rtpos1,
                rtpos2
            )

            var actual_text = document.getText(posxd);

            var documment_converted = await mklEnbeded_ParseFile(actual_text);

            var rt_doc = documment_converted.split("\n");

            //
            // the array
            //
            let completions = [];

            let in_msg = false;
            let in_class = false;
            let in_function = false;
            let in_struct = false;
            let in_section = false;

            //
            // look for a var
            //
            for (let i = 0; i < rt_doc.length - 1; i++) {
                //
                // the line
                //
                let lineText = rt_doc[i].trim();

                let adecuate = (
                    in_msg == false &&
                    in_class == false &&
                    in_function == false &&
                    in_struct == false
                );

                //
                // is a variable?
                //
                if (lineText.trim() == "var" && adecuate) {
                    //
                    // get the varname
                    //
                    let varName = rt_doc[i +1].trim();
                    
                    var class_documentation = "";
                    
                    if (
                        rt_doc[i - 1].trim() == "**/"
                    )
                    {
                        let PopIndex = i;

                        i -= 2;

                        while (rt_doc[i].trim() != "/**")
                        {
                            class_documentation = rt_doc[i].trim().replaceAll("*","") + "\n\r" + class_documentation
                            i--;
                        }

                        i = PopIndex;

                        class_documentation = "" + class_documentation + ""
                    }

                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable);
                    completion.insertText = new vscode.SnippetString(varName);
                    completion.documentation = new vscode.MarkdownString((class_documentation == "" ? ("Lima: variable " + varName) : "") + class_documentation);

                    //
                    // aling the text
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the variable is not repited?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }
                }
                if (lineText.trim() == "typedef" && adecuate) {
                    //
                    // get the varname
                    //
                    let varName = rt_doc[i +2].trim();
                    
                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable);
                    completion.insertText = new vscode.SnippetString(varName);
                    completion.documentation = new vscode.MarkdownString("Lima: macro " + varName);

                    //
                    // aling the text
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the variable is not repited?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }
                }
                if (lineText.trim() == "externtype" && adecuate) {
                    //
                    // get the varname
                    //
                    let varName = rt_doc[i +1].trim();
                    
                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable);
                    completion.insertText = new vscode.SnippetString(varName);
                    completion.documentation = new vscode.MarkdownString("Lima: extern macro " + varName);

                    //
                    // aling the text
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the variable is not repited?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }
                }
                else if (lineText.trim() == "ustruct" && adecuate) {
                    //
                    // get the varname
                    //
                    let varName = rt_doc[i + 1].trim();
                    let struct_name = rt_doc[i + 2].trim();

                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable);
                    completion.insertText = new vscode.SnippetString(varName + "->");
                    completion.documentation = new vscode.MarkdownString("Lima: instance '" + varName + "' of the struct " + struct_name + "'" + "\n\r(autocomplete and press control+spacebar again for get the completions of the members of the structure instance)");

                    //
                    // aling the text
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the variable is not repited?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }

                    //
                    // check if a struct thing
                    //

                    let stpos = new vscode.Position(position.line,0);
                    let endpos = new vscode.Position(position.line, document.lineAt(position.line).text.length);

                    let rngpos = new vscode.Range(stpos,endpos);

                    if (
                        document.getText(rngpos).replace("\r","").trim() == varName + "->"
                    )
                    {
                        let amra = (GetStruct(documment_converted,struct_name))

                        let amr = amra.split("\n")

                        let bef_cp = snipped_count;

                        snipped_count = -10;

                        for (let index2 = 0; index2 < amr.length; index2++) {
                            let element = amr[index2];
                            
                            //developOut.appendLine(element);

                            if (
                                element.trim() == "var"
                            ) {
                            
                                var class_documentation = "";
                                
                                if (
                                    amr[index2 - 3].trim() == "**/"
                                )
                                {
                                    let PopIndex = index2;

                                    index2 -= 4;

                                    while (amr[index2].trim() != "/**")
                                    {
                                        class_documentation = amr[index2].trim().replaceAll("*","") + "\n\r" + class_documentation
                                        index2--;
                                    }

                                    index2 = PopIndex;

                                    class_documentation = "" + class_documentation + ""
                                }

                                let membName = amr[index2 + 1].trim()

                                //
                                // create the completion item
                                //
                                let completiona = new vscode.CompletionItem(membName, vscode.CompletionItemKind.Field);
                                completiona.insertText = new vscode.SnippetString(membName);
                                completiona.documentation = new vscode.MarkdownString(( class_documentation == "" ? ("Lima: struct member '" + membName + "' of the instance '" + varName+ "' of the struct '" +struct_name + "'" ) : "") + class_documentation);

                                //
                                // aling the text
                                //
                                completiona.sortText = snipped_count.toString();

                                //
                                // the variable is not repited?
                                //
                                if (!completions.some(item => item.label === completiona.label)) {
                                    completions.push(completiona);
                                    snipped_count--;
                                }
                            }
                        }
                        snipped_count = bef_cp
                    }
                }
                else if (
                    lineText.trim().startsWith("collection<class ")
                )
                {
                    in_class = true;
                }
                else if 
                (
                    lineText.trim() == "section"
                )
                {
                    in_section = true;
                }
                else if (
                    lineText.trim() == "popback"
                )
                {
                    in_section = false;
                }
                else if (
                    lineText == "collection<end function>"
                )
                {
                    in_function = false;
                }
                else if (
                    lineText.startsWith("message ")
                )
                {
                    in_msg = true;
                }
                else if (
                    lineText == "@structure"
                )
                {
                    in_struct = true;
                }
                else if (
                    lineText == "[endmsg]"
                )
                {
                    in_msg = false;
                }
                else if (
                    lineText == "}"
                )
                {
                    if (
                        in_struct
                    )
                    {
                        in_struct = false;
                    }
                    else if (
                        in_class
                    )
                    {
                        in_class = false;
                    }
                }
                else if (lineText.trim().startsWith("collection<new class?") && adecuate)
                {
                    let rrreeerr = lineText.trim().substring(21, lineText.length - 1)

                    let split = rrreeerr.split(" ");

                    let varName = split[1];

                    var class_documentation = "";

                    if (
                        rt_doc[i - 1].trim() == "**/"
                    )
                    {
                        let PopIndex = i;

                        i -= 2;

                        while (rt_doc[i].trim() != "/**")
                        {
                            class_documentation = rt_doc[i].trim().replaceAll("*","") + "\n\r" + class_documentation
                            i--;
                        }

                        i = PopIndex;

                        class_documentation = "" + class_documentation + ""
                    }

                    //
                    // create the completion item
                    //
                    let completion = new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable);
                    completion.insertText = new vscode.SnippetString(varName);
                    completion.documentation = new vscode.MarkdownString(( class_documentation == "" ? ("Lima++: instance " + varName + " of the class '" + split[0] + "'") : "") + class_documentation);

                    //
                    // aling the text
                    //
                    completion.sortText = snipped_count.toString();

                    //
                    // the variable is not repited?
                    //
                    if (!completions.some(item => item.label === completion.label)) {
                        completions.push(completion);
                        snipped_count--;
                    }

                    let popi = i;

                    i = 0;
                    while (rt_doc[i].trim().trimEnd() != ("collection<class " + split[0] + ">"))
                        i++;

                    i += 2;

                    
                    let class_body = "";

                    let blocks_number = 1;

                    while (blocks_number != 0) {

                        if (
                            rt_doc[i].trim() == "}"
                        )
                        {
                            blocks_number--;
                        }
                        else if (
                            rt_doc[i].trim() == "{"
                        ) {
                            blocks_number++;
                        }

                        developOut.appendLine(rt_doc[i].trim());
                        class_body += rt_doc[i].trim() + "\n";
                        i++;
                    }

                    //
                    // check if a struct thing
                    //

                    let stpos = new vscode.Position(position.line,0);

                    let rngpos = new vscode.Range(stpos,position);

                    let laeg = document.getText(rngpos).replace("\r","").trim();

                    if (
                        laeg.endsWith("collection<instance;class?" + split[0] + ";" + split[1] + ";")
                    )
                    {
                        let class_body_arr = class_body.split("\n");

                        let bef_cp = snipped_count;

                        snipped_count = -10;

                        for (let aa = 0; aa < class_body_arr.length; aa++) {
                            const element = class_body_arr[aa];

                            if (
                                element.trim().startsWith("collection<function ")
                            )
                            {
                                let emr = element.trim().substring(20, element.trim().length - 1)

                                
                                let params = "<";

                                aa += 2;

                                while (class_body_arr[aa].trim() != ")")
                                {
                                    var mm = class_body_arr[aa].trim();
                                    if (
                                        mm.startsWith("collection<param ")
                                    )
                                    {
                                        params += "a,"
                                    }
                                    aa++;
                                }

                                params = params.substring(0,params.length - 1);

                                params += ">";

                                params = ">(->)" + params;

                                if (
                                    params == ">(->)>"
                                )
                                {
                                    params = ">(->)<>"
                                }

                                //
                                // create the completion item
                                //
                                let completiona = new vscode.CompletionItem(emr, vscode.CompletionItemKind.Method);
                                completiona.insertText = new vscode.SnippetString(emr + params);
                                completiona.documentation = new vscode.MarkdownString("Lima++: method '" + emr + "' of the class '" + split[0] + "'" );

                                //
                                // aling the text
                                //
                                completiona.sortText = snipped_count.toString();

                                //
                                // the variable is not repited?
                                //
                                if (!completions.some(item => item.label === completiona.label)) {
                                    completions.push(completiona);
                                    snipped_count--;
                                }
                            }
                        }

                        snipped_count = bef_cp;
                    }
                    i = popi;


                    popi = i;

                    i = 0;
                    while (rt_doc[i].trim().trimEnd() != ("collection<class " + split[0] + ">"))
                        i++;

                    i += 2;

                    
                    class_body = "";

                    blocks_number = 1;

                    while (blocks_number != 0) {

                        if (
                            rt_doc[i].trim() == "}"
                        )
                        {
                            blocks_number--;
                        }
                        else if (
                            rt_doc[i].trim() == "{"
                        ) {
                            blocks_number++;
                        }

                        developOut.appendLine(rt_doc[i].trim());
                        class_body += rt_doc[i].trim() + "\n";
                        i++;
                    }

                    class_body = GetClass(documment_converted,split[0])

                    if (
                        laeg.endsWith(varName + "->")
                    )
                    {
                        let class_body_arr = class_body.split("\n");

                        let bef_cp = snipped_count;

                        snipped_count = -10;

                        for (let aa = 0; aa < class_body_arr.length; aa++) {
                            const element = class_body_arr[aa];

                            if (
                                element.trim().startsWith("declare var<")
                            )
                            {
                                let emr = element.trim().substring(12, element.trim().indexOf(">"))

                                            
                                var class_documentation = "";

                                if (
                                    class_body_arr[aa - 1].trim() == "**/"
                                )
                                {
                                    let PopIndex = aa;

                                    aa -= 2;

                                    while (class_body_arr[aa].trim() != "/**")
                                    {
                                        class_documentation = class_body_arr[aa].trim().replaceAll("*","") + "\n\r" + class_documentation
                                        aa--;
                                    }

                                    aa = PopIndex;

                                    class_documentation = "" + class_documentation + ""
                                }

                                //
                                // create the completion item
                                //
                                let completiona = new vscode.CompletionItem(emr, vscode.CompletionItemKind.Field);
                                completiona.insertText = new vscode.SnippetString(emr);
                                completiona.documentation = new vscode.MarkdownString((class_documentation == "" ? ("Lima++: field '" + emr + "' of the class '" + split[0] + "'" ) : "") + class_documentation);

                                //
                                // aling the text
                                //
                                completiona.sortText = snipped_count.toString();

                                //
                                // the variable is not repited?
                                //
                                if (!completions.some(item => item.label === completiona.label)) {
                                    completions.push(completiona);
                                    snipped_count--;
                                }
                            }
                        }

                        snipped_count = bef_cp;
                    }
                    i = popi;

                }
            }

            //
            // return all completions
            //
            return completions;
        }
    });

}

exports.activate = activate;