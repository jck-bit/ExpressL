import Parser from './frontend/parser.ts'
import {evaluate} from './runtime/interpreter.ts'
import Environment from "./runtime/environments.ts"
import { createGlobalEnv } from './runtime/environments.ts';

// repl()

run("./test.txt")

async function run(filename: string){
    const parser = new Parser()
    const env = createGlobalEnv()

    const input = await Deno.readTextFile(filename)
    const program = parser.produceAST(input)
    const result = evaluate(program, env)
    // console.log(result)
}

// async function  repl() {
//     const parser = new Parser()
 //   const env = createGlobalEnv()

//     console.log("\nRepl v0.1");
//     while (true) {
//         const input =  prompt(">> ")

//         //check for no user input or exit keyword       
//         if (!input || input.includes("exit")) {
//             Deno.exit(1);
//         }   

//         //produce AST from the source code
//         const program = parser.produceAST(input)
//         const result = evaluate(program, env)
//         // console.log(result)
//     }  
// }