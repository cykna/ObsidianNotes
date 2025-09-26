In general programming, we will have the so called primitives, that are the closest abstraction made from [Bytes](./Bytes.md) possible. These primitives can be a [Buffer](./Buffer.md), Numbers, Boolean, etc.
# Boolean
Starting with boolean, which are the easier ones. The term Boolean is a homage to the British Mathematician George Boole, which have invented the area of boolean algebra. A boolean is referred to something which value is True or False. Which is exactly how bits work. 
On Boolean algebra, and in programming in general, we have operations such as AND, OR and NOT, used to determine the values of some boolean(s) when they interact with each other. In programming these operators are referred as &&, || and ! respectively, so this will talk about them as these operators.
In C, a boolean can be interpreted as anything that is not 0, so a value 5 is understood as true in a `if(5){...}` one of the reasons is that it contains a bit which value is 1 inside (5 in binary = 101). This might not be true for other languages such as Rust, where the type of the value matters and then, wont compile on a type mismatch, even though the logic is right.
When using multiple boolean's we will end up needing some boolean algebra to do so, thus, relying on the AND, OR and NOT operators. 
There's one thing so called truth table, that is worth mention, but won't be discussed here.
Let's say you get 2 boolean's, A and B, and you want that something happens when both are true, this can be made using A && B, which will look if both are true, if so, the resultant boolean is true, otherwise, it's false. With 'otherwise' i mean that if A or B are false, the return will be false. And on this phrase we already have another application. We know that `Let R = A && B` will be True when A and B are true, if some of them is false, it's false, which then is the `||` operator.  To work with something that requires at least one of them, we can use it. Let's say i want to find people who have color blindness or are totally blind, for this we will apply the same logic as `||`operator.  So `Let R = A || B` will be true when A is true, or B is true, or both.
Let's say we want to make something when Both are NOT true, we will end up using `!`, the NOT on programming will flip the value of a boolean. If some is True, !True will be false, if some is False, !False will be true. If i want do something when both are not true, we can do `Let R = !A && !B`. These are the basic usages, if you want something more in depth of boolean, you can look up for the wikipedia at [here](https://en.wikipedia.org/wiki/Boolean_algebra).
By default, in languages a boolean may have 1 byte of memory due to everything working at bytes scale and not bit.
# Integers
We also have numbers on programming, for sure, you might have already played with them. One integer can have any size in bits, an `int` in C has 4 bytes, then 32 bits. Due to this, the numbers have limits, and the way they're interpreted by the [CPU](../Concepts/CPU) determines these. 
In general we will have Signed and Unsigned numbers. Where Signed numbers will use a bit to determine their signal, while the Unsigned ones won't, thus, cannot be negative. For example, let's say an i8 and u8 in rust, both are 1 byte, but their representation is different:

u8 -> 1 Byte fully for data
i8 -> Highest Significant Bit for Signal, rest for data.

The same logic for any other type of number as long as it is a Integer. So a u64 and a i64 will have the same amount of bits, but u64 uses them all for data, and i64 uses the HSB for signal, and 63 for data. This leads an integer of type `uN` where N is a power of 2, >= 8, to have its bounds from `0..(2^N)-1` . The same logic of this rule applies to a signed integer,  but one will have it's bounds limited as `-2^M..(2^M)-1` instead, where $M = N-1$, since the highest bit is used for the signal. 
As we can see, an integer a group of N bytes, the rule of N being power of 2 is NOT obligatory but it's the default pattern. Generally people won't use a u24 to calculate things for example. Anyways, as you can see an Integer is a set of bits in order, which can configure it as a Bit array. For so, we can then use it as in fact, a list of boolean, since each bit is 0 and 1. Let's say we have the following:
`fn open_file(path: &str, flags: u32) -> FileHandle {...}` As an `u32` has size of 32 bits, we can store 32 boolean in it, while still having the cost of 4 bytes only instead of 32 if on using a `[bool;32]` .For so we can use bit operations. First of all the first step is to define what are those flags, let's that we will use by now, only 1 byte. We can represent the flags as: `[READ,WRITE,APPEND,MEMORY_ALLOCATED]` then we have 4 bits being used, based on so, we know that a number which in binary representation is `0b1001` will open the file using the flags read and memory allocated. To determine the values we can create masks, in rust it would be something like:
```rust
const READ_MASK:u32 = 1 << 3;
const WRITE_MASK:u32 = 1 << 2;
const APPEND_MASK:u32 = 1 << 1;
const MEMORY_ALLOCATED_MASK:u32 = 1 << 0;
```
The `<<`operator shifts the bits of the Lhs by the rhs. Well, explaining in a simpler way, READ_MASK will be a number which is `0b1` with the bits shifted to the left by 3, so `0b1000`. WRITE_MASK follows the same rule, but it will be `0b100`, APPEND_MASK will be `0b10` and MEMORY_ALLOCATED_MASK `0b1`.
So when using the open_file function, we can call it like `open_file(some_path, READ_MASK | MEMORY_ALLOCATED_MASK)`. The `|` operator follows the same rule as `||` for boolean, but at bit level. It gets the bits of the lhs and the rhs, and if some is 1, the resultant will be one, for example: 

| Left hand Side  | 0b110001 |
| --------------- | -------- |
| Right Hand Side | 0b001010 |
| Result          | 0b111011 |

To check if a numeric have some flag, we use the AND operation. Since all other bits are 0, the resultant value will be 0 if it has got the numeric. For example:

| Left Hand Side  | 0b1111 |
| --------------- | ------ |
| Right Hand Side | 0b0100 |
| Result          | 0b0100 |

The result is 0b100 because the right hand side has zeros, so, an AND will return 0 for those bits. This way then we know that the Left Hand Side has that flag. If the result was 0 instead, it would not have.
To remove the flag if there is, we must do 2 operations instead, lets keep with the number 0b1111, and let's say we want to remove its APPEND_MASK, for so we need a number that every bit is 1, to keep the original number, but the bit of APPEND_MASK is 0, as APPEND_MASK contains only 1 bit which value is 1, we can negate that number, then, making it be from 0b0010, 0b1101, and then apply a AND. In rust the NOT operator for bit operation is the same of the one for boolean: '!'. So to remove the flag APPEND_MASK of 0b1111, we make it be `0b1111 & !APPEND_MASK` 
Note that the code provided is not meant to be used in real projects, but instead to only talk about how things are made, if you want to handle bit flags properly in rust, use [bitflags](https://docs.rs/bitflags/latest/bitflags/) instead.
