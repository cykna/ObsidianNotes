When building a tree, if trying to make it Vector based, one of the problems it will have is that the deletion at some index I is not O(1), instead O(N), that does happen because when the data is deleted, a gap originates, but, the must vector to be contiguous and able to accessed via indices correctly, so the content to the right of I($\forall  N \text{ where } I < N < Len$) ,  needs to be moved to the left, then, the cost to make so is defined as O(N). The reasons why this can be understood on [[Big O Notation]]
Based on that, if I have a tree that is vector based, the time for deletion will be slow as hell, then another kind of data structure must be required, some that makes able to work with deletion and insertion at O(1). We do can work with [[LinkedList|linked lists]] but it would be O(n) to search for elements. Then the solution is a data structure that contains info about a given type T in a contiguous way, when deleting keeps that gap and reuses, and can be fast for finding. Well, that's the case of a Slotmap.
Slotmaps are just as vectors, but they simply keep the gap of where should be removed and reinsert a new element there instead of in the back or the head of a Vector or a Queue. The core idea can be understood as the following:
```rust
struct SlotMap<T>{
	raw: Vec<T>,
	gaps: VecDeque<usize>
}

impl<T> SlotMap<T> {
	pub fn new() -> Self {
		Self {raw: Vec::new(), gaps:VecDeque::new()}
	}
	#[inline]
	pub fn push(&mut self, data: T) -> usize {
		if self.gaps.is_empty(){
			let out = self.raw.len();
			self.raw.push(data);
			out
		}else {
			let gap_index = self.gaps.pop_front().unwrap();
			self.raw[gap_index] = data;
			gap_index
		}
	}
	pub fn remove(&mut self, index:usize) -> Result<(), String> {
		if(index > self.raw.len()) {Err("Cannot remove element outside bounds".to_string())}
		else {
			self.gaps.push(index);
			Ok(())
		}
	}
}
```

Here we are simply storing the data and when requesting to delete at some index, we store it in a queue, when requesting to add another new, we simply check if there's some gap, if so, we write it there