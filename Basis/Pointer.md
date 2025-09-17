When working with variables, we must understand first of all what is a variable. In the RAM, we got an space of, lets say for example 8 GB, this means we have a capacity to store about 8 Billions bytes, but, what would 'storing bytes' mean? In case the ram is such as a list, when we create a variable, what we are doing is getting some free position on the ram and simply using them for that variable. Let's say the following C code:
```c
int main(){
	char[50] v;
}
```

As a char in C is 1 byte, when this variable 'v' is created, on the [[Stack|stack]] of the running program, we use get the last available position, and allocate 50 bytes, when this variable is unused, the 50 bytes are freed. So, one thing we know is that 'v' actually lives at some position on the ram, more specifically, the stack of the current program.
The problem is that when we try to pass variables to another place, we must do a copy. For example:
```c
#include <stdio.h>

typedef struct {
  uintptr_t v1;
  uintptr_t v2;
  uintptr_t v3;
} Ex;

void f(Ex val){
  printf("%p\n", &val);
}

int main(){
  Ex val = {};
  f(val);
  printf("%p", &val);
  return 0;
}
``` 
On running it, we can see the following:

```
◄ 0s ◎ gcc ptr.c -o ptr && ./ptr                   □ c/chararr ℂ v14.3.1-gcc 16:32
0x7fff3b3ca7b0
0x7fff3b3ca7d0
◄ 0s ◎
```
we can see that the positions are different, by subtracting the last 2 ones(0x7fff3b3ca7b0
-0x7fff3b3ca7d0), we see that the difference is 32, in case, bytes, so, we can see that the value 'f' uses is not the same value defined in main, so we can see that it is being copied before being used at 'f'. That is the normal pattern actually, we copy stuff to pass them between functions, but it has a downside. The most obvious is supposing you have an array with 4 kilobytes, and you call functions with it directly, each function call will copy that 4 kilobytes of memory, instead, we could simply pass the position the variable lives at and then read it from there, or modify. The way we do so is through pointers. Actually that code already uses pointers. A pointer is just a variable that holds a position on the memory, it depends on the [[Architecture|architecture]], if it's 32 bits, we then store 32 bits for so, thus, 4 bytes, if it's 64 bits, we then store 64 bits for so, thus, 8 bytes. 
Understand that a pointer is not necessarily the position of a variable, but simply a position on the memory. For sure it will have problems if we use some pointers incorrectly.
We can understand arrays as an contiguous amount of data. So, lets say:

```c
int val[24];
int* ptr = &val;
```

this will point to the first value of the array, or simply, where the array begins. We know that it's int, so we have allocated 96 bytes. To get the Nth number on the array where $$ 0 < N < 24 $$ we can do simply: `*(ptr + N)`. What happens is that, as the type is 'int', it's four bytes long, so, on pointer arithmetic, `ptr + 1` will walk exactly the amount of bytes required to go to the next value of the same size. Then, in actual bytes, `(ptr+1)` walks `ptr+sizeof(typeof ptr)`, in this case the type of the pointer is an int, then 4 bytes are walked. So `ptr+n` walks 'n' int's forwards, and then the ' * ' operator says that it's to dereference it. Then to get the 10th element on the array we will have: `*(ptr + 10)`. 
When we want to read something from an address, we must dereference that content, thus, go to that position on the memory and read that. It's already said before on `*(ptr+N)`. The ' * ' operator is used to talk about these values. When reading or writing via a reference, in general this operator is used before, for example:
```c
int main(){
	int val = 50;
	int b = &val;
	//suppose these exist;
	int a = *b;
	*b *= 4;
}
``` 
Both are valid. 'a' copies the value on 'b', thus, reads 50, because it points to a position on the memory which contains the int '50', and `*b *= 4` on that location, we multiply the current value by 4, thus 'val' will become '200' instead.
One occasion where this happens often is with dynamic allocation. For example:
```c
int main(){
	int* value = malloc(sizeof(int)*10); //an array of 10 ints
}
```
Here, a pointer must be returned because the value will live on the heap, and we must assign the data via dereference. This can be seen on [[Vector]], where the `a->b` is equivalent to `(*a).b` and `arr[n]` is the equivalent to `*(arr+n)`, which follows what was said about dereferences before