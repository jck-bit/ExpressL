import { MK_BOOL,MK_NUMBER, MK_NULL,MK_NATIVE_FN, RuntimeVal, MK_STRING, StringVal, ObjectVal, FunctionValue, NumberVal } from "./values.ts";

export function createGlobalEnv() {
    
    const env = new Environment();
    //create default global environment
    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);
    env.declareVar("null", MK_NULL(), true);
    

    //define a native method
    env.declareVar("print", MK_NATIVE_FN((args, scope) =>{
        console.log(...args);
        return MK_NULL();
    }), true)
    
    env.declareVar("error", MK_NULL(), false);

    env.declareVar("strcon", MK_NATIVE_FN((args,) => {
        let res = '';

        for (let i = 0; i < args.length; i++) {
            const arg = args[i] as StringVal;

            res += arg.value;
            console.log(res)
        }

        return MK_STRING(res);
    }), true)

    env.declareVar("format", MK_NATIVE_FN((args) => {
        const str = args.shift() as StringVal;

        let res = '';

        for (let i = 0; i < args.length; i++) {
            const arg = args[i] as StringVal;

            res = str.value.replace(/\${}/, arg.value);
        }

        if (!args[0]) throw "Second parameter in \"format\" missing."

        return MK_STRING(res);
    }), true)

    let timeoutDepth = 0;
    let shouldExit = false;


    env.declareVar("setTimeout", MK_NATIVE_FN((args) => {
        const func = args.shift() as FunctionValue;
        const time = args.shift() as NumberVal;
        timeoutDepth++;
        setTimeout(() => {
            eval_function(func, []); // No args can be present here, as none are able to be given.
            timeoutDepth--;
            if(timeoutDepth == 0 && shouldExit) {
                Deno.exit();
            }
        }, time.value);
        return MK_NULL();
    }), true);    
    
    
    return env;
}

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;


    constructor(parentENV?: Environment) {
        const global = parentENV ? true : false;
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVar(varname:string, value:RuntimeVal, constant:boolean) {
        if (this.variables.has(varname)) {
            throw new Error(`Variable ${varname} already declared`);
        }
        this.variables.set(varname, value);
        if (constant) {
            this.constants.add(varname);
        }
        return value;
    }

    public assignVar(varname:string, value:RuntimeVal) {
        const env  = this.resolve(varname);
        
        //
        if (env.constants.has(varname)) {
            throw `cannot reasign variable ${varname} as it was alraedy declared`
        }
        env.variables.set(varname, value);
        return value;
    }

    public lookupVar(varname:string) {
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }


    public resolve(varname: string): Environment {
        if (this.variables.has(varname)) {
          return this;
        }
    
        if (this.parent == undefined) {
          throw `Cannot resolve '${varname}' as it does not exist.`;
        }
    
        return this.parent.resolve(varname);
      }
}

function eval_function(func: FunctionValue, arg1: never[]) {
  throw new Error("Function not implemented.");
}
