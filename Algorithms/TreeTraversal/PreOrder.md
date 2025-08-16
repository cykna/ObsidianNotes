When working with trees, at some times we want to traverse it and work with the children before the parent, that method is called 'PreOrder'. For example, on making my UI library, I had to write a way to know which element I was clicking at, for so, it was required the usage of PreOrder.
Since the children are drawn after the parent, they're 'closer' to the screen, so it makes sense for them to be checked, then, i should check for it's parent after checking for them, which then, configures as a PreOrder traverse.
This can be understood better at the [[GenericTree]]. Supposing we traverse that tree using [[PosOrder]], and we print the numbers, the result would be something like `1,2,3,4,5,6,7,8,9,10`, thus, we are looking for the parent then for the children, but with our case its quite the opposite, in case we wanted `10,9,8,7,6,5,4,3,2,1`which will look for the children first.
Leaving the theory, a practical code using [[Recursion]] I made is the following:
```rust
///Tests if the `position` is inside the bounds of some child of `element` if not, check for `element`
    ///This function is recursive and used to follow z-index rules.
    ///Returns the Key of the deepest element that reaches so, if none matches, returns None
    pub fn find_deepest_at(
        &self,
        element_key: CandyKey,
        element: &CandyNode<P>,
        position: Vector2<f32>,
    ) -> Option<CandyKey> {
        for child in element.children() {
            if let Some(_) = self.test_hit(*child, self.elements.get(*child).unwrap(), position) {
                return Some(*child);
            };
        }
        let mut bounds = element.bounds();
        if let CandyElement::Text(_) = &element.inner {
            bounds.y -= bounds.w;
        }
        if in_bounds_of(bounds, position) {
            Some(element_key)
        } else {
            None
        }
    }
```
Where the function looks first for the children and then, if none return, we check for the element itself. Even though the code looks to be [[Big O Notation|O(N²)]], it is instead O(N) because it executes on every children of the given `element` exactly once
The source code of the given function can be found [[https://github.com/cykna/candy/blob/uitree/src/ui/tree/tree.rs|here]]
