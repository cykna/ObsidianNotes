When working with arrays, usually we will want to read/write data not on the actual start of the array, but on the middle and going up to some location. For example, on the [web](../Concepts/Backend) we got tokens for a lot of things, one of them is authorization. People on the web generally make it like `Bearer <TOKEN_CONTENT>`. The thing is, how would we then read the Token content without needing to do something too complex?
As Strings are a type of array, we can slice it. This means that we will [point](./Pointer.md) to some specific part on that [array](../DataStructures/Array.md) and give it a length that it can read. It can be understood like
```c
struct SlicePtr {
	void* ptr;
	usize_t len;
}
```
Where in rust, something like: `arr[5..12]` would then generate a ```SlicePtr {arr+5, 12-5}```.  Then a slice can be called as well as a 'view' because it does not create new contents, instead, just limits what can be seen/written based on a offset and a length. This is then, dynamically-sized, which in rust is not permitted, so we reference it, and thus get something like `&[T]` .
A slice can have all the methods an array can have since it's a view to some, but then it will operate only on the parts it can see.
A slice can be a view to anything, but it will depend on what you'll be working if. Generally in high level functions, such as Javascript, a [string ](./Strings/String) can yes be sliced, for example using `str.slice()`, but not necessarily it will because in js strings are immutable, so it might create a new string which contains the sliced content.
# Examples
Some usages of slices, are when we for example want to read something on a vector, and let's say we are paginating the vector, so applying [Pagination](../Algorithms/Pagination.md) to it. And each page has about 32 elements. What we can do is, to get the nth page, return a view to it, so, it can be like
```rust

const PAGE_SIZE:usize = 32;
fn retrieve_page(n:usize, total:&Vec<Thing>) -> &[Thing] {
	&total[PAGE_SIZE*n..(PAGE_SIZE+1)*n]
}
```
So the Nth page, contains 32 elements, and is a view to the vector. So when reading/writing from it, what we will be doing is to read/write based on that address, so when reading the 5th page at index 0, we read in fact the 160th element.