import { NumberVal, RuntimeVal, StringVal } from "./values.ts";
import { BinaryExpr, NumericLiteral, Program, Stmt, Identifier,WhenStatement, VarDeclaration, AssignmentExpr, ObjectLiteral, CallExpr, FunctionDeclaration, ForStatement,  TryCatchStatement , StringLiteral} from "../frontend/ast.ts";
import Environment from "./environments.ts";
import { eval_for_statement, eval_when_statement, eval_program, eval_try_catch_statement, eval_var_declaration } from "./eval/statements.ts";
import { eval_identifier, eval_binary_expr, eval_assignment, eval_object_eval } from "./eval/expressions.ts";
import { eval_call_expr } from "./eval/expressions.ts";
import { eval_function_declaration } from "./eval/statements.ts";


export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
    switch (astNode.kind) {
      case "NumericLiteral":
        return {
          value: ((astNode as NumericLiteral).value),
          type: "number",
        } as NumberVal;
        case "StringLiteral":
          return { value: ((astNode as StringLiteral).value), type: "string" } as StringVal;
      case "ObjectLiteral":
          return eval_object_eval(astNode as ObjectLiteral, env);
      case "CallExpr":
          return eval_call_expr(astNode as CallExpr, env);
      case "Identifier":
        return eval_identifier(astNode as Identifier, env);
      case "BinaryExpr":
        return eval_binary_expr(astNode as BinaryExpr, env);
      case "AssignmentExpr":
        return eval_assignment(astNode as AssignmentExpr, env);
      case "Program":
        return eval_program(astNode as Program, env);
      case "VarDeclaration":
        return eval_var_declaration(astNode as VarDeclaration, env);
      case "FunctionDeclaration":
        return eval_function_declaration(astNode as FunctionDeclaration, env);
        case "WhenStatement":
            return eval_when_statement(astNode as WhenStatement, env);
        case "ForStatement":
            return eval_for_statement(astNode as ForStatement, env);
        case "TryCatchStatement":
          return eval_try_catch_statement(env, astNode as TryCatchStatement);
      // Handle unimplimented ast types as error.
      default:
        console.error(
          "This AST Node has not yet been setup for interpretation.",
          astNode,
        );
        Deno.exit(0);
    }
}
