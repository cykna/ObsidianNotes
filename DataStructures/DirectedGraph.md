A **Directed Graph** is, simply put, a graph in which the connections between nodes have a **defined direction**. In other words, each link (called an _edge_) indicates a path that goes from one node to another — but not necessarily the other way around. Sounds confusing? Don’t worry, the idea is simple: think of a system of one-way streets, where you can go from A to B, but not necessarily from B to A. Now, let’s dive deeper into how this works.

#### Formal definition

A **directed graph** (or **digraph**) is a mathematical structure defined as:

$G = (V, E)$

where:

- $V$ is the set of vertices (or nodes).
- $E \subseteq V \times V$ is the set of directed edges (that is, the set of edges E is a subset of the Cartesian product of V with itself).

Each edge $(u, v) \in E$ (meaning the pair $(u, v)$ belongs to $E$) represents a **unidirectional connection** from vertex $u$ to vertex $v$.
In other words, there is a path from $u$ to $v$, but not necessarily from  to .
##### Simple directed graph

It does not have multiple edges or self-loops.
$(u, v) \neq (v, u) \quad \text{and} \quad (v, v) \notin E$ 

> In a directed graph, the edge $(u, v)$ is **different** from the edge $(v, u)$; that is, the direction matters. 
> Moreover, there are no edges that start and end at the same vertex, since $(v, v) \notin E$ (there are no _loops_).
##### Weighted directed graph

Each edge has an associated weight or cost.

$E \subseteq V \times V \times \mathbb{R}$

> The set of edges $E$ is a subset of $V \times V \times \mathbb{R}$.

In the previous definition (without $\mathbb{R}$), each edge consists of an ordered pair $(u, v)$. Now, by including $\mathbb{R}$, each edge becomes an ordered triple:

$(u, v, w) \in E$ 

where:
- $u, v \in V$ → vertices of origin and destination,
- $w \in \mathbb{R}$ → the weight or cost associated with the edge.

> The set of edges E contains triples $(u, v, w)$, where $u$ and $v$ are vertices, and $w$ is a real number representing the weight of the edge from $u$ to $v$.

The value $w(u, v)$ can represent, for example, the distance, time, or cost of transitioning from $u$ to $v$.

##### Directed Acyclic Graph (DAG)

A directed graph without cycles, that is, **there does not exist a sequence of vertices**:

$v_1 \rightarrow v_2 \rightarrow \cdots \rightarrow v_n \rightarrow v_1$

This type is widely used to represent **dependencies** (for example, in compilers and build systems).

---
### Computational representation

There are two main representations of a directed graph:
###### Adjacency matrix

It is a matrix A of dimension $|V| \times |V|$ where:

$A_{ij} = \begin{cases} 1, & \text{if there is an edge from } v_i \text{ to } v_j \\ 0, & \text{otherwise} \end{cases}$

Example:

$A = \begin{bmatrix} 0 & 1 & 0 \\ 0 & 0 & 1 \\ 1 & 0 & 0 \end{bmatrix}$

It represents the graph:
$A \rightarrow B \rightarrow C \rightarrow A$

---
##### Adjacency list

More memory-efficient for sparse graphs. Each vertex maintains a list (or set) of vertices that can be reached directly from it.

In Go, we can implement it like this:

```go
var graph = make(map[string]map[string]bool)

func addEdge(from, to string) {
	if graph[from] == nil {
		graph[from] = make(map[string]bool)
	}
	graph[from][to] = true
}
```

Mathematically, this represents:

$Adj(v) = \{ u \in V \mid (v, u) \in E \}$

> The adjacent vertices of $v$ are the set of all vertices u belonging to $V$ such that the pair $(v, u)$ belongs to $E$.

---
##### **Operações básicas**

- **Insert vertix:** $V = V \cup \{v\}$
- **Insert edge:** $E = E \cup \{(u, v)\}$
- **Remove edge:** $E = E - \{(u, v)\}$
- **Check adjacency:** verify whether $(u, v) \in E$
- **Out-degree:** the number of edges leaving a vertex v:
    $\text{outdegree}(v) = |\{ (v, u) \in E \}|$
- **In-degree:** the number of edges arriving at v:
	$\text{indegree}(v) = |\{ (u, v) \in E \}|$

##### Observations

- A directed graph can contain **cycles** $(v_1 \rightarrow v_2 \rightarrow v_1)$.
- If there is a path $u \rightarrow v$ for every pair of vertices $u$, $v$, the graph is **strongly connected**.
- Conversely, if the graph is connected **when ignoring the directions**, it is **weakly connected**.

---

##### **Graphical visualization of a Digraph**
Using *Graphviz* (DOT Format)

```d
digraph G {
	A -> B;
	B -> C;
	C -> A;
}
```

It renders a directed cycle $A \rightarrow B \rightarrow C \rightarrow A.$

