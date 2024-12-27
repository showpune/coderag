import Parser, { Query } from 'tree-sitter';
import Java from 'tree-sitter-java';
import fs from 'fs';
import { captureRejectionSymbol } from 'events';

const parser = new Parser();
parser.setLanguage(Java);


const folder = "/home/zhiyong/projects/rabbitmq-servicebus/src";
loopFolder(folder);

function loopFolder(folder) {
    var files = fs.readdirSync(folder);
    for (let file of files) {
        // check if file is folder
        if (fs.lstatSync(folder + "/" + file).isDirectory()) {
            loopFolder(folder + "/" + file);
        } else {
            printDeclaration(folder, file);
        }
    }
}


function printDeclaration(folder, file) {
    const javaCode = fs.readFileSync(folder + "/" + file, "utf8");
    const tree = parser.parse(javaCode);

    const searchPattern = `^(RabbitTemplate|RabbitListener|Binding)$`;
    const queryString = `
    (annotation
        name: (identifier) @method-annotation-name
        (#match? @method-annotation-name "${searchPattern}")
    )
    (marker_annotation
        name: (identifier) @class-annotation-type
        (#match? @class-annotation-type "${searchPattern}")
    )        
    (import_declaration
        (scoped_identifier
            name: (identifier) @imported-class    
        )
        (#match? @imported-class "${searchPattern}")
    )
    (local_variable_declaration
        type: (type_identifier) @local-variable-type
        (#match? @local-variable-type "${searchPattern}")
    )
    (field_declaration
        type: (type_identifier) @class-variable-type
        (#match? @class-variable-type "${searchPattern}")
    )
    (method_declaration
        type: (type_identifier) @method-return-type
        (#match? @method-return-type "${searchPattern}")
    ) 
    
    `;
    var query = new Query(Java, queryString);
    var captures = query.captures(tree.rootNode);
    var found = false;
    for (let capture of captures) {
        console.log(capture.name + " " + capture.node.text + " [" + capture.node.startPosition.row + "," + capture.node.startPosition.column + "]" + " [" + capture.node.endPosition.row + "," + capture.node.endPosition.column + "]");
        found = true;
    }
    if (found) {
       console.log("Processing " + folder + "/" + file);
    }
}
