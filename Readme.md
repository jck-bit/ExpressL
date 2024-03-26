# ExpressL custom scripting Language
 I made this compiler in typescript, i imagine building it in Rust or C, right now am learning Rust, I might consider remaking the compiler in it maybe in the future.

## Hello World Example

To print "hello world" in ExpressL, use the `print()` function:

```typescript
print("hello world")
```

## Variable Declaration

Variables in ExpressL are declared using the `let` and `const` keyword followed by the variable name and its initial value:  Variables declared with const cannot be redefined:

``` typescript
let foo = 45;
const bar = 56;
let foobar = foo + bar;
print(foobar)
```

## Function Definition and Invocation

Functions in ExpressL are defined using the `@fn` keyword followed by the function name and its body enclosed in curly braces {}. You can call the function by using its name followed by parentheses ().

```typescript
@fn hello() {
    print("my new function")
}

hello()

```

## Error Handling 

Error handling in ExpressL uses  attempt...rescue syntax. You can wrap code in an attempt block and catch errors with a rescue block.

```typescript
@fn try(x, y) {
   attempt {
        let result = x + y;
        print(result)
   } rescue {
        print(error)
   }
}

print(try(10, 5))

```

## conditional statements

Conditions in ExpressL use when...otherwise syntax. provide  conditions using `when` keyword and provide an alternative using the `otherwise` keyword

```typescript
when (true){
    print("This is my first conditional statement")
} otherwise {
    print("code to execute if condition is false")
}
```