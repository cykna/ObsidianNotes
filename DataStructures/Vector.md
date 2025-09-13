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

The example code above exemplifies at a basic level a vector and how it simply reallocates memory to support more data. The implementation if a Vector in rust doubles the capacity, but it's not necessarily all the vectors apply this rule of doubling the capacity on their implementations.
For that reason, a vector insertion at any index, as well as finding a content at any index, is [[Big O Notation|O(1)]], as long as the write overwrites the content.
For example `vec->array[5] = 10;` is O(1), but the desired is to insert 10 at index 5, and what is after it, increases the index, thus, moving it to the right, the operation is now O(N) where $N = Len(arr) - idx$. 
This is also a way of insertion, but it supposes you shift the content, the insertion where it's O(n) can be called 'overwrite', because you literally are writing data there. To make things easier to understand, the term 'insert' will be used to talk about this kind of insertion where the content after is shifted to the right, and the one that simply writes data will be called 'overwriting'
To implement it we must first understand how do we do the moving of the elements. We know that on an array [5,4,3,2], if we insert 8, at the index 2, it will then become [5,4,8,3,2].
To begin with, let's start with the function definition
```c
void insert(struct IntVec* target, int index, int value) {
	//here, for all values with index I, where I >= param(index), overwrite them at I+1 
}
```
So first let's start with the moving. As we will move data to `I+1` where I = current index, if the content vector doesn't have size enough, it will overflow, so we MUST ensure the vector has capacity for so. 
```c
void insert(struct IntVec* vec, int index, int data) {
  if(vec->len == vec->cap) grow(vec);
  int modifier_index = vec->len;
  while(modifier_index > index) {
    vec->array[modifier_index] = vec->array[modifier_index-1];
    modifier_index--;
  }

  vec->array[index] = data;
}
```
And there it is, now the content is moved and the value is correctly inserted.
As you probably noticed, we must start with values at the length of the vector, because `length == last_pos+1`, due to pointer arithmetic. Then, we move the values from N-1 to N, which is shifting them to the right. And at the index we overwrite with the content we want.
The downside of using this insert method, is that for big amount of data, it will be slow, so other options must be used instead. For example, if we want some kind of [[Queue|queue]], we could use this as well, but inserting always at index 0, the problem with that is that for each insertion we would have to move things.