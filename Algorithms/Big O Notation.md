Big O Notation is the way people use to talk about the growing of some algorithm. This can be used on performance, memory usage and others, even though talking about these we require more than simply Big O. When working with Big O, we will work actually with a rule that can be applied to a code to measure it, but it doesn't mean that code will always be run slowly or fast. Actually, an optimized code can run slowly if the machine running it isn't fast enough, while, a non-optimized code can run it with not so much problems if the machine running it is fast enough for so.
In reality what big o will do estimate how much a code will need to finish based on an input I, or grow in terms of memory. Here it's being talked mainly about the amount of instructions to finish some algorithm.
For measuring so we use the 'O' notation. To things don't keep too theoretical, let's suppose the following code:
```rust
///Creates a new Vector with each value following the rule: I * Position, where L is the value provided on the `input` vector and Position it's index on it
fn double_vector(vec: Vec<f32>) -> Vec<f32> {
	vec.iter().enumerate().map(|(index,value)| value * index as f32)
}
```

Let's say we executed `double_vector(vec![5.0f32, 10.0, 20.0, 15.0, 12.0, 17.0])`. What's going to happen is that the code will have to iterate over this [[Vector|vector]] and produce a new one based on it. On this example, then, the function inside the map will be executed 6 times, but, lets suppose we create a new vector with 1000 elements. Something like `double_vector(random_vector(1000))` will then execute 1000 times.
Now we can find a pattern! That is: the code will run the L times to finish, where L is the length of elements of the input vector, thus, we can say that the code is O(L) because, based on L, L operations happen. 
Let's suppose now the following:

```rust
fn arbitrary_calc(vec: Vec<u32>) -> Vec<u32> {
	let mut out = Vec::new();
	for val in vec {
		let mut n = val * 3;
		n += 5;
		out.push(n);
	}
}
```

Here we execute an allocation, a multiplication, a sum, and a pushing, then we are executing about O(n * 4) instructions, where `n`is the amount of elements in `vec`. The thing is that on getting bigger and bigger, what will take more effect on the amount of instructions required to finish is `n`, then, we can say the function is still O(n)
## O(N²)
When something is understood as O(n²), that means that the way a given function `f` increases based on the given input is squared, for example:
```rust
fn has_pair_with_sum(nums: &[i32], target: i32) -> bool {
    for i in 0..nums.len() {
        for j in (i + 1)..nums.len() {
            if nums[i] + nums[j] == target {
                return true;
            }
        }
    }
    false
}
```
Supposing we called this function as `has_pair_with_sum(&[10, 20, 4, 13, 7], 20)`, and supposing the worst case where we got to iterate over all the slice, we will have that:
* The code starts running from `0..5` given by the `0..nums.len()`, then, we will run from `1..5` and check, so we will have 4 instructions made.
* On the next we will do `1..5` and `2..5`, which will be more 3
* On the next we will do `2..5` and `3..5` which will be more 2
* On the next we will do `3..5` and `4..5` which will be more 1
* On the next, no more is made
So in the total we will have about 10 instructions made. Well, the pattern understood is that based on a given [[Slice|slice]] with N elements, we will have about 

$$\sum_{k=1}^N k$$
So, on a input of 6 elements, we will have 15 instructions, on 7 instructions, 21, later 28, and so on. The given summary formula can be then rewrote as the following:
$$S = 1 + 2 + 3 .. + N$$
which, when we invert so, it can be rewritten as the following:
$$S = N + (N-1) + (N-2) + (N-3) .. + 2 + 1$$
where S = the total amount of instructions needed to execute on the worst case. Actually on summing both sides, we will have the following formula
$$S = 1 + 2 + 3 .. + N$$
$$S = N + (N-1)+(N-2) .. + 1$$ 
$$ S + S = (N+1) + ((N-1)+2) + ((N-2) + 3) .. + ((N + 1)$$
Which can be simplified to:
$$2S = (N+1)+(N+1)+(N+1)+(N+1)..+(N+1)$$
Where the amount of the [[BinaryExpression|right hand side]] of sums of (N+1) is N, so, we can rewrite it another way like:
$$2S = N(N+1)$$
$$S = N(N+1)/2$$ $$S = (N²+N)/2$$
which contains a N². So, as the amount of inputs increase, this is the order of how much the function will increase. Actually it's `O(N(N+1)/2)`, but as N² is the thing that will start to take more effect on the total amount of instructions needed to finish, we can ignore the others and then write it as simple as `O(N²)`
The same logic follows Big O all around when we talk about `O(log n)` `O(n log n)` `O(n!)`and others.

## Not Necessarily Good
When using [[LinkedList|linked lists]] for example, we find that it's O(1) for insertion, but not necessarily it's a good thing. For insertion on the middle of the list, if not knowing the correct node, it's O(n), because we might traverse all the list to then find the one we want to insert something at. Another problem is that as linked lists are not a contiguous memory block, which then makes it not [[CpuCaching|cache friendly]], which can degrade performance depending on the amount of elements on the list. Depending on the amount of the data, as linked lists use pointers to define the next node, this can cause overhead, which for example, arrays do not have.
That doesn't mean that Big O is 'wrong' but we need to actually consider other things than only it when talking about memory usage and performance. It can, and is used as a parameter but lacks of completeness to determine is some is actually good or not. When talking about performance, in general, it's just going to say how many instructions are required to some algorithm finalize