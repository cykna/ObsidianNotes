When we talk about Distributed Locks, we are mainly talking about distributed systems, before commenting on distributed Locks, we will talk about distributed systems.

 A distributed system is a collection of **independent  computers** (nodes) that work together and appear to the user as a single coherent system. Key characteristics:
 - Network Communication: nodes exchanges messages (they don't share memory directly)
- Concurrency: multiple machines can execute tasks simultaneously
- Partial failures: one machine can fail while others keep running (different from centralized systems).
- Consistency and coordination: since data may be spread across nodes, the system must handle synchronization, consensus, and fault tolerante(e.g., Paxos or Raft algorithms)
- Examples: distributes databases(Cassandra, MongoDb Cluster), distributed file systems (HDFS), coordination services (Zookeeper, Etcd), and cloud plataforms (AWS, Google Cloud)

In short:
> That’s a distributed system: **many people (computers) working together as if they were one.**

Now, back to Distributed Locks. Distributed locks are sophisticated techniques used to synchronize access to shared resources in distributed environments, ensuring that only one process or node can perform a critical operation at a time, preventing conflicts, inconsistencies, and possible data corruption.

In distributed systems, multiple processes/nodes may attempt to access the same critical resource at the same time (e.g., updating a bank account balance, processing the same queue message, writing a file, start a schedule, job). Local locks (mutexes, semaphores) are insufficient because they only control concurrency within a single process or machine. For this we need a locking mechanism that works across multiple machines connected over the network.

**A distributed lock must provide:**
1. Mutual Exclusion
	Only one client at a time can hold the lock.
2. Deadlock prevention
	If the client holding the lock crashes, the lock should eventually expire(lease or TTL)
3. Availability
	Even under failures, the system should continue granting locks.
4. Consistency
	No two clients should ever believe they both hold the same lock.
5. Fairness(**optional**)
	Locks can be granted in the order of requests (queue-based fairness).

**Commons implementations**

###### *Redis* (e.g., Redlock Algorithm)
- Each client sets a key with a TTL.
- If the client can successfully set the key in a majority of Redis nodes, it assumes the lock.
- TTL ensures auto-release if the client crashes.

**ASCII flow**:

```sh
Client A tries to lock "resource-1"
 ├──> Redis Node 1: OK
 ├──> Redis Node 2: OK
 └──> Redis Node 3: FAIL (timeout)

Majority acquired (2/3) → Client A holds the lock
```

###### *Zookeeper*
- Uses ephemeral znodes: each client creates a temporary node.
- The client with the smallest sequence number holds the lock.
- If the client disconnects, its znode disappears automatically.

**ASCII flow**:

```sh
/locks/resource-1/
  ├── lock-0001 (Client A)  <-- LOCK OWNER
  ├── lock-0002 (Client B)
  └── lock-0003 (Client C)
```

> If the **Client A** crashes, Zookeeper deletes lock-0001, and **Client B** becomes the new owner

###### *Etcd*
- Uses leases (time-limited key ownership).
- Clients acquire a key with PUT key --lease=10s.
- When the leases expires (or client crases), the key is removed
- Watchers notify other clients that the lock is free.


##### *General Architecture*

![[architecture-distributed-locks-system.png]]

>- All clients attempt to acquire a lock on resource X. 
>- Only one  succeeds at a time.
>- The lock expires unless it is renewed (lease).


**Summary**

Distributed locks are a coordination mechanism in distributed systems, typically implemented with a middleware like Redis, Zookeeper, Etcd, or Consul. They guarantee **mutual exclusion**, **fault tolerance, and consistency** when multiple processes compete for shared resources.