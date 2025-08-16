Big O Notation is the way people generally talk about the performance of some piece of code. When working with Big O, we will work actually with a rule that can be applied to a code to measure it, but it doesn't mean that code will always be run slowly or fast. Actually, an optimized code can run bad slow if the machine running it isn't fast enough, while, a non-optimized code can run fast if the machine running it is fast enough for so.
In reality what big o will do estimate how much a code will need to finish based on a input I. For that then we use the 'O' notation. To things don't keep too theoretical, let's suppose the following code:
```rust
///Creates a new Vector with each value following the rule: I * Position, where L is the value provided on the `input` vector and Position it's index on it
fn double_vector(vec: Vec<f32>) -> Vec<f32> {
	vec.iter().enumerate().map(|(index,value)| value * index as f32)
}```
Let's say we executed `double_vector(vec![5.0f32, 10.0, 20.0, 15.0, 12.0, 17.0])`, what will happen is that the code will have to iterate over this [[Vector|vector]] and produce a new one based on it. On this example then, the function inside the map will be executed 6 times, but, lets suppose we create a new vector with 1000 elements, something like `double_vector(random_vector(1000))` it will then execute 1000 times. Then we have a pattern, that is, the code will run the L times to finish, where L is the length of elements of the input vector, thus, we can say that the code is O(L) because, based on L, L operations happen. 
Let's suppose now the following:
```rust
fn arbitrary_calc(vec: Vec<u32>) -> Vec<u32> {
	let mut out = Vec::new();
	for val in vec {
		let mut n = val * 3;
		n += 5;
		out.push(n);
	}
}```
Here we execute an allocation, a multiplication, a sum, and a pushing, then we are executing about O(n * 4) instructions, where `n`is the amount of elements in `vec`. The thing is that on getting bigger and bigger, what will take more effect on the amount of instructions required to finish is `n`, then, we can say the function is still O(n)
Todo: Explain n², n!, log n, n log n, and how to know each