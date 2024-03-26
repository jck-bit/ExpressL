import { CallExpr } from "../../frontend/ast.ts";
import { Identifier, BinaryExpr ,AssignmentExpr, ObjectLiteral} from "../../frontend/ast.ts";
import Environment from "../environments.ts";
import { evaluate } from "../interpreter.ts";
import { RuntimeVal, NativeFnValue, NumberVal, MK_NULL, ObjectVal, FunctionValue } from "../values.ts";

export function eval_identifier(ident: Identifier, env:Environment): RuntimeVal {
    const val = env.lookupVar(ident.symbol)
    return val;
}

export function eval_object_eval(obj:ObjectLiteral, env:Environment):RuntimeVal {

  const object = {type:"object", properties: new Map()} as ObjectVal;
  for (const{key, value} of obj.properties) {
    const runtimeVal = (value == undefined) ? env.lookupVar(key) : evaluate(value, env);

    object.properties.set(key, runtimeVal);
  }

  return object;
}

function eval_numeric_binary_expr(
    lhs: NumberVal,
    rhs: NumberVal,   
    operator: string,
  ): NumberVal {
    let result: number;
    if (operator == "+") {
      result = lhs.value + rhs.value;
    } else if (operator == "-") {
      result = lhs.value - rhs.value;
    } else if (operator == "*") {
      result = lhs.value * rhs.value;
    } else if (operator == "/") {
      
      result = lhs.value / rhs.value;
    } else {
      result = lhs.value % rhs.value;
    }
  
    return { value: result, type: "number" };
}

export  function eval_binary_expr(binop: BinaryExpr, env:Environment): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);
  
    // Only currently support numeric operations
    if (lhs.type == "number" && rhs.type == "number") {
      return eval_numeric_binary_expr(
        lhs as NumberVal,
        rhs as NumberVal,
        binop.operator,
      );
    }
      
    return MK_NULL()
}
  
export function  eval_assignment(node:AssignmentExpr, env:Environment): RuntimeVal {
   if (node.assigne.kind !== "Identifier") {
    throw new Error(`Invalid LHS assinged expression ${JSON.stringify(node.assigne)}`)
   } 
   const varname = (node.assigne as Identifier).symbol;
   return env.assignVar(varname, evaluate(node.value, env) as RuntimeVal)
}

export function eval_call_expr(expr:CallExpr, env:Environment):RuntimeVal {
  const args = expr.args.map(arg => evaluate(arg, env));
  const fn = evaluate(expr.caller, env);

  if (fn.type == "native-fn") {
    const result = (fn as NativeFnValue).call(args, env)
    return result;
  } 

  if (fn.type == "function") {
    const func = fn as FunctionValue;
    const scope = new Environment(func.declarationEnv);
    //creare variables for the parameters
    for (let i = 0; i < func.parameters.length; i++) {
      const varname = func.parameters[i]
      scope.declareVar(varname, args[i], false);
    }
     let result: RuntimeVal = MK_NULL();
    for (const stmt of func.body) {
      result = evaluate(stmt, scope);
    }
    return result;
  }
    throw new Error(`Invalid function call ${JSON.stringify(expr.caller)}`);
}