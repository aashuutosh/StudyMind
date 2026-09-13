export const SAMPLE_DATA = {
  subject: "Computer Science & Engineering",
  title: "Operating Systems: Concurrency, Deadlocks & Virtual Memory",
  summary: "Comprehensive breakdown of core Operating System principles. Explores process concurrency, race conditions, synchronization primitives like Semaphores and Mutexes, the four necessary conditions for Coffman deadlocks, and virtual memory page replacement policies (LRU, FIFO). Essential for system design and technical interviews.",
  notes: [
    {
      heading: "Process Concurrency & Critical Section Problem",
      emoji: "⚡",
      bullets: [
        "A Critical Section is a segment of code where shared resources (memory, files) are accessed and modified concurrently.",
        "To prevent race conditions, solutions must guarantee: Mutual Exclusion, Progress, and Bounded Waiting.",
        "Disabling interrupts works only on single-core uniprocessors and fails in multi-core modern CPU architectures.",
        "Peterson's Algorithm provides a software-based dual-process solution using shared flag arrays and a turn variable.",
        "Hardware atomic instructions like TestAndSet() and CompareAndSwap() form the foundation of modern spinlocks."
      ]
    },
    {
      heading: "Synchronization Primitives: Mutex & Semaphores",
      emoji: "🔒",
      bullets: [
        "Mutex (Mutual Exclusion Lock) is a locking mechanism with ownership: only the thread that locked it can unlock it.",
        "Counting Semaphores maintain an integer value initialized to resource availability count.",
        "Wait() (P operation) decrements the semaphore counter; if negative, the calling process blocks.",
        "Signal() (V operation) increments the semaphore counter and awakens one sleeping process from the queue.",
        "Classic problems include Producer-Consumer (Bounded Buffer), Readers-Writers, and Dining Philosophers."
      ]
    },
    {
      heading: "Deadlocks & Coffman Conditions",
      emoji: "🛑",
      bullets: [
        "Deadlock occurs when every process in a set is waiting for an event caused only by another process in the same set.",
        "Mutual Exclusion: At least one resource must be held in a non-shareable mode.",
        "Hold and Wait: A process holds at least one resource while waiting for other allocated resources.",
        "No Preemption: Resources cannot be forcibly taken away; they are released voluntarily by the holding process.",
        "Circular Wait: A closed chain of processes exists such that each process holds resources needed by the next.",
        "Banker's Algorithm simulates resource allocation to evaluate safe states and avoid deadlock."
      ]
    },
    {
      heading: "Virtual Memory & Paging Architecture",
      emoji: "🧠",
      bullets: [
        "Virtual Memory decouples user logical memory from physical memory, permitting execution of partially loaded processes.",
        "The MMU (Memory Management Unit) translates logical addresses (Page Number + Offset) to Physical Frame Addresses.",
        "Translation Lookaside Buffer (TLB) acts as a high-speed hardware cache for page table lookups.",
        "Page Fault occurs when a referenced page is marked invalid (not currently mapped into physical RAM).",
        "Thrashing happens when the system spends excessive CPU time swapping pages in and out rather than executing instructions."
      ]
    },
    {
      heading: "Page Replacement Algorithms",
      emoji: "🔄",
      bullets: [
        "FIFO (First-In, First-Out): Simple queue policy, but susceptible to Belady's Anomaly (more frames cause more faults).",
        "Optimal (OPT/MIN): Replaces page that will not be used for longest future period; serves as theoretical benchmark.",
        "LRU (Least Recently Used): Approximates optimal by replacing the page not used for the longest elapsed past time.",
        "Second-Chance / Clock Algorithm: Practical LRU approximation using reference bits in a circular buffer."
      ]
    }
  ],
  keyTerms: [
    { term: "Mutual Exclusion", definition: "Requirement that only one process can access a shared critical section at any given moment." },
    { term: "Race Condition", definition: "A situation where concurrent thread execution order alters the final computation outcome." },
    { term: "Semaphore", definition: "A protected variable or abstract data type used for controlling access to common resources." },
    { term: "Deadlock", definition: "A state where execution cannot proceed because two or more processes wait on each other indefinitely." },
    { term: "TLB (Translation Lookaside Buffer)", definition: "A dedicated hardware associative memory caching recent virtual-to-physical address mappings." },
    { term: "Thrashing", definition: "A catastrophic state where excessive paging activity consumes majority of CPU cycles." }
  ],
  quiz: [
    {
      id: 1,
      question: "Which of the following is NOT one of Coffman's four necessary conditions for deadlock?",
      options: [
        "A) Mutual Exclusion",
        "B) Preemptive Scheduling",
        "C) Hold and Wait",
        "D) Circular Wait"
      ],
      correctIndex: 1,
      explanation: "Preemption PREVENTS deadlock. The necessary condition is 'No Preemption', meaning resources cannot be forcibly seized from a running process."
    },
    {
      id: 2,
      question: "What phenomenon occurs when allocating more physical frames paradoxically increases page fault rates in FIFO?",
      options: [
        "A) Banker's Dilemma",
        "B) Belady's Anomaly",
        "C) Thrashing Cascade",
        "D) Critical Inversion"
      ],
      correctIndex: 1,
      explanation: "Belady's Anomaly is a counter-intuitive behavior in First-In-First-Out (FIFO) page replacement where adding page frames yields more page faults."
    },
    {
      id: 3,
      question: "In semaphore operations, what happens when wait() (P operation) is called on a semaphore with value 0?",
      options: [
        "A) The value increments to 1 and executes immediately",
        "B) The process enters a waiting/blocked queue",
        "C) The OS raises a segmentation fault",
        "D) The semaphore value resets to initial count"
      ],
      correctIndex: 1,
      explanation: "When wait() is invoked on a semaphore with value <= 0, the calling thread blocks until another thread issues a signal() (V operation)."
    },
    {
      id: 4,
      question: "Which hardware component directly caches virtual-to-physical page frame translations?",
      options: [
        "A) L3 Data Cache",
        "B) DMA Controller",
        "C) Translation Lookaside Buffer (TLB)",
        "D) Instruction Register"
      ],
      correctIndex: 2,
      explanation: "The TLB (Translation Lookaside Buffer) is an associative hardware cache within the MMU storing recent page table translations to speed up memory access."
    },
    {
      id: 5,
      question: "What is the primary operational distinction between a Mutex and a Binary Semaphore?",
      options: [
        "A) Mutex has thread ownership; only lock-holding thread can unlock it",
        "B) Semaphores only function across separate network machines",
        "C) Mutexes allow up to 4 concurrent access grants",
        "D) Binary semaphores cannot be utilized for critical section safety"
      ],
      correctIndex: 0,
      explanation: "A Mutex enforces strict ownership (only the acquiring thread can release it), whereas a binary semaphore can be signaled/unlocked by any thread."
    }
  ]
};
