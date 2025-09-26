A RingBuffer is a structure that is simply a buffer as another one but it's read/write operations happens in a circular way, thus, it can be called Circular Buffer as well. When talking about 'circular', we mean that the contents are clamped to the limits of the buffer instead of overflowing, thus, `0..len-1` in a conventional [[Array]] or any other structure that is buffer like, such as [[Vector|vectors]] and [[Slice|slices]]. The means that, supposing a buffer of length N, if on reading on index M, where M > N , we round that down to the bounds of `0..N-1`. That can be made with 2 kinds of operations: Modulus and [[BitOperation|AND]]. Here, the implementation will be made focusing on the AND implementation and the code written is in typescript. To start working with ring buffers, we need at first, create a normal array:

```ts
const buffer = [];
```

This array can be understood as the buffer. To start operating with it, we might want work with classes, so we can wrap it

```ts
export class RingBuffer<T> {
	buffer: Array<T> = [];
	constructor(private readonly capacity: number){
		if((capacity & capacity-1) != 0) throw new Error("Number must be power of 2");
	}
}
const buffer = new RingBuffer<number>(128);
```

The capacity must be known ahead of time to know the bounds of the buffer, thus we can safely read/write the data into it. As said earlier, the implementation will use AND operations to do the clamping, so to assert it happens correctly, we must make the capacity be a power of 2, the reason is found when we see the binary representation of the numbers:

|P|Binary|
|---|---|
|1|1|
|2|10|
|4|100|
|8|1000|
|16|10000|
|32|100000|
|64|1000000|

The pattern is that on a number P which is power of 2, we have a number whose representation is a single bit 1 followed by N zeros, were `2^N = P`, thus, the binary representation of P-1 can be saw as

|P|P-1|Binary|
|---|---|---|
|1|0|0|
|2|1|1|
|4|3|11|
|8|7|111|
|16|15|1111|
|32|31|11111|
|64|63|111111|

Then we know that a number M is power of 2 when `M & (M-1) == 0`, since no bits will be the same. Going back to the ring buffer, this way we can assert that on doing some operation at an index I, the value written is in bounds, so, for a buffer of capacity 4, we mask it with 3, and on inserting at index 9, we instead make the operation at `9 & 3`, or `1001 & 0111 = 0001` which is 1, what is what we expected, since the capacity is 4, we write from 0..3 in a zero-index array, then, at 4, we would write on the index 0, at 8, the same, and at 9, at the index 1. This is why it's a 'ring', because after the end, there's the beginning of the buffer. This can be written as the following:

```ts
export class RingBuffer<T> {
  private buffer: Array<T>;
  private readonly cap: number; //the actual value used to making
  private write_idx = 0; //the value used to write on the buffer on using a 'push' method
  protected size: number; //the number of elements written
  constructor(size: number) {
    if (size > 0 && (size & (size - 1)) != 0) throw new Error("Size must be a power of 2");
    this.cap = size - 1;
    this.buffer = new Array(size);
    this.size = 0;
  }

  push_circular(value: T): T | undefined {
    const next = this.write_idx + 1 & this.cap; //calculates the next index to write.
    const old = this.buffer[this.write_idx];
    this.buffer[this.write_idx] = value;
    this.write_idx = next;
    if(this.size <= this.cap) ++this.size;
    return old;
  }
  get_at(index:number){
	  return this.buffer[index & this.cap];
  }
}
```

A push method can be implemented as the above. The calculation of the next index is pretty simple as you saw there. What happens is that was said before, we increase the index, and apply the mask which will assert it's <= this.cap, then, the same thing can be applied to read operations. Then, when having to implement removal of elements, if we 'remove_front' we can simply do the same logic, have an index, read it, increase it and apply the mask, which can be understood as:

```ts
export class RingBuffer<T> {
	private read_idx = 0;
	...
	pop_front(){
	    const data = this.buffer[this.read_idx++];
	    this.read_idx &= this.cap;
	    this.size--;
	    return data;
	  }
}
```

If you don't understand this `const data = this.buffer[this.read_idx++];`, it can be understood as: 'index buffer at this.read_idx, and then increases it', the difference in js from `variable++` to `++variable`, is that `variable++` returns the current value of the variable, and then increases it's value, and `++variable` increases it and then returns it's current value, so what this pop_front is doing is reading at the current position of `read_idx` and increasing it, later it applies the mask (&= operator in JavaScript is equivalent as v = v & rhs) . This data structure can be used in [[Queue|queues]] for example instead of a [[LinkedList|linked list]], but the problem is that as data is being added, the old values go being replaced by new ones. This should not be a problem if we are talking about something which writes and reads data fast and doesn't need to store data for so long, since the buffer will never grow. The full code I've implement is the below, note that it might and probably contains bugs, but it has the core idea of how a ring buffer works:

```ts
/** A Ring buffer with a power of 2 size */
export class RingBuffer<T> {
  private buffer: Array<T>;
  private readonly cap: number;
  private write_idx = 0;
  private read_idx = 0;
  protected size: number;
  constructor(size: number) {
    if (size > 0 && (size & (size - 1)) != 0) throw new Error("Size must be a power of 2");
    this.cap = size - 1;
    this.buffer = new Array(size);
    this.size = 0;
  }

  /** Inserts the given `value` at the end of this buffer. If it would overflow, doesn't push and returns and error with the value back */
  push(value: T): boolean {
    if(this.size <= this.cap) {
      this.buffer[this.write_idx++] = value; this.size++;
      return false;
    }
    return true;
  }

  /** Gets the value on the provided `index` returning to the start if it overflows. This is circular so a RingBuffer of capacity 4, being indexed at 20, will have its values mapped in range of 0..3.*/
  get_at(index: number): T | undefined {
    return this.buffer[index & this.cap];
  }

  /** Push the given `value` in a circular way, if the content would overflow, then it will be written from the start.*/
  push_circular(value: T): T | undefined {
    const next = this.write_idx + 1 & this.cap;
    const old = this.buffer[this.write_idx];
    this.buffer[this.write_idx] = value;
    this.write_idx = next;
    if(this.size <= this.cap) ++this.size;
    return old;
  }

  /** Retrieves how many elements this buffer can handle */
  capacity() {
    return this.cap + 1;
  }
  /** Retrieves how many elements were written on this buffer*/
  length() {
    return this.size;
  }
  /** Retrieves the value on the front. Note that calling this on a for loop might cause an infinite loop since this goes back to the beggining on reaching the end */
  pop_front(){
    const data = this.buffer[this.read_idx++];
    this.read_idx &= this.cap;
    this.size--;
    return data;
  }
  /** Retrieves the last element of the buffer and removes it*/
  pop_back(){
    this.write_idx--;
    this.write_idx &= this.cap;
    this.size--;
    return this.buffer[this.write_idx];
  }
  /** Retrieves an iterator over all the elements on this Buffer */
  *iter(){
    yield* this.buffer;
  }
  /*Retrieves an iterator that dequeues the values on iterating. Note that it only iterates until the written values.
  Even though this is a ring buffer, it only yields until the size. If some was popped, then it won't be shown*/
  *drain(){
    while(this.read_idx < this.size) {
      yield this.buffer[this.read_idx++];
    }
    this.read_idx = 0;
  }
}
```