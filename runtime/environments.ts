import { MK_BOOL,MK_NUMBER, MK_NULL,MK_NATIVE_FN, RuntimeVal, MK_STRING, StringVal } from "./values.ts";


export function createGlobalEnv() {
    
    const env = new Environment();
    //create default global environment
    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);
    env.declareVar("null", MK_NULL(), true);
    

    //define a native method
    env.declareVar("print", MK_NATIVE_FN((args, scope) =>{
        console.log(...args)
        return MK_NULL();
    }), true)
    
    env.declareVar("error", MK_NULL(), false);
    
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