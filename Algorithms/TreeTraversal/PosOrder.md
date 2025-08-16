PosOrder is practically the opposite of [[PreOrder]] when working with trees. [[PreOrder]] defines that something will happen with the children first, then, it will happen with the parent. PosOrder is the opposite, it happens with the parent first, and then the children. One example is an [[UI]] that is defined as a Tree, which isn't unusual. When rendering so, we cannot render the children before the parents, which would be categorized as PreOrder, instead, we MUST, draw first the parents and going deeper on the children, then, the children will appear on top of the parents. This can be reached by the following code:
```rust
///Renders the given `element` using the `painter` and it's children. `set` is used to get track of which
    ///elements were already drawn, and `key` is the key of the `element` is going to be drawed
    fn render_element(
        &self,
        painter: &mut P,
        element: &CandyNode<P>,
        set: &mut HashSet<CandyKey>,
        key: &CandyKey,
    ) {
        if set.contains(key) {
            return;
        }
        set.insert(*key);
        element.render(painter);
        for child_key in element.children() {
            if let Some(child) = self.elements.get(*child_key) {
                self.render_element(painter, child, set, child_key);
            }
        }
    }

    ///Render all the tree using the given `painter`
    pub fn render(&self, painter: &mut P) {
        let mut set = HashSet::new();
        for (key, el) in self.elements.iter() {
            if set.contains(&key) {
                continue;
            }
            self.render_element(painter, el, &mut set, &key);
        }
    }```
Note that all the logic is made first on the current `element` and then on the element `children` which calls the same function [[Recursion|recursively]]