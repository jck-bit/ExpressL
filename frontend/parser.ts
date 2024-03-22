// deno-lint-ignore-file no-explicit-any
import { ForStatement, IfStatement, MemberExpr, Property, StringLiteral, TryCatchStatement } from "./ast.ts";
import { CallExpr } from "./ast.ts";
import {
  BinaryExpr,
  Expr,
  Identifier,
  NumericLiteral,
  Program,
  VarDeclaration,
  Stmt,
  AssignmentExpr,
  FunctionDeclaration,
  ObjectLiteral
} from "./ast.ts";

import { Token, tokenize, TokenType } from "./lexer.ts";

/**
 * Frontend for producing a valid AST from sourcode
 */
export default class Parser {
  private tokens: Token[] = [];

  /*
   * Determines if the parsing is complete and the END OF FILE Is reached.
   */
  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  /**
   * Returns the currently available token
   */
  private at() {
    return this.tokens[0] as Token;
  }

  /**
   * Returns the previous token and then advances the tokens array to the next value.
   */
  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }
       
  /**
   * Returns the previous token and then advances the tokens array to the next value.
   *  Also checks the type of expected token and throws if the values dnot match.
   */
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      Deno.exit(1);
    }

    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parse until end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  // Handle complex statement types
  private parse_stmt(): Stmt {
    // skip to parse_expr
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      case TokenType.Fn:
        return this.parse_fn_declaraton();
      default:
        return this.parse_expr(); // default to expression statement.
    }
  }

  parse_block_statement(): Stmt[] {
    this.expect(TokenType.OpenBrace, "Opening brace (\"{\") expected while parsing code block.");

    const body: Stmt[] = [];

    while (this.not_eof() && this.at().type !== TokenType.CloseBrace) {
        const stmt = this.parse_stmt();
        body.push(stmt);
    }

    this.expect(TokenType.CloseBrace, "Closing brace (\"}\") expected while parsing code block.");

    return body;
}

parse_for_statement(): Stmt {
  this.eat(); // eat "for" keyword
  this.expect(TokenType.OpenParen, "Opening parenthesis (\"(\") expected following \"traverse\" statement.");
  const init = this.parse_var_declaration();
  const test = this.parse_expr();

  this.expect(TokenType.Semicolon, "Semicolon (\";\") expected following \"test expression\" in \"traverse\" statement.");

  const update = this.parse_assignment_expr();

  this.expect(TokenType.CloseParen, "Closing parenthesis (\"(\") expected following \"additive expression\" in \"traverse\" statement.");

  const body = this.parse_block_statement();

  return {
      kind: 'ForStatement',
      init,
      test,
      update,
      body,
  } as ForStatement;
}
  
parse_if_statement(): Stmt {
  this.eat(); // eat if keyword
  this.expect(TokenType.OpenParen, "Opening parenthesis (\"(\") expected following \"when\" statement.");

  const test = this.parse_expr();

  this.expect(TokenType.CloseParen, "Closing parenthesis (\"(\") expected following \"when\" statement.");

  const body = this.parse_block_statement();

  let alternate: Stmt[] = [];

  if (this.at().type == TokenType.Else) {
      this.eat(); // eat "else"

      if (this.at().type == TokenType.If) {
          alternate = [this.parse_if_statement()];
      } else {
          alternate = this.parse_block_statement();
      }
  }

  return {
      kind: 'IfStatement',
      body: body,
      test,
      alternate
  } as IfStatement;
}

  parse_fn_declaraton(): Stmt {
    this.eat(); //this will eat the fn keyword
    const name = this.expect(
      TokenType.Identifier,
      "Expected identifier name following fn keyword.",
    ).value;

    const args = this.parse_args()
    const params: string [] = [];
    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        console.log(arg)
        throw "Inside Function declaration expected parameters to be of type string"
        
      }
      params.push((arg as Identifier).symbol)
    }
    this.expect(
      TokenType.OpenBrace,
      "Expected Functon body following declaration"
    );
    const body: Stmt[] = [];

    while (this.at().type !== TokenType.EOF && this.at().type !==TokenType.CloseBrace) {
      body.push(this.parse_stmt())
    }
    this.expect(TokenType.CloseBrace, "CloseBrace expected inside function declaration")
    const fn = {
      body,
      name,
      parameters: params,
      kind:"FunctionDeclaration"

    } as FunctionDeclaration

    return fn
  }
  // Handle Variable Declarations
  parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords.",
    ).value;

    if (this.at().type == TokenType.Semicolon) {
      this.eat(); // expect semicolon
      if (isConstant) {
        throw "Must assigne value to constant expression. No value provided.";
      }

      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration.",
    );

    const declaration = {
      kind: "VarDeclaration",
      value: this.parse_expr(),
      identifier,
      constant: isConstant,
    } as VarDeclaration;

    this.expect(
      TokenType.Semicolon,
      "Variable declaration statment must end with semicolon.",
    );

    return declaration;
  }

  // Handle expressions
  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  } 
  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr();

    if (this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_assignment_expr()

      return {value, kind:"AssignmentExpr", assigne:left} as AssignmentExpr
    }

    return left
  }

  private parse_and_statement(): Expr {
    let left = this.parse_additive_expr();

    if (["&&", "|"].includes(this.at().value)) {
        const operator = this.eat().value;
        const right = this.parse_additive_expr();

        left = {
            kind: "BinaryExpr",
            left, right, operator
        } as BinaryExpr
    }

    return left;
}

  private parse_try_catch_expr(): Expr {
    if (this.at().value !== 'attempt') {
        return this.parse_and_statement()
    }

    this.eat();

    const body = this.parse_block_statement();

    if (this.at().value !== 'rescue') throw "\"attemmpt\" statement must be followed by a \"rescue\" statement."

    this.eat();

    const alternate = this.parse_block_statement();

    return {
        kind: "TryCatchStatement",
        body,
        alternate,
    } as TryCatchStatement
}

  private parse_object_expr(): Expr {
    // { prop []}
    if(this.at().type !== TokenType.OpenBrace){
      return this.parse_try_catch_expr()
    }

    this.eat() //advances past the open brace
    const properties = new Array <Property>();

    while (this.not_eof() && this.at().type != TokenType.CloseBrace){
      // {key:val}
      const key = this.expect(TokenType.Identifier, "Object Literal for key expected.").value
      
      if(this.at().type == TokenType.Comma){
        this.eat() // eat the comma
        properties.push({key, kind:"Property", value: undefined} as Property)
        continue;
      }
      //what if they didint add a comma
      // {key}
      else if(this.at().type == TokenType.CloseBrace){
        properties.push({key, kind:"Property"})
        continue;
      }
      // {key: val, key2: val2}

      this.expect(TokenType.Colon, "Expected colon for object literal.")
      const value = this.parse_expr()

      properties.push({key, kind:"Property", value});
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(TokenType.Comma, "Expected comma or closing Bracket following property")
      }
    }
    this.expect(TokenType.CloseBrace, "Expected closing brace for object literal.")
    return {kind:"ObjectLiteral", properties} as ObjectLiteral

  }

  // Handle Addition & Subtraction Operations
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }
      
    return left;
  }

  // Handle Multiplication, Division & Modulo Operations
  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_call_member_expr();

    while (
      this.at().value == "/" || this.at().value == "*" || this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }


    // foo.x()()
    private parse_call_member_expr(): Expr {
      const member = this.parse_member_expr();
  
      if (this.at().type == TokenType.OpenParen) {
        return this.parse_call_expr(member);
      }
  
      return member;
    }
  
    private parse_call_expr(caller: Expr): Expr {
      let call_expr: Expr = {
        kind: "CallExpr",
        caller,
        args: this.parse_args(),
      } as CallExpr;
  
      if (this.at().type == TokenType.OpenParen) {
        call_expr = this.parse_call_expr(call_expr);
      }
  
      return call_expr;
    }
  
    private parse_args(): Expr[] {
      this.expect(TokenType.OpenParen, "Expected open parenthesis");
      const args = this.at().type == TokenType.CloseParen
        ? []
        : this.parse_arguments_list();
  
      this.expect(
        TokenType.CloseParen,
        "Missing closing parenthesis inside arguments list",
      );
      return args;
    }
  
    private parse_arguments_list(): Expr[] {
      const args = [this.parse_assignment_expr()];
  
      while (this.at().type == TokenType.Comma && this.eat()) {
        args.push(this.parse_assignment_expr());
      }
  
      return args;
    }
  
    private parse_member_expr(): Expr {
      let object = this.parse_primary_expr();
  
      while (
        this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket
      ) {
        const operator = this.eat();
        let property: Expr;
        let computed: boolean;
  
        // non-computed values aka obj.expr
        if (operator.type == TokenType.Dot) {
          computed = false;
          // get identifier
          property = this.parse_primary_expr();
          if (property.kind != "Identifier") {
            throw `Cannonot use dot operator without right hand side being an identifier`;
          }
        } else { // this allows obj[computedValue]
          computed = true;
          property = this.parse_expr();
          this.expect(
            TokenType.CloseBracket,
            "Missing closing bracket in computed value.",
          );
        }
  
        object = {
          kind: "MemberExpr",
          object,
          property,
          computed,
        } as MemberExpr;
      }
  
      return object;
    }

  // Orders Of Prescidence
  // assignment
  // object
  // AdditiveExpr
  // MultiplicitaveExpr
  // call
  // member
  // PrimaryExpr

  // Parse Literal Values & Grouping Expressions
  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    // Determine which token we are currently at and return literal value
    switch (tk) {
      // User defined values.
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;

      // Constants and Numeric Constants
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;

      case TokenType.String:
        return {
          kind: "StringLiteral",
          value: this.eat().value,
        }  as StringLiteral

      // Grouping Expressions
      case TokenType.OpenParen: {
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
        ); // closing paren
        return value;
      }

      // Unidentified Tokens and Invalid Code Reached
      default:
        console.error("Unexpected token found during parsing!", this.at());
        Deno.exit(1);
    }
  }
}