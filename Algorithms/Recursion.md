Recursion is occurs when a something uses itself on its definition, for example, with mathematical functions:
$f(x) = 1 + f(x-1)$ 
This function f, on it's definition, calls itself, then, it's considered a recursive function. That can be written in it's code format with the following:
```rust
fn f(n:i32) -> i32{
	1 + f(n-1)
}
```
But recursion can appear in other situations than simply function calls, for example, let's say the following rule:
$$0 \in N$$ $$\forall n \in N, n+1 \in N$$
Then, this rule is recursive as well, because it uses itself to determine that $n \in N$ .
Going back to programming, one kind of data structure that is recursive are [[LinkedList|linked lists]] and [[Trees|trees]], for example:
```rust
struct LinkedList<T> {
	next: LinkedList,
	value: T
}
```
This struct has as some of its fields, itself, being obligatory to it exists. That leads us to that, when creating, we need to create an infinite amount of linked lists, which would require as well, infinite ram. So, one of the problems of recursion in general is that we MUST have some way to determine where to end, because if not, the task won't finish. That condition is called Base case, which is some scenario that will not use recursion to produce some value, then, when reached, will stop the execution.
It can be understood with the way we define $N!$, it can be defined as
$$N! = 
\begin{cases}{1, \text{ if } N = 0 \\[4pt]
N \cdot (N-1)!, \text{ if } N > 0}\end{cases}$$ Then we can write this function with rust the following way:
```rust
fn fac(n:u32) -> u32 {
	if n ==0 {
		1
	}else {
		n * fac(n-1)
	}
}
```

For the linked list struct, a solution is that, a Node that doesn't point to another Node, so, the structure would be
```rust
struct LinkedList<T> {
	next: Option<Box<LinkedList>>,
	value: T
}
```
The reason why a [[Pointer]] is used it's because its size on the memory is `usize`, so when compiling the code, the compiler knows how many [[Bytes]] to allocate. If not, we would end up with the same recursion problem of infinite memory being required.

## Usages
When working with recursive data structures, we can do use recursion as a way to iterating over it, but depending on the way it's executed, it might not be as fast as some non-recursive formula and or iterations. The thing is that due to it's nature, recursion is almost never [[Big O Notation|O(1)]], so, for example, Fibonnaci, it can be written in rust with the following:
```rust
pub fn fib_naive(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fib_naive(n - 1) + fib_naive(n - 2),
    }
}```
Which will lead us to an "exponential" growth.
When we run the following code:
```rust
pub fn fib_naive(n: u64, inc: &mut usize) -> u64 {
    *inc += 1;
    match n {
        0 => 0,
        1 => 1,
        _ => fib_naive(n - 1, inc) + fib_naive(n - 2, inc),
    }
}

fn main() {
    let mut index = 0;
    fib_naive(20, &mut index);
    println!("Fib naive executed {index} times");
}
```
we have that, on finalizing, we will have the following output:
```
cargo run    
   Compiling fib v0.1.0 (~/programming/notes/fib)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.29s
     Running `target/debug/fib`
Fib naive executed 21891 times
```

which is terrible(obs: both on optimized and unoptimized versions of the code, rust still executes the same amount of 21891 function calls).  Since each function call generates a new [[StackFrame|stack frame]], we are creating about 22.000 stack frames,  which then can lead us to some [[StackOverflow|stack overflow]] error. So, we can have some ways to make it better, one of the ways is by [[Memoization|memoizing]] the data to don't call it over and over again to recompute the same values, but, let's focus on the most performant options, which would be O(1).
If we look up on some equivalents for the Fibonnaci series, we find the following formula which uses Golden Ratio to calculate it:
$$L(N) = (\frac{(1+\sqrt5}2)^N + (\frac{1-\sqrt5}2)^N $$
Which can be written in rust as:

```rust
fn fib(n:u64) -> u64 {
	const RATIO = (1.0 + (5.0).sqrt()) * 0.5;
	const NEG_RATIO = (1.0 - (5.0).sqrt()) * 0.5;
	let n = n as f64;
	(RATIO.powf(n) + NEG_RATIO.powf(n)) as u64
}
```

Now, we specify a constant amount of instructions to do, which does categorize this implementation as O(1). Note that the `const` values are created once during compile time.
Todo: More examples of recursion, such as trees