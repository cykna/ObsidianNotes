When working with data, one thing that we might want to do is have a list of elements, independently of the way it's structured, we want to have elements on a list. The first thing we can think of is using an [[Array]] but, if the content size is not known during runtime, we cannot simply store it on a array, since, they got fixed size.
To manipulate something like this then, we must allocate data during runtime, thus, we think firstly on rely on top of things like [[Heap|heap]] allocation. That's exactly the way Vectors work.
Vectors are dynamic sized arrays, then, it's correct to assume that they do allocate things on heap, more precisely, they pre-allocate an specific amount of bytes required to start working.
Let's say the following: 
```rust
fn main(){
	let mut vec = Vec::with_capacity(4);
	vec.push(5);
	vec.push(40);
	vec.push(60);
	vec.push(80);	
}
``` 

In rust and in others languages, the method push is used to append the data at the end of the inner array. It can be understood in C, like the following:
```c

int main(){
	void* vec = malloc(sizeof(int)*4);
	int len = 0;
	vec[len++] = 5;
	vec[len++] = 40;
	vec[len++] = 60;
	vec[len++] = 80;
}

```
The thing is that when the content pushed tries to overflow, which is categorized by, trying to add an element when the array is fulfilled, we before pushing it at the end, we allocate more memory for the array so we can safely insert it.
```c
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

struct IntVec {
  uintptr_t len;
  uintptr_t cap;
  int* array;
};

struct IntVec createWithCapacity(int capacity) {
  struct IntVec out;
  out.cap = capacity;
  out.len = 0;
  out.array = malloc(sizeof(int) * capacity);
  return out;
}

void grow(struct IntVec* vec) {
  vec->array = realloc(vec->array, vec->cap * 2);
  vec->cap *= 2;
}

void push(struct IntVec* vec, int data) {
  
  if(vec->len == vec->cap) grow(vec);
  vec->array[vec->len++] = data;
}

int main(){

  struct IntVec vec = createWithCapacity(4);
  push(&vec, 5);
  push(&vec, 24);
  push(&vec, 29);
  push(&vec, 24);
  push(&vec, 28);

  for(int i = 0; i < vec.len; i++){
    printf("%d\n", vec.array[i]);
  }
  
}
```

The example code above exemplifies at a basic level a vector and how it simply reallocates memory to support more data. The implementation if a Vector in rust doubles the capacity, but it's not necessarily a rule for all the implementations. For that reason, a vector insertion at any index, as well as finding a content at any index, is [[Big O Notation|O(1)]], as long as the write overwrites the content.
For example `vec->array[5] = 10;` is O(1), but the desired is to insert 10 at index 5, and what is after it, increases the index, thus, moving it, left, the operation is now O(N) where $N = Len(arr) - idx$. 