export type NodeType = 

      //Statements
      | "Program" 
      | "VarDeclaration"
      | "FunctionDeclaration"
      | "IfStatement"
      | "ForStatement"
      | "TryCatchStatement"
      
      | "StringLiteral"

      //literals

      | "Property"
      | "ObjectLiteral"
      | "MemberExpr"
      | "CallExpr"

      //Expressions
      | "NumericLiteral"
      | "AssignmentExpr"
      | "Identifier"
      | "BinaryExpr";
      


export interface Stmt {
    kind: NodeType;
}

export interface Program extends Stmt {
    kind: "Program";
    body: Stmt[];
}


export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    
    constant: boolean;
    identifier: string;
    value?: Expr; //the value can also be undefined e.g let x; ---> undefined
}


export interface FunctionDeclaration extends Stmt {
    name: any;
    kind: "FunctionDeclaration";
    parameters: string[];
    body: Stmt[];
   // async: boolean;

}

export interface Expr extends Stmt {
    kind: NodeType;
}

export interface AssignmentExpr extends Expr {
    node: Identifier;
    kind: "AssignmentExpr"
    assigne: Expr;
    value: Expr;
}

export interface BinaryExpr extends Expr {
    kind: "BinaryExpr";
    left: Expr;
    operator: string;
    right: Expr;
}

export interface CallExpr extends Expr {
    kind: "CallExpr";
    caller: Expr;
    args: Expr[];
}

export interface MemberExpr extends Expr {
    kind: "MemberExpr";
    object: Expr;
    property: Expr;
    computed: boolean;
    operator: string; //it needs to be of type binary operator
}

export interface Identifier extends Expr {
    kind: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral";
    value: number
}

export interface Property extends Expr {
    kind: "Property";
    key: string;
    value?: Expr;
}

export interface ObjectLiteral extends Expr {
    kind: "ObjectLiteral";
    properties: Property[];
}


export interface ForStatement extends Stmt {
    kind: "ForStatement";
    init: VarDeclaration;
    test: Expr;
    update: AssignmentExpr;
    body: Stmt[];
  }

  export interface IfStatement extends Stmt {
    kind: "IfStatement";
    test: Expr;
    body: Stmt[];
    alternate?: Stmt[];
  }
  
  export interface TryCatchStatement extends Stmt {
    kind: "TryCatchStatement";
    body: Stmt[];
    alternate: Stmt[];
  }

  export interface StringLiteral extends Expr {
    kind: "StringLiteral";
    value: string;
  }